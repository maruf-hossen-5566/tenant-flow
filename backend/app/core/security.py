from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User
from app.utils.hash import verify_password


def authenticate_user(db: Session, user_data: OAuth2PasswordRequestForm):
    """Authenticate user with the given credentials"""
    user = (
        db.query(User)
        .filter(
            User.email == user_data.username,
        )
        .first()
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid credentials",
        )
    if not verify_password(user_data.password, str(user.hashed_password)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials",
        )
    return user


def create_tokens(data: dict) -> dict:
    """Create both access and refresh token with the given data and expires"""
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data, access_token_expires)

    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = create_refresh_token(data, refresh_token_expires)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Create access token with the given data and expires"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta
        if expires_delta
        else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"type": "access"})
    to_encode.update({"exp": expire})
    token = jwt.encode(
        to_encode, settings.ACCESS_SECRET_KEY, algorithm=settings.TOKEN_ALGORITHM,
    )
    return token


def create_refresh_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Create refresh token with the given data and expires"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta
        if expires_delta
        else timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    to_encode.update({"type": "refresh"})
    to_encode.update({"exp": expire})
    token = jwt.encode(
        to_encode, settings.REFRESH_SECRET_KEY, algorithm=settings.TOKEN_ALGORITHM,
    )
    return token
