from fastapi import APIRouter
from .routes import auth, plans, workouts, ai

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(plans.router)
api_router.include_router(workouts.router)
api_router.include_router(ai.router)
