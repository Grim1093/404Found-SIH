"""Authentication service handling password hashing and JWT operations."""
from datetime import datetime, timedelta, timezone
from uuid import UUID

import jwt
import bcrypt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.user import User, UserRole
from app.models.configuration import Configuration


def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its bcrypt hash."""
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )


def create_access_token(user_id: UUID, role: str) -> str:
    """Create a short-lived JWT access token."""
    payload = {
        "sub": str(user_id),
        "role": role,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(user_id: UUID) -> str:
    """Create a long-lived JWT refresh token."""
    payload = {
        "sub": str(user_id),
        "type": "refresh",
        "exp": datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode and validate a JWT token."""
    return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])


async def register_user(
    db: AsyncSession,
    email: str,
    password: str,
    full_name: str,
    organization: str | None = None,
) -> User:
    """Register a new user with hashed password and default configuration."""
    # Check email uniqueness
    result = await db.execute(select(User).where(User.email == email))
    if result.scalar_one_or_none():
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = User(
        email=email,
        password_hash=hash_password(password),
        full_name=full_name,
        organization=organization,
        role=UserRole.ANALYST,
    )
    db.add(user)
    await db.flush()

    # Create default configuration for the new user
    config = Configuration(user_id=user.id)
    db.add(config)

    return user


async def authenticate_user(
    db: AsyncSession, email: str, password: str
) -> User | None:
    """Authenticate a user by email and password."""
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.password_hash):
        return None
    if not user.is_active:
        return None
    return user
