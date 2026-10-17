from typing import Optional, List
from pydantic import BaseModel, Field


class StudentProfileUpdate(BaseModel):
    name: Optional[str] = None
    college: Optional[str] = "Tech University"
    degree: Optional[str] = "B.Tech / B.E."
    branch: Optional[str] = "Computer Science & Engineering"
    year: Optional[str] = "3rd Year"
    available_hours: Optional[float] = Field(default=3.0, ge=0.5, le=16.0)
    preferred_start_time: Optional[str] = "09:00"
    preferred_end_time: Optional[str] = "21:00"
    preferred_break_duration: Optional[int] = 15  # in minutes
    learning_preference: Optional[str] = "Mixed"  # Reading, Videos, Practice, Mixed


class SubjectInput(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    difficulty: str = Field(default="Medium")  # Easy, Medium, Hard
    exam_date: str  # YYYY-MM-DD
    preparation_percentage: int = Field(default=30, ge=0, le=100)
    importance: str = Field(default="Medium")  # Low, Medium, High


class OnboardingRequest(BaseModel):
    # Step 1: Academic details
    name: str
    college: str
    degree: str
    branch: str
    year: str
    # Step 2: Subjects
    subjects: List[SubjectInput]
    # Step 3: Study availability
    available_hours: float = Field(default=3.0, ge=0.5, le=16.0)
    preferred_start_time: str = "09:00"
    preferred_end_time: str = "21:00"
    preferred_break_duration: int = 15
    # Step 4: Learning preference
    learning_preference: str = "Mixed"


class StudentResponse(BaseModel):
    id: str
    user_id: str
    name: str
    college: str
    degree: str
    branch: str
    year: str
    available_hours: float
    preferred_start_time: str
    preferred_end_time: str
    preferred_break_duration: int
    learning_preference: str
    is_onboarded: bool = True
