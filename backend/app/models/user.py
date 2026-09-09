"""User model for authentication and authorization."""
import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import Boolean, DateTime, Enum, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    ANALYST = "analyst"
    VIEWER = "viewer"


class User(Base, TimestampMixin):
    __tablename__ = "vg_users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="vg_user_role", create_constraint=True),
        nullable=False,
        default=UserRole.ANALYST,
    )
    organization: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    calls = relationship("Call", back_populates="creator", lazy="selectin")
    configurations = relationship("Configuration", back_populates="user", lazy="selectin")
    api_keys = relationship("ApiKey", back_populates="user", lazy="selectin")
