from pydantic import BaseModel, Field
from datetime import date
from typing import Optional, List


# -------------------------------------------------------------
# EXISTING SCHEMAS (unchanged)
# -------------------------------------------------------------

class WorkoutCreate(BaseModel):
    plan_id: int
    date: date
    workout_type: str
    planned_distance: Optional[float] = None
    planned_intensity: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    modified_by: Optional[str] = "user"


class WorkoutOut(WorkoutCreate):
    id: int
    completed: bool = False

    class Config:
        from_attributes = True


class WorkoutComplete(BaseModel):
    actual_distance: Optional[float] = None
    actual_time_seconds: Optional[int] = None
    actual_rpe: Optional[int] = Field(default=None, ge=1, le=10)
    avg_hr: Optional[int] = None
    elevation_gain: Optional[float] = None
    completion_notes: Optional[str] = None


# -------------------------------------------------------------
# NEW SCHEMAS FOR AI BULK APPLY
# -------------------------------------------------------------

class WorkoutSuggestion(BaseModel):
    date: date
    workout_type: Optional[str] = None
    mi: Optional[float] = None           # maps to planned_distance
    pace: Optional[str] = None
    notes: Optional[str] = None
    description: Optional[str] = None    # for compatibility


class ApplyWorkoutsRequest(BaseModel):
    suggestions: List[WorkoutSuggestion]


class ApplyWorkoutsResult(BaseModel):
    created: int
    updated: int
