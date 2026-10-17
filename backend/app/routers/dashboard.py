from datetime import date, datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends
from bson import ObjectId
from app.db.mongodb import get_database
from app.core.deps import get_current_student
from app.services.priority_engine import calculate_subject_priority

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("")
async def get_dashboard(student: dict = Depends(get_current_student)):
    db = get_database()
    today_str = date.today().strftime("%Y-%m-%d")
    
    # 1. Fetch subjects
    subj_cursor = db.subjects.find({"student_id": student["id"]})
    raw_subjects = await subj_cursor.to_list(length=100)

    scored_subjects = []
    for s in raw_subjects:
        p_info = calculate_subject_priority(
            name=s.get("name", ""),
            exam_date_str=s.get("exam_date", today_str),
            difficulty=s.get("difficulty", "Medium"),
            preparation_percentage=s.get("preparation_percentage", 30),
            importance=s.get("importance", "Medium")
        )
        scored_subjects.append({
            "id": str(s["_id"]),
            "name": s["name"],
            "difficulty": s["difficulty"],
            "exam_date": s["exam_date"],
            "preparation_percentage": int(s.get("preparation_percentage", 0)),
            "importance": s.get("importance", "Medium"),
            "days_until_exam": p_info["days_until_exam"],
            "priority_score": p_info["priority_score"],
            "priority_level": p_info["priority_level"],
            "priority_explanation": p_info["priority_explanation"],
            "badge_symbol": p_info["badge_symbol"]
        })

    # Sort subjects: closest upcoming exam & highest priority
    scored_subjects.sort(key=lambda s: s["priority_score"], reverse=True)

    # Closest upcoming exam (positive days or 0)
    upcoming_exams = [s for s in scored_subjects if s["days_until_exam"] >= 0]
    upcoming_exams.sort(key=lambda s: s["days_until_exam"])
    closest_exam = upcoming_exams[0] if upcoming_exams else (scored_subjects[0] if scored_subjects else None)

    # Top priority subject
    top_priority_subject = scored_subjects[0] if scored_subjects else None

    # 2. Fetch today's tasks
    task_cursor = db.tasks.find({
        "student_id": student["id"],
        "scheduled_date": today_str
    }).sort([("priority", -1), ("duration_minutes", -1)])
    raw_tasks = await task_cursor.to_list(length=50)

    today_tasks = [
        {
            "id": str(t["_id"]),
            "student_id": student["id"],
            "subject_id": t.get("subject_id"),
            "subject_name": t.get("subject_name", "General"),
            "title": t["title"],
            "duration_minutes": int(t.get("duration_minutes", 45)),
            "scheduled_date": t.get("scheduled_date", today_str),
            "priority": t.get("priority", "MEDIUM"),
            "completed": t.get("completed", False),
            "completed_at": t.get("completed_at"),
            "learning_mode": t.get("learning_mode", "Practice")
        }
        for t in raw_tasks
    ]

    # Calculate today's study hours
    target_hours = float(student.get("available_hours", 3.0))
    completed_minutes = sum(t["duration_minutes"] for t in today_tasks if t["completed"])
    total_planned_minutes = sum(t["duration_minutes"] for t in today_tasks)
    
    # Progress calculations
    completed_tasks_today = len([t for t in today_tasks if t["completed"]])
    total_tasks_today = len(today_tasks)

    # Overall subject prep average
    if scored_subjects:
        avg_prep = round(sum(s["preparation_percentage"] for s in scored_subjects) / len(scored_subjects))
    else:
        avg_prep = 0

    # Greeting based on local hour
    current_hour = datetime.now().hour
    if current_hour < 12:
        greeting_time = "Good Morning"
    elif current_hour < 17:
        greeting_time = "Good Afternoon"
    else:
        greeting_time = "Good Evening"

    student_name = student.get("name", "Alex")
    
    return {
        "greeting": f"{greeting_time}, {student_name} 👋",
        "student_name": student_name,
        "overall_study_progress": avg_prep,
        "today_study_hours": {
            "completed": round(completed_minutes / 60, 1),
            "target": target_hours,
            "total_planned": round(total_planned_minutes / 60, 1)
        },
        "subjects_count": len(scored_subjects),
        "upcoming_exam": {
            "name": closest_exam["name"] if closest_exam else "None scheduled",
            "days_remaining": closest_exam["days_until_exam"] if closest_exam else 0,
            "exam_date": closest_exam["exam_date"] if closest_exam else ""
        } if closest_exam else None,
        "today_priority": {
            "subject_name": top_priority_subject["name"] if top_priority_subject else None,
            "days_remaining": top_priority_subject["days_until_exam"] if top_priority_subject else 0,
            "preparation_percentage": top_priority_subject["preparation_percentage"] if top_priority_subject else 0,
            "difficulty": top_priority_subject["difficulty"] if top_priority_subject else "Medium",
            "priority_score": top_priority_subject["priority_score"] if top_priority_subject else 0,
            "priority_level": top_priority_subject["priority_level"] if top_priority_subject else "MEDIUM",
            "explanation": top_priority_subject["priority_explanation"] if top_priority_subject else ""
        } if top_priority_subject else None,
        "today_tasks": today_tasks,
        "tasks_completed_count": completed_tasks_today,
        "tasks_total_count": total_tasks_today
    }
