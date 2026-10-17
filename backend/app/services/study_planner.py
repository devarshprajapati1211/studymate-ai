from datetime import date, datetime, timedelta
from typing import List, Dict, Any, Optional
import httpx
import json
import logging
from app.core.config import settings
from app.services.priority_engine import calculate_subject_priority

logger = logging.getLogger("studymate.planner")

DEFAULT_TOPIC_TEMPLATES = [
    "High-Yield Concept Revision",
    "Important Formulae & Derivations",
    "Previous-Year Questions (PYQs)",
    "Core Problem Solving & Practice",
    "Difficult Topics Deep Dive",
    "Quick Flashcard & Active Recall",
    "Full-Length Mock Assessment",
    "Error Log Analysis & Weak Spot Review",
    "Summary Sheet & Mind Map Review"
]


def generate_deterministic_plan(
    student_profile: Dict[str, Any],
    subjects: List[Dict[str, Any]],
    days_to_plan: int = 7
) -> Dict[str, Any]:
    """
    Algorithmic study plan generator.
    Distributes daily available hours proportionally according to subject priorities.
    """
    if not subjects:
        return {
            "summary": "No subjects registered yet. Add your subjects to generate a custom study plan.",
            "daily_hours": float(student_profile.get("available_hours", 3.0)),
            "plan": [],
            "schedule_by_day": [],
            "recommendation": "Add your upcoming semester subjects to unlock personalized AI scheduling.",
            "is_fallback_mode": True
        }

    daily_hours = float(student_profile.get("available_hours", 3.0))
    learning_pref = student_profile.get("learning_preference", "Mixed")

    # Recalculate priorities for all subjects
    scored_subjects = []
    total_priority_weight = 0
    for subj in subjects:
        p_info = calculate_subject_priority(
            name=subj.get("name", "Subject"),
            exam_date_str=subj.get("exam_date", str(date.today() + timedelta(days=10))),
            difficulty=subj.get("difficulty", "Medium"),
            preparation_percentage=subj.get("preparation_percentage", 30),
            importance=subj.get("importance", "Medium")
        )
        weight = p_info["priority_score"]
        total_priority_weight += weight
        scored_subjects.append({
            **subj,
            **p_info,
            "weight": weight
        })

    # Sort descending by priority score
    scored_subjects.sort(key=lambda s: s["priority_score"], reverse=True)

    today = date.today()
    schedule_by_day = []
    all_generated_tasks = []

    # Map learning preferences to realistic task types
    task_types = {
        "Reading": ["High-Yield Concept Revision", "Theory & Definitions Review", "Textbook Reference Notes"],
        "Videos": ["Concept Lecture Revision", "Video Walkthrough & Animation Review", "Case Study Analysis"],
        "Practice": ["Previous-Year Questions (PYQs)", "Core Numerical Practice", "Timed Mock Test"],
        "Mixed": [
            "Concept Revision & Core Notes",
            "Previous-Year Questions (PYQs)",
            "Problem Solving Practice",
            "Mock Test & Error Log Review",
            "Formulae & Mind Map Review"
        ]
    }.get(learning_pref, DEFAULT_TOPIC_TEMPLATES)

    total_daily_minutes = int(daily_hours * 60)

    # Determine highest priority subject for narrative summary
    top_subject = scored_subjects[0] if scored_subjects else None

    for d_idx in range(days_to_plan):
        curr_date = today + timedelta(days=d_idx)
        curr_date_str = curr_date.strftime("%Y-%m-%d")
        day_name = curr_date.strftime("%A")

        day_tasks = []
        allocated_minutes = 0

        # High priority gets first chunk, 2nd gets next chunk
        # If top subject has exam in <= 3 days, allocate 60-70% of the day to it
        is_crunch_time = top_subject and top_subject["days_until_exam"] <= 5

        if len(scored_subjects) == 1:
            # Single subject
            chunk1 = min(90, total_daily_minutes)
            chunk2 = max(0, total_daily_minutes - chunk1)
            t_name1 = task_types[d_idx % len(task_types)]
            day_tasks.append({
                "subject_id": str(top_subject.get("_id", "")),
                "subject_name": top_subject["name"],
                "title": f"{top_subject['name']} — {t_name1}",
                "duration_minutes": chunk1,
                "priority": top_subject["priority_level"],
                "scheduled_date": curr_date_str,
                "learning_mode": learning_pref
            })
            if chunk2 >= 30:
                t_name2 = task_types[(d_idx + 1) % len(task_types)]
                day_tasks.append({
                    "subject_id": str(top_subject.get("_id", "")),
                    "subject_name": top_subject["name"],
                    "title": f"{top_subject['name']} — {t_name2}",
                    "duration_minutes": chunk2,
                    "priority": top_subject["priority_level"],
                    "scheduled_date": curr_date_str,
                    "learning_mode": learning_pref
                })
        else:
            # Rotate subjects while emphasizing high priority
            # Select 2 to 3 subjects per day depending on hours
            if is_crunch_time:
                # 60% top subject, 40% second
                s1 = top_subject
                remaining_candidates = [s for s in scored_subjects if s != top_subject]
                s2 = remaining_candidates[d_idx % len(remaining_candidates)]
                
                m1 = int(total_daily_minutes * 0.60)
                m2 = total_daily_minutes - m1
                
                t_type1 = task_types[(d_idx * 2) % len(task_types)]
                t_type2 = task_types[(d_idx * 2 + 1) % len(task_types)]
                
                day_tasks.append({
                    "subject_id": str(s1.get("_id", "")),
                    "subject_name": s1["name"],
                    "title": f"{s1['name']} — {t_type1}",
                    "duration_minutes": m1,
                    "priority": s1["priority_level"],
                    "scheduled_date": curr_date_str,
                    "learning_mode": learning_pref
                })
                day_tasks.append({
                    "subject_id": str(s2.get("_id", "")),
                    "subject_name": s2["name"],
                    "title": f"{s2['name']} — {t_type2}",
                    "duration_minutes": m2,
                    "priority": s2["priority_level"],
                    "scheduled_date": curr_date_str,
                    "learning_mode": learning_pref
                })
            else:
                # Balanced distribution
                # Pick 2 subjects for the day based on rotation weighted by priority
                primary_idx = d_idx % len(scored_subjects)
                secondary_idx = (d_idx + 1) % len(scored_subjects)
                s1 = scored_subjects[primary_idx]
                s2 = scored_subjects[secondary_idx]

                m1 = round((total_daily_minutes * 0.60) / 15) * 15
                m2 = max(30, total_daily_minutes - m1)

                t_type1 = task_types[(d_idx) % len(task_types)]
                t_type2 = task_types[(d_idx + 2) % len(task_types)]

                day_tasks.append({
                    "subject_id": str(s1.get("_id", "")),
                    "subject_name": s1["name"],
                    "title": f"{s1['name']} — {t_type1}",
                    "duration_minutes": m1,
                    "priority": s1["priority_level"],
                    "scheduled_date": curr_date_str,
                    "learning_mode": learning_pref
                })
                day_tasks.append({
                    "subject_id": str(s2.get("_id", "")),
                    "subject_name": s2["name"],
                    "title": f"{s2['name']} — {t_type2}",
                    "duration_minutes": m2,
                    "priority": s2["priority_level"],
                    "scheduled_date": curr_date_str,
                    "learning_mode": learning_pref
                })

        schedule_by_day.append({
            "date": curr_date_str,
            "day_name": day_name,
            "total_minutes": sum(t["duration_minutes"] for t in day_tasks),
            "tasks": day_tasks
        })
        all_generated_tasks.extend(day_tasks)

    # Humanized summary and recommendation
    if top_subject:
        summary = (
            f"{top_subject['name']} should receive the highest priority because its exam is "
            f"in {top_subject['days_until_exam']} days and preparation is currently at {top_subject['preparation_percentage']}%."
        )
        recommendation = (
            f"Focus intensely on {top_subject['name']} over the next few days while maintaining regular revision "
            f"slots for your other subjects. Keep study sessions under 90 minutes with 15-minute breaks."
        )
    else:
        summary = "Balanced study distribution across your registered curriculum."
        recommendation = "Maintain consistent study blocks and review high-yield questions."

    return {
        "summary": summary,
        "daily_hours": daily_hours,
        "plan": [
            {
                "subject": t["subject_name"],
                "topic": t["title"].split(" — ")[-1] if " — " in t["title"] else t["title"],
                "duration_minutes": t["duration_minutes"],
                "priority": t["priority"]
            }
            for t in all_generated_tasks[:6]
        ],
        "schedule_by_day": schedule_by_day,
        "all_tasks": all_generated_tasks,
        "recommendation": recommendation,
        "is_fallback_mode": True
    }


