"""Call management service — CRUD operations for voice analysis sessions."""
import math
from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.call import Call, CallStatus, CallType
from app.models.analysis_result import AnalysisResult
from app.utils.logging import log


async def create_call(
    db: AsyncSession,
    caller_id: str | None,
    caller_name: str | None,
    call_type: str,
    language: str | None,
    call_metadata: dict | None,
    created_by: UUID,
) -> Call:
    """Create a new call record."""
    call = Call(
        caller_id=caller_id,
        caller_name=caller_name,
        call_type=CallType(call_type),
        status=CallStatus.ACTIVE,
        language=language,
        call_metadata=call_metadata,
        created_by=created_by,
    )
    db.add(call)
    await db.flush()
    log("info", "Call created", call_id=str(call.id), call_type=call_type)
    return call


async def get_calls(
    db: AsyncSession,
    page: int = 1,
    limit: int = 20,
    status_filter: str | None = None,
    call_type_filter: str | None = None,
    created_by: UUID | None = None,
) -> tuple[list[Call], int]:
    """List calls with pagination and filtering."""
    query = select(Call)

    if status_filter:
        query = query.where(Call.status == CallStatus(status_filter))
    if call_type_filter:
        query = query.where(Call.call_type == CallType(call_type_filter))
    if created_by:
        query = query.where(Call.created_by == created_by)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    # Paginate
    offset = (page - 1) * limit
    query = query.order_by(Call.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    calls = list(result.scalars().all())

    return calls, total


async def get_call(db: AsyncSession, call_id: UUID) -> Call:
    """Get a single call by ID."""
    call = await db.get(Call, call_id)
    if not call:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Call {call_id} not found",
        )
    return call


async def get_call_stats(db: AsyncSession) -> dict:
    """Get aggregate call statistics for the dashboard."""
    total = (await db.execute(select(func.count(Call.id)))).scalar() or 0
    active = (await db.execute(
        select(func.count(Call.id)).where(Call.status == CallStatus.ACTIVE)
    )).scalar() or 0
    flagged = (await db.execute(
        select(func.count(Call.id)).where(Call.status == CallStatus.FLAGGED)
    )).scalar() or 0
    completed = (await db.execute(
        select(func.count(Call.id)).where(Call.status == CallStatus.COMPLETED)
    )).scalar() or 0

    # Average risk score across all analysis results
    avg_risk = (await db.execute(
        select(func.avg(AnalysisResult.risk_score))
    )).scalar() or 0.0

    return {
        "total_calls": total,
        "active_calls": active,
        "flagged_calls": flagged,
        "completed_calls": completed,
        "avg_risk_score": round(float(avg_risk), 2),
    }


async def update_call(
    db: AsyncSession,
    call_id: UUID,
    status_value: str | None = None,
    duration_seconds: int | None = None,
    completed_at: datetime | None = None,
    caller_name: str | None = None,
) -> Call:
    """Update a call record."""
    call = await get_call(db, call_id)

    if status_value:
        call.status = CallStatus(status_value)
    if duration_seconds is not None:
        call.duration_seconds = duration_seconds
    if completed_at is not None:
        call.completed_at = completed_at
    if caller_name is not None:
        call.caller_name = caller_name

    log("info", "Call updated", call_id=str(call_id))
    return call


async def delete_call(db: AsyncSession, call_id: UUID) -> None:
    """Delete a call record."""
    call = await get_call(db, call_id)
    await db.delete(call)
    log("info", "Call deleted", call_id=str(call_id))
