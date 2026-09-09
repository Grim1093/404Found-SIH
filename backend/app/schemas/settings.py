"""Pydantic schemas for settings and API key management."""
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class SettingsResponse(BaseModel):
    id: UUID
    threshold_low: float
    threshold_medium: float
    threshold_high: float
    threshold_critical: float
    notify_in_app: bool
    notify_email: bool
    notify_sms: bool
    webhook_url: str | None
    auto_escalate: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UpdateSettingsRequest(BaseModel):
    threshold_low: float | None = Field(None, ge=0, le=100)
    threshold_medium: float | None = Field(None, ge=0, le=100)
    threshold_high: float | None = Field(None, ge=0, le=100)
    threshold_critical: float | None = Field(None, ge=0, le=100)
    notify_in_app: bool | None = None
    notify_email: bool | None = None
    notify_sms: bool | None = None
    webhook_url: str | None = None
    auto_escalate: bool | None = None


class CreateApiKeyRequest(BaseModel):
    name: str = Field(..., max_length=100, description="Human-readable key name")


class ApiKeyResponse(BaseModel):
    id: UUID
    key_prefix: str
    name: str
    is_active: bool
    last_used_at: datetime | None
    expires_at: datetime | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApiKeyCreatedResponse(ApiKeyResponse):
    """Returned only on creation — contains the raw key (shown once)."""
    raw_key: str
