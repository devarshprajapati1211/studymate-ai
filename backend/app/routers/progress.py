from datetime import date, datetime, timedelta
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from bson import ObjectId
from app.db.mongodb import get_database
from app.core.deps import get_current_student
from app.services.priority_engine import calculate_subject_priority

router = APIRouter(prefix="/progress", tags=["Progress Tracking"])


@router.get("")
async def get_progress_data(student: dict = Depends(get_current_student)):
    db = get_database()
    today = date.today()
    student_id = student["id"]

    # 1. Fetch Subjects
    subj_cursor = db.subjects.find({"student_id": student_id})
    subjects = await subj_cursor.to_list(length=100)

    # 2. Fetch Tasks (last 7 days + next 7 days for overall status)
    task_cursor = db.tasks.find({"student_id": student_id})
    all_tasks = await task_cursor.to_list(length=500)

    total_tasks = len(all_tasks)
    completed_tasks = len([t for t in all_tasks if t.get("completed", False)])
    pending_tasks = total_tasks - completed_tasks

    # Subject-wise analytics
    subject_progress_list = []
    total_prep_sum = 0

    for s in subjects:
        s_id_str = str(s["_id"])
        s_tasks = [t for t in all_tasks if t.get("subject_id") == s_id_str or t.get("subject_name") == s["name"]]
        s_completed = len([t for t in s_tasks if t.get("completed", False)])
        s_total = len(s_tasks)

        p_info = calculate_subject_priority(
            name=s["name"],
            exam_date_str=s.get("exam_date", str(today)),
            difficulty=s.get("difficulty", "Medium"),
            preparation_percentage=s.get("preparation_percentage", 30),
            importance=s.get("importance", "Medium")
        )

        prep = int(s.get("preparation_percentage", 30))
        total_prep_sum += prep

        logged_minutes = sum(t.get("duration_minutes", 45) for t in s_tasks if t.get("completed", False))

        subject_progress_list.append({
            "subject_id": s_id_str,
            "subject_name": s["name"],
            "difficulty": s["difficulty"],
            "preparation_percentage": prep,
            "completed_tasks": s_completed,
            "total_tasks": max(s_total, 1),
            "exam_countdown": p_info["days_until_exam"],
            "priority_level": p_info["priority_level"],
            "priority_score": p_info["priority_score"],
            "study_hours_logged": round(logged_minutes / 60, 1)
        })

    # Average overall preparation
    overall_progress = round(total_prep_sum / len(subjects)) if subjects else 0

    # 3. Weekly study hours calculation (Mon - Sun of current week)
    # Find start of current week (Monday)
    start_of_week = today - timedelta(days=today.weekday())
    weekly_hours_chart = []
    total_weekly_completed_minutes = 0

    for i in range(7):
        day_date = start_of_week + timedelta(days=i)
        day_str = day_date.strftime("%Y-%m-%d")
        day_name = day_date.strftime("%a")

        day_tasks = [t for t in all_tasks if t.get("scheduled_date") == day_str]
        day_planned = sum(t.get("duration_minutes", 45) for t in day_tasks) / 60.0
        day_completed = sum(t.get("duration_minutes", 45) for t in day_tasks if t.get("completed", False)) / 60.0

        total_weekly_completed_minutes += sum(t.get("duration_minutes", 45) for t in day_tasks if t.get("completed", False))

        weekly_hours_chart.append({
            "date": day_str,
            "day": day_name,
            "planned_hours": round(day_planned, 1),
            "completed_hours": round(day_completed, 1)
        })

    # 4. Streak calculation
    # Check consecutive days up to today with at least 1 completed task
    streak = 0
    check_day = today
    while True:
        d_str = check_day.strftime("%Y-%m-%d")
        had_completed = any(t.get("scheduled_date") == d_str and t.get("completed", False) for t in all_tasks)
        if had_completed:
            streak += 1
            check_day -= timedelta(days=1)
        elif check_day == today:
            # If nothing completed yet today, check if yesterday was completed to keep streak alive
            check_day -= timedelta(days=1)
            yest_str = check_day.strftime("%Y-%m-%d")
            had_yest = any(t.get("scheduled_date") == yest_str and t.get("completed", False) for t in all_tasks)
            if had_yest:
                streak += 1
                check_day -= timedelta(days=1)
            else:
                break
        else:
            break

    # If new account with no completed tasks yet, default streak to 1 if any task is done
    if streak == 0 and completed_tasks > 0:
        streak = 1

    # Overall study hours
    weekly_hours = round(total_weekly_completed_minutes / 60, 1)

    # Efficiency rating
    completion_rate = round((completed_tasks / max(total_tasks, 1)) * 100)
    if completion_rate >= 75:
        efficiency = "High Performance"
    elif completion_rate >= 45:
        efficiency = "On Track"
    else:
        efficiency = "Needs Catch-up"

    return {
        "overall_progress_percentage": overall_progress,
        "completed_tasks_count": completed_tasks,
        "pending_tasks_count": pending_tasks,
        "total_tasks_count": total_tasks,
        "completion_rate_percentage": completion_rate,
        "weekly_study_hours": weekly_hours,
        "streak_days": max(1, streak) if completed_tasks > 0 else 0,
        "subject_progress": subject_progress_list,
        "weekly_hours_chart": weekly_hours_chart,
        "efficiency_rating": efficiency
    }