async def generate_ai_study_plan(
    student_profile: Dict[str, Any],
    subjects: List[Dict[str, Any]],
    previous_progress: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Generates study plan using LLM if available, otherwise seamlessly falls back to
    deterministic priority-weighted generator.
    """
    # Try LLM if OPENAI_API_KEY or GEMINI_API_KEY is configured
    if settings.OPENAI_API_KEY and len(settings.OPENAI_API_KEY) > 10:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                prompt_content = f"""
You are StudyMate AI, an expert college study schedule strategist.
Student Info:
- Available study hours/day: {student_profile.get('available_hours', 3.0)}
- Learning preference: {student_profile.get('learning_preference', 'Mixed')}
- Subjects: {json.dumps([{
    'name': s.get('name'),
    'difficulty': s.get('difficulty'),
    'exam_date': s.get('exam_date'),
    'prep': s.get('preparation_percentage'),
    'importance': s.get('importance')
} for s in subjects])}

Generate a concise, structured JSON study strategy:
{{
  "summary": "1-2 sentence overview of priorities",
  "recommendation": "1-2 actionable tips for success"
}}
Return ONLY valid raw JSON.
"""
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
                    json={
                        "model": "gpt-4o-mini",
                        "messages": [{"role": "user", "content": prompt_content}],
                        "temperature": 0.3
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    content = data["choices"][0]["message"]["content"]
                    parsed = json.loads(content.strip().strip("```json").strip("```"))
                    # Generate deterministic schedule structure and overlay AI narrative
                    deterministic = generate_deterministic_plan(student_profile, subjects)
                    deterministic["summary"] = parsed.get("summary", deterministic["summary"])
                    deterministic["recommendation"] = parsed.get("recommendation", deterministic["recommendation"])
                    deterministic["is_fallback_mode"] = False
                    return deterministic
        except Exception as e:
            logger.warning(f"LLM generation failed, falling back to deterministic: {e}")

    # Deterministic fallback (guaranteed reliable and fast)
    return generate_deterministic_plan(student_profile, subjects)


def rebalance_missed_tasks(
    missed_tasks: List[Dict[str, Any]],
    upcoming_schedule_days: List[Dict[str, Any]],
    max_extra_minutes_per_day: int = 30
) -> Dict[str, Any]:
    """
    Smart Plan Adjustment:
    When a student misses tasks, recalculates remaining days by redistributing
    the missed workload incrementally across upcoming days without overwhelming the student.
    """
    if not missed_tasks or not upcoming_schedule_days:
        return {
            "message": "No missed tasks or upcoming days to adjust.",
            "rescheduled_count": 0,
            "details": ""
        }

    total_missed_minutes = sum(t.get("duration_minutes", 45) for t in missed_tasks)
    missed_subjects = list(set(t.get("subject_name", "Subject") for t in missed_tasks))
    subjects_str = ", ".join(missed_subjects)

    days_available = len(upcoming_schedule_days)
    if days_available == 0:
        return {"message": "No future days available for rebalancing.", "rescheduled_count": 0}

    # Split missed minutes across upcoming 2-3 days in bite-sized chunks
    target_days = min(days_available, 3)
    minutes_per_day = max(15, round((total_missed_minutes / target_days) / 15) * 15)

    rescheduled_tasks = []
    for i in range(target_days):
        day = upcoming_schedule_days[i]
        date_str = day["date"]
        new_task = {
            "subject_name": missed_subjects[i % len(missed_subjects)],
            "title": f"{missed_subjects[i % len(missed_subjects)]} — Catch-up Recovery Slot",
            "duration_minutes": minutes_per_day,
            "scheduled_date": date_str,
            "priority": "HIGH",
            "completed": False,
            "learning_mode": "Revision"
        }
        rescheduled_tasks.append(new_task)

    explanation = (
        f"You missed {total_missed_minutes // 60}h {total_missed_minutes % 60}m of study for {subjects_str}. "
        f"StudyMate AI redistributed this into {target_days} manageable recovery sessions of ~{minutes_per_day} mins each."
    )

    return {
        "message": explanation,
        "rescheduled_count": len(rescheduled_tasks),
        "new_tasks": rescheduled_tasks
    }
