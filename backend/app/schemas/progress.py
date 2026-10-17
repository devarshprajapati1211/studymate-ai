from typing import List, Dict, Any
from pydantic import BaseModel


class SubjectProgressItem(BaseModel):
    subject_id: str
    subject_name: str
    preparation_percentage: int
    completed_tasks: int
    total_tasks: int
    exam_countdown: int
    priority_level: str
    study_hours_logged: float


class DailyStudyTime(BaseModel):
    date: str
    day: str
    planned_hours: float
    completed_hours: float


class ProgressSummaryResponse(BaseModel):
    overall_progress_percentage: int
    completed_tasks_count: int
    total_tasks_count: int
    weekly_study_hours: float
    streak_days: int
    subject_progress: List[SubjectProgressItem]
    weekly_hours_chart: List[DailyStudyTime]
    efficiency_rating: str  # High, Moderate, Needs Focus
