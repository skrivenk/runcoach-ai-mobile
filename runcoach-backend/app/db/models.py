# app/db/models.py
from __future__ import annotations

from datetime import date, datetime
from typing import Optional, List

from sqlalchemy.orm import DeclarativeBase, relationship, Mapped, mapped_column
from sqlalchemy import (
    String,
    Integer,
    Boolean,
    Date,
    DateTime,
    Text,
    Float,
    ForeignKey,
    CheckConstraint,
    func,
)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))


class Plan(Base):
    __tablename__ = "plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    name: Mapped[str] = mapped_column(String(200))
    goal_type: Mapped[str] = mapped_column(String(20))

    # 🔑 Use Python types in annotations, SQL types in mapped_column
    start_date: Mapped[date] = mapped_column(Date)
    race_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    duration_weeks: Mapped[int] = mapped_column(Integer)
    max_days_per_week: Mapped[int] = mapped_column(Integer, default=5)
    long_run_day: Mapped[str] = mapped_column(String(12), default="Sunday")
    weekly_increase_cap: Mapped[float] = mapped_column(Float, default=0.10)
    long_run_cap: Mapped[float] = mapped_column(Float, default=0.30)
    guardrails_enabled: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    last_modified: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    workouts: Mapped[List["Workout"]] = relationship(
        back_populates="plan", cascade="all, delete-orphan"
    )


class Workout(Base):
    __tablename__ = "workouts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    plan_id: Mapped[int] = mapped_column(ForeignKey("plans.id", ondelete="CASCADE"))

    date: Mapped[date] = mapped_column(Date)

    version: Mapped[int] = mapped_column(Integer, default=1)
    is_current_version: Mapped[bool] = mapped_column(Boolean, default=True)

    workout_type: Mapped[str] = mapped_column(String(20))
    planned_distance: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    planned_intensity: Mapped[Optional[str]] = mapped_column(String(60), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    actual_distance: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    actual_time_seconds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    actual_rpe: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    avg_hr: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    elevation_gain: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    splits: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    shoes: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    completion_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    modified_by: Mapped[Optional[str]] = mapped_column(String(60), nullable=True)

    plan: Mapped[Plan] = relationship(back_populates="workouts")

    __table_args__ = (
        CheckConstraint(
            "workout_type IN ('easy','tempo','intervals','long','recovery','rest','crosstrain')",
            name="ck_workout_type",
        ),
    )
