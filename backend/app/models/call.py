"""Call model for tracking voice analysis sessions."""
import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class CallType(str, enum.Enum):
    LIVE = "live"
    UPLOADED = "uploaded"


class CallStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    FLAGGED = "flagged"


class Call(Base):
    __tablename__ = "vg_calls"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    caller_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    caller_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    call_type: Mapped[CallType] = mapped_column(
        Enum(CallType, name="vg_call_type", create_constraint=True), nullable=False
    )
    status: Mapped[CallStatus] = mapped_column(
        Enum(CallStatus, name="vg_call_status", create_constraint=True), nullable=False
    )
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    audio_file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    language: Mapped[str | None] = mapped_column(String(50), nullable=True)
    call_metadata: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vg_users.id"), nullable=False
    )

    # Relationships
    creator = relationship("User", back_populates="calls")
    analysis_results = relationship("AnalysisResult", back_populates="call", lazy="selectin")
    alerts = relationship("Alert", back_populates="call", lazy="selectin")
