"""Pydantic schemas for user authentication and profile."""
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegisterRequest(BaseModel):
    email: str = Field(..., max_length=255, description="User email address")
    password: str = Field(..., min_length=8, max_length=128, description="Password (min 8 characters)")
    full_name: str = Field(..., max_length=255, description="User display name")
    organization: str | None = Field(None, max_length=255, description="Organization name")


class LoginRequest(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., description="User password")


class RefreshRequest(BaseModel):
    refresh_token: str = Field(..., description="Refresh token")


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    role: str
    organization: str | None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
