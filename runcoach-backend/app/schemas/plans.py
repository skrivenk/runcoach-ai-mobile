from pydantic import BaseModel, Field
from datetime import date
from typing import Optional

class PlanCreate(BaseModel):
    name: str
    goal_type: str
    start_date: date
    race_date: Optional[date] = None
    duration_weeks: int = Field(ge=1, le=52)
    max_days_per_week: int = Field(ge=1, le=7)
    long_run_day: str
    weekly_increase_cap: float = Field(ge=0, le=1)
    long_run_cap: float = Field(ge=0, le=1)
    guardrails_enabled: bool = True

class PlanOut(PlanCreate):
    id: int
    class Config:
        from_attributes = True
