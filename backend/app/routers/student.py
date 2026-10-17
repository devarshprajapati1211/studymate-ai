from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from app.db.mongodb import get_database
from app.core.deps import get_current_user, get_current_student
from app.schemas.student import StudentProfileUpdate, OnboardingRequest, StudentResponse
from app.services.priority_engine import calculate_subject_priority
from app.services.study_planner import generate_deterministic_plan

router = APIRouter(prefix="/student", tags=["Student Profile"])


@router.get("/profile", response_model=StudentResponse)
async def get_profile(student: dict = Depends(get_current_student)):
    return StudentResponse(
        id=student["id"],
        user_id=student["user_id"],
        name=student.get("name", ""),
        college=student.get("college", ""),
        degree=student.get("degree", ""),
        branch=student.get("branch", ""),
        year=student.get("year", ""),
        available_hours=float(student.get("available_hours", 3.0)),
        preferred_start_time=student.get("preferred_start_time", "09:00"),
        preferred_end_time=student.get("preferred_end_time", "21:00"),
        preferred_break_duration=int(student.get("preferred_break_duration", 15)),
        learning_preference=student.get("learning_preference", "Mixed"),
        is_onboarded=student.get("is_onboarded", False)
    )


@router.put("/profile", response_model=StudentResponse)
async def update_profile(
    profile_data: StudentProfileUpdate,
    student: dict = Depends(get_current_student)
):
    db = get_database()
    update_fields = {k: v for k, v in profile_data.dict(exclude_unset=True).items() if v is not None}
    
    if "name" in update_fields:
        await db.users.update_one({"_id": ObjectId(student["user_id"])}, {"$set": {"name": update_fields["name"]}})

    await db.students.update_one(
        {"_id": ObjectId(student["id"])},
        {"$set": update_fields}
    )
    
    updated = await db.students.find_one({"_id": ObjectId(student["id"])})
    updated["id"] = str(updated["_id"])
    return StudentResponse(
        id=updated["id"],
        user_id=updated["user_id"],
        name=updated.get("name", ""),
        college=updated.get("college", ""),
        degree=updated.get("degree", ""),
        branch=updated.get("branch", ""),
        year=updated.get("year", ""),
        available_hours=float(updated.get("available_hours", 3.0)),
        preferred_start_time=updated.get("preferred_start_time", "09:00"),
        preferred_end_time=updated.get("preferred_end_time", "21:00"),
        preferred_break_duration=int(updated.get("preferred_break_duration", 15)),
        learning_preference=updated.get("learning_preference", "Mixed"),
        is_onboarded=updated.get("is_onboarded", False)
    )


@router.post("/onboarding")
async def complete_onboarding(
    payload: OnboardingRequest,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    user_id = current_user["id"]

    # 1. Update Student Profile
    student_update = {
        "name": payload.name,
        "college": payload.college,
        "degree": payload.degree,
        "branch": payload.branch,
        "year": payload.year,
        "available_hours": payload.available_hours,
        "preferred_start_time": payload.preferred_start_time,
        "preferred_end_time": payload.preferred_end_time,
        "preferred_break_duration": payload.preferred_break_duration,
        "learning_preference": payload.learning_preference,
        "is_onboarded": True,
        "updated_at": datetime.utcnow()
    }
    
    await db.students.update_one(
        {"user_id": user_id},
        {"$set": student_update},
        upsert=True
    )
    student = await db.students.find_one({"user_id": user_id})
    student_id = str(student["_id"])

    # Update user table name and is_onboarded
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"name": payload.name, "is_onboarded": True}}
    )

    # 2. Insert Subjects with deterministic priority calculation
    # Clear any old subjects/tasks for this student
    await db.subjects.delete_many({"student_id": student_id})
    await db.tasks.delete_many({"student_id": student_id})
    await db.study_plans.delete_many({"student_id": student_id})

    created_subjects = []
    for s in payload.subjects:
        p_info = calculate_subject_priority(
            name=s.name,
            exam_date_str=s.exam_date,
            difficulty=s.difficulty,
            preparation_percentage=s.preparation_percentage,
            importance=s.importance
        )
        s_doc = {
            "student_id": student_id,
            "name": s.name,
            "difficulty": s.difficulty,
            "exam_date": s.exam_date,
            "preparation_percentage": s.preparation_percentage,
            "importance": s.importance,
            "priority_score": p_info["priority_score"],
            "priority_level": p_info["priority_level"],
            "priority_explanation": p_info["priority_explanation"],
            "days_until_exam": p_info["days_until_exam"],
            "created_at": datetime.utcnow()
        }
        res = await db.subjects.insert_one(s_doc)
        s_doc["_id"] = str(res.inserted_id)
        created_subjects.append(s_doc)

    # 3. Generate Initial Study Plan & Tasks
    plan_data = generate_deterministic_plan(student_update, created_subjects, days_to_plan=7)
    
    # Save study plan record
    plan_doc = {
        "student_id": student_id,
        "start_date": date.today().strftime("%Y-%m-%d"),
        "end_date": plan_data["schedule_by_day"][-1]["date"] if plan_data["schedule_by_day"] else "",
        "daily_hours": payload.available_hours,
        "ai_summary": plan_data["summary"],
        "recommendation": plan_data["recommendation"],
        "is_fallback_mode": True,
        "created_at": datetime.utcnow()
    }
    plan_res = await db.study_plans.insert_one(plan_doc)
    plan_id = str(plan_res.inserted_id)

    # Save tasks to database
    tasks_to_insert = []
    for t in plan_data.get("all_tasks", []):
        tasks_to_insert.append({
            "student_id": student_id,
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

    if tasks_to_insert:
        await db.tasks.insert_many(tasks_to_insert)

    return {
        "status": "success",
        "message": "Onboarding completed successfully! Study plan generated.",
        "student_id": student_id,
        "plan_id": plan_id,
        "subjects_count": len(created_subjects),
        "tasks_count": len(tasks_to_insert)
    }
