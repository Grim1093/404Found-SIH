"""Alert management API routes."""
import math
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.alert import AlertListResponse, AlertResponse
from app.services import alert_service

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


@router.get("", response_model=AlertListResponse)
async def list_alerts(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    severity: str | None = Query(None, description="Filter by severity"),
    status: str | None = Query(None, description="Filter by status"),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> AlertListResponse:
    """List alerts with pagination and filtering."""
    alerts, total = await alert_service.get_alerts(
        db=db, page=page, limit=limit,
        severity_filter=severity, status_filter=status,
    )
    return AlertListResponse(
        items=[AlertResponse.model_validate(a) for a in alerts],
        total=total,
        page=page,
        limit=limit,
        pages=math.ceil(total / limit) if total > 0 else 0,
    )


@router.get("/{alert_id}", response_model=AlertResponse)
async def get_alert(
    alert_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> AlertResponse:
    """Get a single alert by ID."""
    alert = await alert_service.get_alert(db, alert_id)
    return AlertResponse.model_validate(alert)


@router.patch("/{alert_id}/acknowledge", response_model=AlertResponse)
async def acknowledge_alert(
    alert_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> AlertResponse:
    """Acknowledge an open alert."""
    alert = await alert_service.acknowledge_alert(db, alert_id, user.id)
    return AlertResponse.model_validate(alert)


@router.patch("/{alert_id}/resolve", response_model=AlertResponse)
async def resolve_alert(
    alert_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> AlertResponse:
    """Resolve an alert."""
    alert = await alert_service.resolve_alert(db, alert_id, user.id)
    return AlertResponse.model_validate(alert)


@router.patch("/{alert_id}/false-positive", response_model=AlertResponse)
async def mark_false_positive(
    alert_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> AlertResponse:
    """Mark an alert as a false positive."""
    alert = await alert_service.mark_false_positive(db, alert_id, user.id)
    return AlertResponse.model_validate(alert)
