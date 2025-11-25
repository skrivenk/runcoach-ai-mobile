from pydantic import BaseModel
from datetime import date

class PlanContext(BaseModel):
    id: int
    goal_type: str
    max_days_per_week: int = 5
    weekly_increase_cap: float = 0.10
    long_run_cap: float = 0.30
    long_run_day: str = "Sunday"
    guardrails_enabled: bool = True

class WorkoutSuggestion(BaseModel):
    date: str
    workout_type: str
    planned_distance: float | None
    planned_intensity: str | None = None
    description: str | None = None

def plan_week(ctx: PlanContext, week_dates: list[str], recent_completed: list[dict]) -> list[WorkoutSuggestion]:
    base = 5.0
    long_dist = base * (1.0 + min(ctx.long_run_cap, 0.30))
    out: list[WorkoutSuggestion] = []
    for d in week_dates:
        wd = date.fromisoformat(d).strftime("%A")
        if wd == ctx.long_run_day:
            out.append(WorkoutSuggestion(date=d, workout_type="long",
                                         planned_distance=round(long_dist, 1),
                                         description="Long run"))
        elif len(out) % 5 == 0:
            out.append(WorkoutSuggestion(date=d, workout_type="rest",
                                         planned_distance=None,
                                         description="Rest / cross-train"))
        elif len(out) % 3 == 1:
            out.append(WorkoutSuggestion(date=d, workout_type="tempo",
                                         planned_distance=round(base+1.0, 1),
                                         description="Tempo run"))
        else:
            out.append(WorkoutSuggestion(date=d, workout_type="easy",
                                         planned_distance=round(base, 1),
                                         description="Easy"))
    return out
