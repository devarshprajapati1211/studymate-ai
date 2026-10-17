from typing import List, Optional
from pydantic import BaseModel
from app.schemas.task import TaskResponse


class StudyPlanItem(BaseModel):
    subject: str
    topic: str
    duration_minutes: int
    priority: str
    learning_mode: Optional[str] = "Concept Revision"


class DaySchedule(BaseModel):
    date: str
    day_name: str
    total_minutes: int
    tasks: List[TaskResponse]


class StudyPlanResponse(BaseModel):
    id: str
    student_id: str
    start_date: str
    end_date: str
    daily_hours: float
    ai_summary: str
    recommendation: str
    is_fallback_mode: bool = False
    schedule: List[DaySchedule]
    total_tasks: int
    completed_tasks: int
