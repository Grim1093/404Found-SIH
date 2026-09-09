"""Pydantic schemas for alert management."""
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class AlertResponse(BaseModel):
    id: UUID
    call_id: UUID
    analysis_id: UUID
    severity: str
    status: str
    risk_score: float
    message: str
    recommended_action: str | None
    acknowledged_by: UUID | None
    resolved_by: UUID | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AlertListResponse(BaseModel):
    items: list[AlertResponse]
    total: int
    page: int
    limit: int
    pages: int
