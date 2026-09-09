"""Analysis result model for storing ML inference outputs."""
import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class Verdict(str, enum.Enum):
    GENUINE = "genuine"
    SUSPICIOUS = "suspicious"
    CLONED = "cloned"


class AnalysisResult(Base):
    __tablename__ = "vg_analysis_results"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    call_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vg_calls.id"), nullable=False
    )
    risk_score: Mapped[float] = mapped_column(Float, nullable=False)
    verdict: Mapped[Verdict] = mapped_column(
        Enum(Verdict, name="vg_verdict", create_constraint=True), nullable=False
    )
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    spectral_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    prosody_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    consistency_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    features: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    spectrogram_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    processing_time_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    model_version: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    call = relationship("Call", back_populates="analysis_results")
    alerts = relationship("Alert", back_populates="analysis", lazy="selectin")
