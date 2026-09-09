"""Pydantic schemas for analysis results."""
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class AnalysisResultResponse(BaseModel):
    id: UUID
    call_id: UUID
    risk_score: float = Field(ge=0, le=100)
    verdict: str
    confidence: float = Field(ge=0, le=1)
    spectral_score: float | None
    prosody_score: float | None
    consistency_score: float | None
    spectrogram_path: str | None
    processing_time_ms: int | None
    model_version: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True, protected_namespaces=())
