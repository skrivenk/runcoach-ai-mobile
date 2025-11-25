from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import date

from app.api.deps import get_db, get_current_user
from app.db.models import Plan, Workout
from app.schemas.workouts import (
    WorkoutCreate,
    WorkoutComplete,
    WorkoutOut,
    ApplyWorkoutsRequest,
    ApplyWorkoutsResult
)

router = APIRouter(prefix="/workouts", tags=["workouts"])


# ============================================================
# EXISTING ROUTES
# ============================================================

@router.get("/{plan_id}/range", response_model=list[WorkoutOut])
async def workouts_in_range(
    plan_id: int,
    start: date,
    end: date,
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    plan = await db.get(Plan, plan_id)
    if not plan or plan.user_id != user.id:
        raise HTTPException(404, "Plan not found")

    q = select(Workout).where(
        Workout.plan_id == plan_id,
        Workout.date >= start,
        Workout.date <= end,
        Workout.is_current_version == True
    ).order_by(Workout.date.asc(), Workout.id.asc())

    items = (await db.execute(q)).scalars().all()
    return items


@router.post("", response_model=WorkoutOut)
async def create_workout(
    payload: WorkoutCreate,
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    plan = await db.get(Plan, payload.plan_id)
    if not plan or plan.user_id != user.id:
        raise HTTPException(404, "Plan not found")

    w = Workout(**payload.model_dump())
    db.add(w)
    await db.commit()
    await db.refresh(w)
    return w


@router.post("/{workout_id}/complete")
async def complete_workout(
    workout_id: int,
    body: WorkoutComplete,
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    w = await db.get(Workout, workout_id)
    if not w:
        raise HTTPException(404, "Workout not found")

    w.completed = True
    w.actual_distance = body.actual_distance
    w.actual_time_seconds = body.actual_time_seconds
    w.actual_rpe = body.actual_rpe
    w.avg_hr = body.avg_hr
    w.elevation_gain = body.elevation_gain
    w.completion_notes = body.completion_notes

    db.add(w)
    await db.commit()
    return {"status": "ok"}


# ============================================================
# NEW — BULK APPLY AI SUGGESTIONS
# ============================================================

@router.post("/apply/{plan_id}", response_model=ApplyWorkoutsResult)
async def apply_workout_suggestions(
    plan_id: int,
    payload: ApplyWorkoutsRequest,
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify plan & ownership
    plan_stmt = select(Plan).where(
        Plan.id == plan_id,
        Plan.user_id == user.id
    )
    plan_result = await db.execute(plan_stmt)
    plan = plan_result.scalar_one_or_none()

    if not plan:
        raise HTTPException(404, "Plan not found")

    if not payload.suggestions:
        return ApplyWorkoutsResult(created=0, updated=0)

    # Collect all dates being modified
    dates = sorted({s.date for s in payload.suggestions})

    # Load existing workouts for those dates
    existing_stmt = select(Workout).where(
        Workout.plan_id == plan_id,
        Workout.date.in_(dates),
        Workout.is_current_version == True,
    )
    existing_result = await db.execute(existing_stmt)
    existing = existing_result.scalars().all()

    existing_by_date = {w.date: w for w in existing}

    created = 0
    updated = 0

    for s in payload.suggestions:
        w = existing_by_date.get(s.date)

        if w is None:
            # Create new
            w = Workout(
                plan_id=plan_id,
                date=s.date,
                workout_type=s.workout_type or "run",
                planned_distance=s.mi,
                description=s.description,
                notes=s.notes,
                modified_by="ai",
            )
            db.add(w)
            created += 1

        else:
            # Update existing
            if s.workout_type:
                w.workout_type = s.workout_type

            if s.mi is not None:
                w.planned_distance = s.mi

            if s.notes is not None:
                w.notes = s.notes

            if s.description is not None:
                w.description = s.description

            w.modified_by = "ai"
            updated += 1

    await db.commit()

    return ApplyWorkoutsResult(created=created, updated=updated)
