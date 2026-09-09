"""Alert management service — CRUD and status workflow for flagged calls."""
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alert import Alert, AlertStatus, Severity
from app.utils.logging import log


async def get_alerts(
    db: AsyncSession,
    page: int = 1,
    limit: int = 20,
    severity_filter: str | None = None,
    status_filter: str | None = None,
) -> tuple[list[Alert], int]:
    """List alerts with pagination and filtering."""
    query = select(Alert)

    if severity_filter:
        query = query.where(Alert.severity == Severity(severity_filter))
    if status_filter:
        query = query.where(Alert.status == AlertStatus(status_filter))

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    offset = (page - 1) * limit
    query = query.order_by(Alert.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    alerts = list(result.scalars().all())

    return alerts, total


async def get_alert(db: AsyncSession, alert_id: UUID) -> Alert:
    """Get a single alert by ID."""
    alert = await db.get(Alert, alert_id)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert {alert_id} not found",
        )
    return alert


async def acknowledge_alert(
    db: AsyncSession, alert_id: UUID, user_id: UUID
) -> Alert:
    """Set alert status to acknowledged."""
    alert = await get_alert(db, alert_id)
    if alert.status != AlertStatus.OPEN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot acknowledge alert with status '{alert.status.value}'",
        )
    alert.status = AlertStatus.ACKNOWLEDGED
    alert.acknowledged_by = user_id
    log("info", "Alert acknowledged", alert_id=str(alert_id))
    return alert


async def resolve_alert(
    db: AsyncSession, alert_id: UUID, user_id: UUID
) -> Alert:
    """Set alert status to resolved."""
    alert = await get_alert(db, alert_id)
    if alert.status not in (AlertStatus.OPEN, AlertStatus.ACKNOWLEDGED):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot resolve alert with status '{alert.status.value}'",
        )
    alert.status = AlertStatus.RESOLVED
    alert.resolved_by = user_id
    log("info", "Alert resolved", alert_id=str(alert_id))
    return alert


async def mark_false_positive(
    db: AsyncSession, alert_id: UUID, user_id: UUID
) -> Alert:
    """Mark alert as false positive."""
    alert = await get_alert(db, alert_id)
    alert.status = AlertStatus.FALSE_POSITIVE
    alert.resolved_by = user_id
    log("info", "Alert marked false positive", alert_id=str(alert_id))
    return alert
