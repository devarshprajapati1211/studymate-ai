from datetime import date, datetime, timedelta
from fastapi import APIRouter
from bson import ObjectId
from app.db.mongodb import get_database
from app.core.security import get_password_hash, create_access_token
from app.schemas.user import Token, UserResponse
from app.services.priority_engine import calculate_subject_priority
from app.services.study_planner import generate_deterministic_plan

router = APIRouter(prefix="/demo", tags=["Demo Seed"])


@router.post("/seed", response_model=Token)
async def seed_demo_user():
    """
    Seeds and returns the official Alex demo profile with realistic college exam data:
    - DBMS: Hard, Exam in 5 days, 45% prep
    - Python: Medium, Exam in 10 days, 65% prep
    - Computer Networks: Hard, Exam in 12 days, 50% prep
    - Artificial Intelligence: Medium, Exam in 15 days, 70% prep
    3 hours/day, Mixed learning preference, pre-generated 7-day schedule + tasks with realistic completion history.
    """
    db = get_database()
    demo_email = "alex@studymate.ai"
    
    # 1. Upsert demo user
    user = await db.users.find_one({"email": demo_email})
    if not user:
        user_doc = {
            "name": "Alex Mercer",
            "email": demo_email,
            "password": get_password_hash("password123"),
            "is_onboarded": True,
            "created_at": datetime.utcnow()
        }
        res = await db.users.insert_one(user_doc)
        user_id = str(res.inserted_id)
    else:
        user_id = str(user["_id"])
        await db.users.update_one({"_id": user["_id"]}, {"$set": {"is_onboarded": True}})

    # 2. Upsert student profile
    student_doc = {
        "user_id": user_id,
        "name": "Alex Mercer",
        "college": "Apex Institute of Technology",
        "degree": "B.Tech",
        "branch": "Computer Science & Engineering",
        "year": "3rd Year (Semester VI)",
        "available_hours": 3.0,
        "preferred_start_time": "09:30",
        "preferred_end_time": "21:30",
        "preferred_break_duration": 15,
        "learning_preference": "Mixed",
        "is_onboarded": True,
        "updated_at": datetime.utcnow()
    }
    await db.students.update_one({"user_id": user_id}, {"$set": student_doc}, upsert=True)
    student = await db.students.find_one({"user_id": user_id})
    student_id = str(student["_id"])

    # 3. Clean and recreate demo subjects
    await db.subjects.delete_many({"student_id": student_id})
    await db.tasks.delete_many({"student_id": student_id})
    await db.study_plans.delete_many({"student_id": student_id})

    today = date.today()
    demo_subjects_raw = [
        {
            "name": "DBMS",
            "difficulty": "Hard",
            "exam_date": (today + timedelta(days=5)).strftime("%Y-%m-%d"),
            "preparation_percentage": 45,
            "importance": "High"
        },
        {
            "name": "Python",
            "difficulty": "Medium",
            "exam_date": (today + timedelta(days=10)).strftime("%Y-%m-%d"),
            "preparation_percentage": 65,
            "importance": "Medium"
        },
        {
            "name": "Computer Networks",
            "difficulty": "Hard",
            "exam_date": (today + timedelta(days=12)).strftime("%Y-%m-%d"),
            "preparation_percentage": 50,
            "importance": "High"
        },
        {
            "name": "Artificial Intelligence",
            "difficulty": "Medium",
            "exam_date": (today + timedelta(days=15)).strftime("%Y-%m-%d"),
            "preparation_percentage": 70,
            "importance": "Medium"
        }
    ]

    saved_subjects = []
    for s in demo_subjects_raw:
        p_info = calculate_subject_priority(
            name=s["name"],
            exam_date_str=s["exam_date"],
            difficulty=s["difficulty"],
            preparation_percentage=s["preparation_percentage"],
            importance=s["importance"]
        )
        s_doc = {
            "student_id": student_id,
            "name": s["name"],
            "difficulty": s["difficulty"],
            "exam_date": s["exam_date"],
            "preparation_percentage": s["preparation_percentage"],
            "importance": s["importance"],
            "priority_score": p_info["priority_score"],
            "priority_level": p_info["priority_level"],
            "priority_explanation": p_info["priority_explanation"],
            "days_until_exam": p_info["days_until_exam"],
            "created_at": datetime.utcnow()
        }
        res = await db.subjects.insert_one(s_doc)
        s_doc["_id"] = str(res.inserted_id)
        saved_subjects.append(s_doc)

    # 4. Generate structured 7-day study plan
    plan_data = generate_deterministic_plan(student_doc, saved_subjects, days_to_plan=7)

    plan_doc = {
        "student_id": student_id,
        "start_date": today.strftime("%Y-%m-%d"),
        "end_date": (today + timedelta(days=6)).strftime("%Y-%m-%d"),
        "daily_hours": 3.0,
        "ai_summary": "DBMS is your #1 priority because its exam is in only 5 days and preparation is 45%.",
        "recommendation": "Dedicate deep-work blocks to DBMS transactions and SQL queries, while sustaining Python revision.",
        "is_fallback_mode": True,
        "created_at": datetime.utcnow()
    }
    p_res = await db.study_plans.insert_one(plan_doc)
    plan_id = str(p_res.inserted_id)

    # 5. Insert today's tasks + weekly schedule tasks
    tasks_to_insert = []
    
    # Pre-add a couple completed tasks yesterday for realistic streak & progress
    yesterday_str = (today - timedelta(days=1)).strftime("%Y-%m-%d")
    tasks_to_insert.append({
        "student_id": student_id,
        "study_plan_id": plan_id,
        "subject_name": "DBMS",
        "title": "DBMS — Relational Algebra & Normalization",
        "duration_minutes": 60,
        "scheduled_date": yesterday_str,
        "priority": "HIGH",
        "completed": True,
        "completed_at": datetime.utcnow() - timedelta(days=1),
        "learning_mode": "Concept Revision",
        "created_at": datetime.utcnow() - timedelta(days=1)
    })
    tasks_to_insert.append({
        "student_id": student_id,
        "study_plan_id": plan_id,
        "subject_name": "Python",
        "title": "Python — OOP & Decorators Practice",
        "duration_minutes": 45,
        "scheduled_date": yesterday_str,
        "priority": "MEDIUM",
        "completed": True,
        "completed_at": datetime.utcnow() - timedelta(days=1),
        "learning_mode": "Practice",
        "created_at": datetime.utcnow() - timedelta(days=1)
    })

    # Today's tasks as specified in prompt:
    # ✓ DBMS — SQL Joins — 45 min
    # ○ DBMS — Transactions — 60 min
    # ○ Python — Functions — 30 min
    # ○ Revision — 30 min
    today_str = today.strftime("%Y-%m-%d")
    tasks_to_insert.append({
        "student_id": student_id,
        "study_plan_id": plan_id,
        "subject_name": "DBMS",
        "title": "DBMS — SQL Joins & Query Optimization",
        "duration_minutes": 45,
        "scheduled_date": today_str,
        "priority": "HIGH",
        "completed": True,  # 1 task completed for demonstration
        "completed_at": datetime.utcnow(),
        "learning_mode": "Practice",
        "created_at": datetime.utcnow()
    })
    tasks_to_insert.append({
        "student_id": student_id,
        "study_plan_id": plan_id,
        "subject_name": "DBMS",
        "title": "DBMS — Transactions & Concurrency Control",
        "duration_minutes": 60,
        "scheduled_date": today_str,
        "priority": "HIGH",
        "completed": False,
        "completed_at": None,
        "learning_mode": "Concept Revision",
        "created_at": datetime.utcnow()
    })
    tasks_to_insert.append({
        "student_id": student_id,
        "study_plan_id": plan_id,
        "subject_name": "Python",
        "title": "Python — Functions & Lambda Expressions",
        "duration_minutes": 30,
        "scheduled_date": today_str,
        "priority": "MEDIUM",
        "completed": False,
        "completed_at": None,
        "learning_mode": "Practice",
        "created_at": datetime.utcnow()
    })
    tasks_to_insert.append({
        "student_id": student_id,
        "study_plan_id": plan_id,
        "subject_name": "Computer Networks",
        "title": "Computer Networks — OSI vs TCP/IP Protocols Revision",
        "duration_minutes": 45,
        "scheduled_date": today_str,
        "priority": "HIGH",
        "completed": False,
        "completed_at": None,
        "learning_mode": "Concept Revision",
        "created_at": datetime.utcnow()
    })

    # Add upcoming days tasks
    for d_idx in range(1, 7):
        curr_d = (today + timedelta(days=d_idx)).strftime("%Y-%m-%d")
        tasks_to_insert.append({
            "student_id": student_id,
            "study_plan_id": plan_id,
            "subject_name": "DBMS" if d_idx % 2 == 1 else "Computer Networks",
            "title": f"DBMS — Indexing & B-Trees PYQs" if d_idx % 2 == 1 else "Computer Networks — Routing Algorithms",
            "duration_minutes": 90 if d_idx % 2 == 1 else 60,
            "scheduled_date": curr_d,
            "priority": "HIGH",
            "completed": False,
            "completed_at": None,
            "learning_mode": "Practice",
            "created_at": datetime.utcnow()
        })
        tasks_to_insert.append({
            "student_id": student_id,
            "study_plan_id": plan_id,
            "subject_name": "Python" if d_idx % 2 == 1 else "Artificial Intelligence",
            "title": f"Python — File I/O & Exception Handling" if d_idx % 2 == 1 else "Artificial Intelligence — Search Algorithms (A* & BFS)",
            "duration_minutes": 45,
            "scheduled_date": curr_d,
            "priority": "MEDIUM",
            "completed": False,
            "completed_at": None,
            "learning_mode": "Concept Revision",
            "created_at": datetime.utcnow()
        })

    await db.tasks.insert_many(tasks_to_insert)

    token = create_access_token(user_id)
    return Token(
        access_token=token,
        token_type="bearer",
        is_onboarded=True,
        user=UserResponse(
            id=user_id,
            name="Alex Mercer",
            email=demo_email,
            is_onboarded=True,
            created_at=datetime.utcnow()
        )
    )
