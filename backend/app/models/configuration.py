"""User configuration model for risk thresholds and notification preferences."""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class Configuration(Base):
    __tablename__ = "vg_configurations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vg_users.id"), nullable=False
    )
    threshold_low: Mapped[float] = mapped_column(Float, nullable=False, default=25.0)
    threshold_medium: Mapped[float] = mapped_column(Float, nullable=False, default=50.0)
    threshold_high: Mapped[float] = mapped_column(Float, nullable=False, default=75.0)
    threshold_critical: Mapped[float] = mapped_column(Float, nullable=False, default=90.0)
    notify_in_app: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    notify_email: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    notify_sms: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    webhook_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    auto_escalate: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
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
    user = relationship("User", back_populates="configurations")
