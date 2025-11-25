from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from jose import jwt, JWTError
from sqlalchemy import select
from app.db.session import get_session
from app.core.config import settings
from app.db.models import User

async def get_db() -> AsyncSession:
    async for s in get_session():
        yield s

async def get_current_user(Authorization: str = Header(...), db: AsyncSession = Depends(get_db)) -> User:
    token = Authorization.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
        uid = int(payload.get("sub"))
    except (JWTError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = await db.scalar(select(User).where(User.id == uid))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user
