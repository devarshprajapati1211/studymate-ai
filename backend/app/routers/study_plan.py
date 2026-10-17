from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from app.db.mongodb import get_database
from app.core.deps import get_current_student
from app.schemas.study_plan import StudyPlanResponse, DaySchedule
from app.schemas.task import TaskResponse
from app.services.study_planner import generate_ai_study_plan

router = APIRouter(prefix="/study-plan", tags=["Study Plan"])


@router.get("", response_model=StudyPlanResponse)
async def get_study_plan(student: dict = Depends(get_current_student)):
    db = get_database()
    today_str = date.today().strftime("%Y-%m-%d")
    
    # Check for existing plan metadata
    plan = await db.study_plans.find_one(
        {"student_id": student["id"]},
        sort=[("created_at", -1)]
    )

    # Fetch tasks for the upcoming 7 days
    end_date_str = (date.today() + timedelta(days=6)).strftime("%Y-%m-%d")
    cursor = db.tasks.find({
        "student_id": student["id"],
        "scheduled_date": {"$gte": today_str, "$lte": end_date_str}
    }).sort([("scheduled_date", 1), ("priority", -1)])
    
    tasks = await cursor.to_list(length=100)

    # If no tasks exist or no plan exists, automatically generate initial plan
    if not tasks:
        subj_cursor = db.subjects.find({"student_id": student["id"]})
        subjects = await subj_cursor.to_list(length=50)
        
        if subjects:
            plan_data = await generate_ai_study_plan(student, subjects)
            # Create new study plan doc
            plan_doc = {
                "student_id": student["id"],
                "start_date": today_str,
                "end_date": end_date_str,
                "daily_hours": float(student.get("available_hours", 3.0)),
                "ai_summary": plan_data["summary"],
                "recommendation": plan_data["recommendation"],
                "is_fallback_mode": plan_data.get("is_fallback_mode", True),
                "created_at": datetime.utcnow()
            }
            plan_res = await db.study_plans.insert_one(plan_doc)
            plan_id = str(plan_res.inserted_id)

            # Insert tasks
            new_tasks = []
            for t in plan_data.get("all_tasks", []):
                new_tasks.append({
                    "student_id": student["id"],
                    "study_plan_id": plan_id,
                    "subject_id": t.get("subject_id"),
                    "subject_name": t.get("subject_name"),
                    "title": t.get("title"),
                    "duration_minutes": t.get("duration_minutes", 45),
                    "scheduled_date": t.get("scheduled_date"),
                    "priority": t.get("priority", "MEDIUM"),
                    "completed": False,
                    "completed_at": None,
                    "learning_mode": t.get("learning_mode", "Practice"),
                    "created_at": datetime.utcnow()
                })
            if new_tasks:
                await db.tasks.insert_many(new_tasks)
            
            # Re-query newly created tasks
            cursor = db.tasks.find({
                "student_id": student["id"],
                "scheduled_date": {"$gte": today_str, "$lte": end_date_str}
            }).sort([("scheduled_date", 1), ("priority", -1)])
            tasks = await cursor.to_list(length=100)
            plan = plan_doc
            plan["_id"] = plan_res.inserted_id

    # Group tasks by day (7 days)
    schedule_by_day = []
    for day_offset in range(7):
        curr_d = date.today() + timedelta(days=day_offset)
        curr_d_str = curr_d.strftime("%Y-%m-%d")
        curr_day_name = curr_d.strftime("%A")

        day_tasks = [
            TaskResponse(
                id=str(t["_id"]),
                student_id=student["id"],
                study_plan_id=t.get("study_plan_id"),
                subject_id=t.get("subject_id"),
                subject_name=t.get("subject_name", "General"),
                title=t["title"],
                duration_minutes=int(t.get("duration_minutes", 45)),
                scheduled_date=t.get("scheduled_date", curr_d_str),
                priority=t.get("priority", "MEDIUM"),
                completed=t.get("completed", False),
                completed_at=t.get("completed_at"),
                learning_mode=t.get("learning_mode", "Concept Revision")
            )
            for t in tasks if t.get("scheduled_date") == curr_d_str
        ]

        schedule_by_day.append(DaySchedule(
            date=curr_d_str,
            day_name=curr_day_name,
            total_minutes=sum(t.duration_minutes for t in day_tasks),
            tasks=day_tasks
        ))

    total_tasks_count = len(tasks)
    completed_tasks_count = len([t for t in tasks if t.get("completed", False)])

    return StudyPlanResponse(
        id=str(plan["_id"]) if plan and "_id" in plan else "default_plan",
        student_id=student["id"],
        start_date=today_str,
        end_date=end_date_str,
        daily_hours=float(student.get("available_hours", 3.0)),
        ai_summary=plan.get("ai_summary", "AI Study Plan customized to your examination calendar.") if plan else "AI Study Plan customized to your examination calendar.",
        recommendation=plan.get("recommendation", "Balance your study load and review formula sheets.") if plan else "Balance your study load and review formula sheets.",
        is_fallback_mode=plan.get("is_fallback_mode", True) if plan else True,
        schedule=schedule_by_day,
        total_tasks=total_tasks_count,
        completed_tasks=completed_tasks_count
    )


@router.post("/regenerate", response_model=StudyPlanResponse)
async def regenerate_plan(student: dict = Depends(get_current_student)):
    """
    Regenerate My Plan:
    AI recalculates study allocations considering current date, remaining days until exams,
    and current subject preparation levels.
    """
    db = get_database()
    today_str = date.today().strftime("%Y-%m-%d")

    # Fetch active subjects
    subj_cursor = db.subjects.find({"student_id": student["id"]})
    subjects = await subj_cursor.to_list(length=50)

    if not subjects:
        raise HTTPException(status_code=400, detail="No subjects found. Please add subjects first.")

    # Remove uncompleted future tasks (keep completed past tasks for progress history)
    await db.tasks.delete_many({
        "student_id": student["id"],
        "scheduled_date": {"$gte": today_str},
        "completed": False
    })

    # Generate fresh plan
    plan_data = await generate_ai_study_plan(student, subjects)

    end_date_str = (date.today() + timedelta(days=6)).strftime("%Y-%m-%d")
    plan_doc = {
        "student_id": student["id"],
        "start_date": today_str,
        "end_date": end_date_str,
        "daily_hours": float(student.get("available_hours", 3.0)),
        "ai_summary": plan_data["summary"],
        "recommendation": plan_data["recommendation"],
        "is_fallback_mode": plan_data.get("is_fallback_mode", True),
        "created_at": datetime.utcnow()
    }
    plan_res = await db.study_plans.insert_one(plan_doc)
    plan_id = str(plan_res.inserted_id)

    # Insert freshly scheduled tasks
    new_tasks = []
    for t in plan_data.get("all_tasks", []):
        new_tasks.append({
            "student_id": student["id"],
            "study_plan_id": plan_id,
            "subject_id": t.get("subject_id"),
            "subject_name": t.get("subject_name"),
            "title": t.get("title"),
            "duration_minutes": t.get("duration_minutes", 45),
            "scheduled_date": t.get("scheduled_date"),
            "priority": t.get("priority", "MEDIUM"),
            "completed": False,
            "completed_at": None,
            "learning_mode": t.get("learning_mode", "Practice"),
            "created_at": datetime.utcnow()
        })
    if new_tasks:
        await db.tasks.insert_many(new_tasks)

    return await get_study_plan(student)
