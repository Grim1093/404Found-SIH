"""Pydantic schemas for call management."""
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class CreateCallRequest(BaseModel):
    caller_id: str | None = Field(None, max_length=50)
    caller_name: str | None = Field(None, max_length=255)
    call_type: str = Field(..., description="Call type: live or uploaded")
    language: str | None = Field(None, max_length=50)
    call_metadata: dict | None = None


class UpdateCallRequest(BaseModel):
    status: str | None = Field(None, description="Call status: active, completed, flagged")
    duration_seconds: int | None = None
    completed_at: datetime | None = None
    caller_name: str | None = Field(None, max_length=255)


class CallResponse(BaseModel):
    id: UUID
    caller_id: str | None
    caller_name: str | None
    call_type: str
    status: str
    duration_seconds: int | None
    language: str | None
    call_metadata: dict | None = Field(None, alias="call_metadata")
    created_at: datetime
    completed_at: datetime | None
    created_by: UUID

    model_config = ConfigDict(from_attributes=True)


class CallListResponse(BaseModel):
    items: list[CallResponse]
    total: int
    page: int
    limit: int
    pages: int


class CallStatsResponse(BaseModel):
    total_calls: int = 0
    active_calls: int = 0
    flagged_calls: int = 0
    completed_calls: int = 0
    avg_risk_score: float = 0.0
