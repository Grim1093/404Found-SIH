"""Settings and API key management routes."""
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.settings import (
    ApiKeyCreatedResponse,
    ApiKeyResponse,
    CreateApiKeyRequest,
    SettingsResponse,
    UpdateSettingsRequest,
)
from app.services import settings_service

router = APIRouter(prefix="/api/settings", tags=["Settings"])


@router.get("", response_model=SettingsResponse)
async def get_settings(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> SettingsResponse:
    """Get the current user's configuration."""
    config = await settings_service.get_settings(db, user.id)
    return SettingsResponse.model_validate(config)


@router.put("", response_model=SettingsResponse)
async def update_settings(
    request: UpdateSettingsRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> SettingsResponse:
    """Update the current user's configuration."""
    updates = request.model_dump(exclude_unset=True)
    config = await settings_service.update_settings(db, user.id, updates)
    return SettingsResponse.model_validate(config)


@router.post("/api-keys", response_model=ApiKeyCreatedResponse, status_code=201)
async def create_api_key(
    request: CreateApiKeyRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> ApiKeyCreatedResponse:
    """Generate a new API key. The raw key is returned only once."""
    api_key, raw_key = await settings_service.create_api_key(db, user.id, request.name)
    # Pydantic v2 requires all fields to be present when validating
    # The ORM model doesn't have raw_key, so we must build a dict
    obj_dict = {
        "id": api_key.id,
        "key_prefix": api_key.key_prefix,
        "name": api_key.name,
        "is_active": api_key.is_active,
        "last_used_at": api_key.last_used_at,
        "expires_at": api_key.expires_at,
        "created_at": api_key.created_at,
        "raw_key": raw_key
    }
    return ApiKeyCreatedResponse.model_validate(obj_dict)


@router.get("/api-keys", response_model=list[ApiKeyResponse])
async def list_api_keys(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[ApiKeyResponse]:
    """List all API keys (prefix only, never the full key)."""
    keys = await settings_service.list_api_keys(db, user.id)
    return [ApiKeyResponse.model_validate(k) for k in keys]


@router.delete("/api-keys/{key_id}", status_code=204)
async def revoke_api_key(
    key_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> None:
    """Revoke (deactivate) an API key."""
    await settings_service.revoke_api_key(db, key_id, user.id)
