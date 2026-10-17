from datetime import datetime, date, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from bson import ObjectId
from app.db.mongodb import get_database
from app.core.deps import get_current_student
from app.schemas.task import TaskCreate, TaskResponse, TaskCompleteRequest
from app.services.study_planner import rebalance_missed_tasks

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("", response_model=List[TaskResponse])
async def list_tasks(
    scheduled_date: Optional[str] = Query(None, description="Filter by YYYY-MM-DD"),
    completed: Optional[bool] = Query(None),
    student: dict = Depends(get_current_student)
):
    db = get_database()
    query = {"student_id": student["id"]}
    if scheduled_date:
        query["scheduled_date"] = scheduled_date
    if completed is not None:
        query["completed"] = completed

    cursor = db.tasks.find(query).sort([("scheduled_date", 1), ("priority", -1)])
    tasks = await cursor.to_list(length=200)

    return [
        TaskResponse(
            id=str(t["_id"]),
            student_id=student["id"],
            study_plan_id=t.get("study_plan_id"),
            subject_id=t.get("subject_id"),
            subject_name=t.get("subject_name", "General Study"),
            title=t["title"],
            duration_minutes=int(t.get("duration_minutes", 45)),
            scheduled_date=t.get("scheduled_date", str(date.today())),
            priority=t.get("priority", "MEDIUM"),
            completed=t.get("completed", False),
            completed_at=t.get("completed_at"),
            learning_mode=t.get("learning_mode", "Practice")
        )
        for t in tasks
    ]


@router.post("", response_model=TaskResponse)
async def create_task(
    payload: TaskCreate,
    student: dict = Depends(get_current_student)
):
    db = get_database()
    doc = {
        "student_id": student["id"],
        "study_plan_id": None,
        "subject_id": payload.subject_id,
        "subject_name": payload.subject_name,
        "title": payload.title,
        "duration_minutes": payload.duration_minutes,
        "scheduled_date": payload.scheduled_date,
        "priority": payload.priority,
        "completed": False,
        "completed_at": None,
        "learning_mode": payload.learning_mode or "Practice",
        "created_at": datetime.utcnow()
    }
    res = await db.tasks.insert_one(doc)
    doc["id"] = str(res.inserted_id)

    return TaskResponse(
        id=doc["id"],
        student_id=student["id"],
        study_plan_id=None,
        subject_id=payload.subject_id,
        subject_name=payload.subject_name,
        title=payload.title,
        duration_minutes=payload.duration_minutes,
        scheduled_date=payload.scheduled_date,
        priority=payload.priority,
        completed=False,
        completed_at=None,
        learning_mode=payload.learning_mode or "Practice"
    )


@router.put("/{task_id}/complete")
async def toggle_task_completion(
    task_id: str,
    payload: TaskCompleteRequest,
    student: dict = Depends(get_current_student)
):
    db = get_database()
    try:
        obj_id = ObjectId(task_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid task ID format")

    task = await db.tasks.find_one({"_id": obj_id, "student_id": student["id"]})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    new_status = payload.completed
    completed_time = datetime.utcnow() if new_status else None

    await db.tasks.update_one(
        {"_id": obj_id},
        {"$set": {"completed": new_status, "completed_at": completed_time}}
    )

    # If completing task and subject is linked, give a slight incremental preparation progress boost
    if new_status and task.get("subject_id"):
        try:
            s_id = ObjectId(task["subject_id"])
            subj = await db.subjects.find_one({"_id": s_id})
            if subj:
                curr_prep = subj.get("preparation_percentage", 30)
                boosted = min(100, curr_prep + 3)
                await db.subjects.update_one({"_id": s_id}, {"$set": {"preparation_percentage": boosted}})
        except Exception:
            pass

    return {
        "status": "success",
        "task_id": task_id,
        "completed": new_status,
        "completed_at": completed_time
    }


@router.post("/reschedule-missed")
async def reschedule_missed(student: dict = Depends(get_current_student)):
    """
    Smart Plan Adjustment:
    Finds uncompleted tasks from prior dates, calculates missed study time,
    and redistributes into upcoming 3 days without overloading the student.
    """
    db = get_database()
    today_str = date.today().strftime("%Y-%m-%d")

    # Find uncompleted past tasks
    missed_cursor = db.tasks.find({
        "student_id": student["id"],
        "scheduled_date": {"$lt": today_str},
        "completed": False
    })
    missed_tasks = await missed_cursor.to_list(length=100)

    if not missed_tasks:
        return {
            "status": "up_to_date",
            "message": "All caught up! You have no missed past tasks.",
            "adjusted_tasks_count": 0
        }

    # Upcoming 3 days
    upcoming_days = []
    for i in range(1, 4):
        d = (date.today() + timedelta(days=i)).strftime("%Y-%m-%d")
        upcoming_days.append({"date": d})

    rebalance_result = rebalance_missed_tasks(missed_tasks, upcoming_days)

    # Insert new catch-up recovery tasks
    created_count = 0
    for nt in rebalance_result.get("new_tasks", []):
        doc = {
            "student_id": student["id"],
            "study_plan_id": None,
            "subject_name": nt["subject_name"],
            "title": nt["title"],
            "duration_minutes": nt["duration_minutes"],
            "scheduled_date": nt["scheduled_date"],
            "priority": nt["priority"],
            "completed": False,
            "completed_at": None,
            "learning_mode": nt["learning_mode"],
            "created_at": datetime.utcnow()
        }
        await db.tasks.insert_one(doc)
        created_count += 1

    # Mark old missed tasks as archived / rescheduled so they don't repeatedly trigger
    old_ids = [t["_id"] for t in missed_tasks]
    await db.tasks.update_many(
        {"_id": {"$in": old_ids}},
        {"$set": {"rescheduled": True, "completed": True, "notes": "Rescheduled by AI"}}
    )

    return {
        "status": "rescheduled",
        "message": rebalance_result.get("message"),
        "adjusted_tasks_count": created_count
    }
