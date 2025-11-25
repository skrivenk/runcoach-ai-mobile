from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_session
from app.db.models import User
from app.core.security import create_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

@router.post("/register", response_model=TokenOut)
async def register(data: LoginIn, db: AsyncSession = Depends(get_session)):
    existing = await db.scalar(select(User).where(User.email == data.email))
    if existing:
        raise HTTPException(400, "Email already registered")
    u = User(email=data.email, password_hash=hash_password(data.password))
    db.add(u); await db.commit()
    return TokenOut(access_token=create_token(str(u.id)))

@router.post("/login", response_model=TokenOut)
async def login(data: LoginIn, db: AsyncSession = Depends(get_session)):
    u = await db.scalar(select(User).where(User.email == data.email))
    if not u or not verify_password(data.password, u.password_hash):
        raise HTTPException(401, "Invalid credentials")
    return TokenOut(access_token=create_token(str(u.id)))
