"""Alert model for flagged call notifications."""
import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Enum, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class Severity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AlertStatus(str, enum.Enum):
    OPEN = "open"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"
    FALSE_POSITIVE = "false_positive"


class Alert(Base):
    __tablename__ = "vg_alerts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    call_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vg_calls.id"), nullable=False
    )
    analysis_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vg_analysis_results.id"), nullable=False
    )
    severity: Mapped[Severity] = mapped_column(
        Enum(Severity, name="vg_severity", create_constraint=True), nullable=False
    )
    status: Mapped[AlertStatus] = mapped_column(
        Enum(AlertStatus, name="vg_alert_status", create_constraint=True),
        nullable=False,
        default=AlertStatus.OPEN,
    )
    risk_score: Mapped[float] = mapped_column(Float, nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    recommended_action: Mapped[str | None] = mapped_column(Text, nullable=True)
    acknowledged_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vg_users.id"), nullable=True
    )
    resolved_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vg_users.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    call = relationship("Call", back_populates="alerts")
    analysis = relationship("AnalysisResult", back_populates="alerts")
    acknowledger = relationship("User", foreign_keys=[acknowledged_by])
    resolver = relationship("User", foreign_keys=[resolved_by])
