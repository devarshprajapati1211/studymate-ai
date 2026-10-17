from datetime import date
from typing import Dict, Any, List, Optional
import httpx
import logging
from app.core.config import settings

logger = logging.getLogger("studymate.assistant")


def generate_contextual_fallback_answer(
    message: str,
    student_profile: Dict[str, Any],
    subjects: List[Dict[str, Any]],
    today_tasks: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Context-aware deterministic assistant response engine.
    Parses intent and leverages actual student data to give highly relevant answers.
    """
    msg = message.lower()
    student_name = student_profile.get("name", "Student")
    hours = student_profile.get("available_hours", 3.0)

    # Sort subjects by priority score or countdown
    subjects_sorted = sorted(subjects, key=lambda s: s.get("priority_score", 0), reverse=True)
    top_subject = subjects_sorted[0] if subjects_sorted else None
    
    # 1. "What should I study today?"
    if any(k in msg for k in ["what should i study today", "study today", "today plan", "today's plan"]):
        if not today_tasks:
            if top_subject:
                reply = (
                    f"Hi {student_name}! Based on your current exam deadlines, your #1 priority today is "
                    f"**{top_subject['name']}** (Exam in {top_subject.get('days_until_exam', 'N/A')} days, "
                    f"prep: {top_subject.get('preparation_percentage', 0)}%). "
                    f"I recommend spending 60–90 minutes tackling previous-year exam questions or weak topics, "
                    f"followed by 45 minutes of revision on your secondary subjects."
                )
            else:
                reply = "You don't have tasks scheduled for today yet. Head to the Study Plan page and click 'Regenerate My Plan'!"
        else:
            pending = [t for t in today_tasks if not t.get("completed", False)]
            if pending:
                tasks_bullets = "\n".join([f"• **{t['title']}** ({t.get('duration_minutes', 45)} mins)" for t in pending])
                reply = (
                    f"Here is your recommended roadmap for today, {student_name}:\n\n"
                    f"{tasks_bullets}\n\n"
                    f"Start with the highest priority task first while your concentration is fresh!"
                )
            else:
                reply = f"Awesome work, {student_name}! You've completed all scheduled tasks for today. You can review flashcards or take some well-deserved rest."

        return {
            "reply": reply,
            "suggested_actions": ["Show today's tasks", "I only have 1 hour today", "Which subject should I prioritize?"],
            "is_fallback": True
        }

    # 2. "I only have 1 hour today" / time restriction
    if any(k in msg for k in ["1 hour", "one hour", "limited time", "less time", "30 min", "only have"]):
        if top_subject:
            reply = (
                f"Got it! When time is tight, focus entirely on high-yield mastery for your most urgent subject:\n\n"
                f"⏱️ **Quick 60-Minute Sprint Plan for {top_subject['name']}**:\n"
                f"1. **0–10 min**: Quick review of key formulas and summary sheet.\n"
                f"2. **10–45 min**: Solve 3–4 high-frequency exam questions (PYQs).\n"
                f"3. **45–55 min**: Review mistakes and write 3 summary takeaway bullets.\n"
                f"4. **55–60 min**: Plan tomorrow's starting point."
            )
        else:
            reply = "With only 1 hour, dedicate 45 minutes to high-yield practice and 15 minutes to active recall flashcards."

        return {
            "reply": reply,
            "suggested_actions": ["What should I study today?", "Create a revision plan for tomorrow"],
            "is_fallback": True
        }

    # 3. "Which subject should I prioritize?"
    if any(k in msg for k in ["prioritize", "priority", "most important", "focus first"]):
        if subjects_sorted:
            lines = []
            for s in subjects_sorted[:3]:
                badge = "🔴 High" if s.get("priority_score", 0) >= 70 else "🟠 Med" if s.get("priority_score", 0) >= 40 else "🟢 Low"
                lines.append(f"• **{s['name']}** — Priority {s.get('priority_score', 50)}/100 ({badge}): Exam in {s.get('days_until_exam', 0)} days, prep {s.get('preparation_percentage', 0)}%")
            
            top_subj_name = top_subject['name']
            reply = (
                f"Based on your exam countdown, syllabus difficulty, and current preparation percentage:\n\n"
                + "\n".join(lines) + f"\n\n"
                f"**Recommendation**: Devote at least 50% of your daily study hours to **{top_subj_name}** until your preparation exceeds 75%."
            )
        else:
            reply = "You haven't added subjects yet. Add your subjects and exam dates in 'My Subjects' so I can calculate your priorities!"

        return {
            "reply": reply,
            "suggested_actions": ["What should I study today?", "How can I improve my study schedule?"],
            "is_fallback": True
        }

    # 4. Specific subject queries (e.g. DBMS, Python, AI)
    matched_subject = None
    for s in subjects:
        if s.get("name", "").lower() in msg:
            matched_subject = s
            break
            
    if matched_subject:
        s_name = matched_subject['name']
        days = matched_subject.get('days_until_exam', 5)
        prep = matched_subject.get('preparation_percentage', 40)
        diff = matched_subject.get('difficulty', 'Medium')
        
        reply = (
            f"Here is your targeted assessment for **{s_name}**:\n\n"
            f"• **Exam Countdown**: {days} days remaining\n"
            f"• **Difficulty**: {diff}\n"
            f"• **Current Preparation**: {prep}%\n\n"
            f"**Strategic Advice**:\n"
            f"1. Prioritize solving previous-year questions (PYQs) for top-weighted chapters.\n"
            f"2. Schedule a mock test 2 days before the exam to test timing.\n"
            f"3. Create a 1-page condensed formula/cheat sheet for final 24-hour review."
        )
        return {
            "reply": reply,
            "suggested_actions": [f"Make a 3-day plan for {s_name}", "What should I study today?"],
            "is_fallback": True
        }

    # 5. "I completed today's tasks" / next steps
    if any(k in msg for k in ["completed today", "finished tasks", "done for today", "what to study next"]):
        reply = (
            f"Congratulations on finishing today's goals! 🎉\n\n"
            f"Here are 3 productive options depending on your energy level:\n"
            f"1. **Light active recall (15 mins)**: Review digital flashcards or self-quiz on tricky concepts.\n"
            f"2. **Preview tomorrow (10 mins)**: Skim the headings of tomorrow's planned topics.\n"
            f"3. **Rest & Recharge**: Brain consolidation happens during sleep! Call it a day and stay consistent tomorrow."
        )
        return {
            "reply": reply,
            "suggested_actions": ["What should I study today?", "Create a revision plan for tomorrow"],
            "is_fallback": True
        }

    # 6. "Improve my study schedule" / general tips
    if any(k in msg for k in ["improve", "schedule", "habits", "advice", "tips", "technique"]):
        reply = (
            f"Here are 4 science-backed study techniques customized for your {hours} hrs/day routine:\n\n"
            f"1. **Pomodoro Blocks**: Study in 50-minute focused sprints followed by 10-minute away-from-screen breaks.\n"
            f"2. **Interleaving**: Don't study just one subject all day; alternate between {subjects_sorted[0]['name'] if subjects_sorted else 'a hard subject'} and a secondary subject to improve retention.\n"
            f"3. **Active Recall**: Close your notes and write everything you remember from memory before checking.\n"
            f"4. **Feynman Technique**: Explain complex definitions in plain everyday language."
        )
        return {
            "reply": reply,
            "suggested_actions": ["What should I study today?", "Which subject should I prioritize?"],
            "is_fallback": True
        }

    # Default friendly, data-aware response
    subject_names = ", ".join([s.get("name", "") for s in subjects[:4]]) if subjects else "your curriculum"
    reply = (
        f"Hello {student_name}! I am your StudyMate AI assistant. I'm actively monitoring your schedule for {subject_names}.\n\n"
        f"You can ask me things like:\n"
        f"• *'What should I study today?'*\n"
        f"• *'I only have 1 hour today. Make me a plan.'*\n"
        f"• *'Which subject should I prioritize?'*\n"
        f"• *'My {subjects[0]['name'] if subjects else 'exam'} is in a few days, what should I do?'*\n\n"
        f"How can I help boost your study productivity right now?"
    )
    return {
        "reply": reply,
        "suggested_actions": ["What should I study today?", "Which subject should I prioritize?", "I only have 1 hour today"],
        "is_fallback": True
    }


async def get_ai_chat_response(
    message: str,
    student_profile: Dict[str, Any],
    subjects: List[Dict[str, Any]],
    today_tasks: List[Dict[str, Any]],
    history: Optional[List[Dict[str, str]]] = None
) -> Dict[str, Any]:
    """
    Checks for LLM API key; if available calls LLM with real student context,
    otherwise provides context-aware deterministic answer.
    """
    if settings.OPENAI_API_KEY and len(settings.OPENAI_API_KEY) > 10:
        try:
            system_prompt = f"""
You are StudyMate AI, an intelligent, supportive, and concise academic advisor for a college student.
Current Student Context:
- Name: {student_profile.get('name', 'Student')}
- College: {student_profile.get('college', 'University')} ({student_profile.get('branch', 'Engineering')})
- Available hours/day: {student_profile.get('available_hours', 3.0)}
- Preferred learning style: {student_profile.get('learning_preference', 'Mixed')}
- Registered Subjects: {[{
    'name': s.get('name'),
    'days_until_exam': s.get('days_until_exam'),
    'difficulty': s.get('difficulty'),
    'prep_percentage': s.get('preparation_percentage'),
    'priority_score': s.get('priority_score')
} for s in subjects]}
- Today's Tasks: {[{
    'title': t.get('title'),
    'duration_minutes': t.get('duration_minutes'),
    'completed': t.get('completed')
} for t in today_tasks]}

Provide practical, concise, highly specific advice referring directly to their subjects and exams.
Avoid generic textbook filler. Use clean markdown bullets and bold text.
"""
            messages = [{"role": "system", "content": system_prompt}]
            if history:
                for h in history[-4:]:
                    messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
            messages.append({"role": "user", "content": message})

            async with httpx.AsyncClient(timeout=12.0) as client:
                res = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
                    json={
                        "model": "gpt-4o-mini",
                        "messages": messages,
                        "temperature": 0.5,
                        "max_tokens": 450
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    ai_reply = data["choices"][0]["message"]["content"]
                    return {
                        "reply": ai_reply,
                        "suggested_actions": ["What should I study today?", "Which subject should I prioritize?"],
                        "is_fallback": False
                    }
        except Exception as e:
            logger.warning(f"AI chat call error, using deterministic: {e}")

    # Fallback mode
    return generate_contextual_fallback_answer(message, student_profile, subjects, today_tasks)
