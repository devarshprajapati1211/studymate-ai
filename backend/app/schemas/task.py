from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    subject_id: Optional[str] = None
    subject_name: str
    title: str
    duration_minutes: int = Field(default=45, ge=10, le=240)
    scheduled_date: str  # YYYY-MM-DD
    priority: str = "MEDIUM"
    learning_mode: Optional[str] = "Practice"


class TaskCompleteRequest(BaseModel):
    completed: bool = True


class TaskResponse(BaseModel):
    id: str
    student_id: str
    study_plan_id: Optional[str] = None
    subject_id: Optional[str] = None
    subject_name: str
    title: str
    duration_minutes: int
    scheduled_date: str
    priority: str
    completed: bool = False
    completed_at: Optional[datetime] = None
    learning_mode: Optional[str] = "Concept Revision"
