from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user
from app.db.models import Plan
from app.services.ai_planner import PlanContext, plan_week

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/recalc/{plan_id}")
async def recalc_week(plan_id: int, start_date: str, end_date: str,
                      user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    plan = await db.get(Plan, plan_id)
    if not plan or plan.user_id != user.id:
        raise HTTPException(404, "Plan not found")

    from datetime import date, timedelta
    s = date.fromisoformat(start_date); e = date.fromisoformat(end_date)
    dates = [(s + timedelta(days=i)).isoformat() for i in range((e - s).days + 1)]

    ctx = PlanContext(
        id=plan.id,
        goal_type=plan.goal_type,
        max_days_per_week=plan.max_days_per_week,
        weekly_increase_cap=plan.weekly_increase_cap,
        long_run_cap=plan.long_run_cap,
        long_run_day=plan.long_run_day,
        guardrails_enabled=plan.guardrails_enabled,
    )
    suggestions = plan_week(ctx, dates, recent_completed=[])
    return {"week_dates": dates, "suggestions": [s.model_dump() for s in suggestions]}
