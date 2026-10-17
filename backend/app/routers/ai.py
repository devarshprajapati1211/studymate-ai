from datetime import date
from fastapi import APIRouter, Depends
from app.db.mongodb import get_database
from app.core.config import settings
from app.core.deps import get_current_student
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.ai_assistant import get_ai_chat_response

router = APIRouter(prefix="/ai", tags=["AI Study Assistant"])


@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(
    payload: ChatRequest,
    student: dict = Depends(get_current_student)
):
    db = get_database()
    today_str = date.today().strftime("%Y-%m-%d")

    # Fetch subjects
    subj_cursor = db.subjects.find({"student_id": student["id"]})
    subjects = await subj_cursor.to_list(length=50)

    # Fetch today's tasks
    task_cursor = db.tasks.find({"student_id": student["id"], "scheduled_date": today_str})
    today_tasks = await task_cursor.to_list(length=20)

    # Format history for chat engine
    history_dicts = [{"role": m.role, "content": m.content} for m in payload.history] if payload.history else []

    response_data = await get_ai_chat_response(
        message=payload.message,
        student_profile=student,
        subjects=subjects,
        today_tasks=today_tasks,
        history=history_dicts
    )

    return ChatResponse(
        reply=response_data["reply"],
        suggested_actions=response_data.get("suggested_actions", []),
        is_fallback=response_data.get("is_fallback", False)
    )


@router.get("/status")
async def get_ai_status():
    has_llm = bool(settings.OPENAI_API_KEY and len(settings.OPENAI_API_KEY) > 10)
    return {
        "llm_enabled": has_llm,
        "mode": "LLM Assistant" if has_llm else "Smart Study Planner (Deterministic Fallback)",
        "message": "AI enhancement active" if has_llm else "AI enhancement unavailable — using Smart Study Planner mode."
    }
