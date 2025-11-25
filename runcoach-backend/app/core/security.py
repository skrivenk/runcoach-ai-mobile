from datetime import datetime, timedelta
from jose import jwt
from passlib.hash import bcrypt
from app.core.config import settings

def create_token(sub: str) -> str:
    now = datetime.utcnow()
    payload = {"sub": sub, "iat": now, "exp": now + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALG)

def verify_password(pw: str, hash_: str) -> bool:
    return bcrypt.verify(pw, hash_)

def hash_password(pw: str) -> str:
    return bcrypt.using(rounds=12).hash(pw)
