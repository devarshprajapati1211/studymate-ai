from typing import Optional
from pydantic import BaseModel, Field


class SubjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    difficulty: str = Field(default="Medium")  # Easy, Medium, Hard
    exam_date: str  # YYYY-MM-DD
    preparation_percentage: int = Field(default=20, ge=0, le=100)
    importance: str = Field(default="Medium")  # Low, Medium, High


class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    difficulty: Optional[str] = None
    exam_date: Optional[str] = None
    preparation_percentage: Optional[int] = Field(default=None, ge=0, le=100)
    importance: Optional[str] = None


class SubjectResponse(BaseModel):
    id: str
    student_id: str
    name: str
    difficulty: str
    exam_date: str
    preparation_percentage: int
    importance: str
    days_until_exam: int
    priority_score: int
    priority_level: str  # HIGH, MEDIUM, LOW
    priority_explanation: str
