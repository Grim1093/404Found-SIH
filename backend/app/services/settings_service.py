"""Settings and API key management service."""
import hashlib
import secrets
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.configuration import Configuration
from app.models.api_key import ApiKey
from app.utils.logging import log


async def get_settings(db: AsyncSession, user_id: UUID) -> Configuration:
    """Get the current user's configuration."""
    result = await db.execute(
        select(Configuration).where(Configuration.user_id == user_id)
    )
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Configuration not found for user",
        )
    return config


async def update_settings(
    db: AsyncSession, user_id: UUID, updates: dict
) -> Configuration:
    """Update the user's configuration with non-None fields."""
    config = await get_settings(db, user_id)
    for field, value in updates.items():
        if value is not None:
            setattr(config, field, value)
    log("info", "Settings updated", user_id=str(user_id))
    return config


async def create_api_key(
    db: AsyncSession, user_id: UUID, name: str
) -> tuple[ApiKey, str]:
    """Generate a new API key. Returns (key_record, raw_key)."""
    raw_key = f"vg_{secrets.token_urlsafe(32)}"
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    key_prefix = raw_key[:10]

    api_key = ApiKey(
        user_id=user_id,
        key_hash=key_hash,
        key_prefix=key_prefix,
        name=name,
    )
    db.add(api_key)
    await db.flush()
    log("info", "API key created", key_prefix=key_prefix, user_id=str(user_id))
    return api_key, raw_key


async def list_api_keys(db: AsyncSession, user_id: UUID) -> list[ApiKey]:
    """List all API keys for a user (prefix only, never full key)."""
    result = await db.execute(
        select(ApiKey).where(ApiKey.user_id == user_id).order_by(ApiKey.created_at.desc())
    )
    return list(result.scalars().all())


async def revoke_api_key(
    db: AsyncSession, key_id: UUID, user_id: UUID
) -> None:
    """Deactivate an API key."""
    result = await db.execute(
        select(ApiKey).where(ApiKey.id == key_id, ApiKey.user_id == user_id)
    )
    api_key = result.scalar_one_or_none()
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"API key {key_id} not found",
        )
    api_key.is_active = False
    log("info", "API key revoked", key_id=str(key_id))
