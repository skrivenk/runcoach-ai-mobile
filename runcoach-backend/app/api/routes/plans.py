from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.api.deps import get_db, get_current_user
from app.db.models import Plan
from app.schemas.plans import PlanCreate, PlanOut

router = APIRouter(prefix="/plans", tags=["plans"])

@router.get("", response_model=list[PlanOut])
async def list_plans(user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(
        select(Plan).where(Plan.user_id == user.id).order_by(Plan.created_at.desc())
    )).scalars().all()
    return rows

@router.post("", response_model=PlanOut)
async def create_plan(payload: PlanCreate, user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    p = Plan(user_id=user.id, **payload.model_dump())
    db.add(p); await db.commit(); await db.refresh(p)
    return p
