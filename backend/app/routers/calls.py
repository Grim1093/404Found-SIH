"""Call management API routes."""
import math
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.call import (
    CallListResponse,
    CallResponse,
    CallStatsResponse,
    CreateCallRequest,
    UpdateCallRequest,
)
from app.services import call_service

router = APIRouter(prefix="/api/calls", tags=["Calls"])


@router.post("", response_model=CallResponse, status_code=201)
async def create_call(
    request: CreateCallRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> CallResponse:
    """Create a new call record."""
    call = await call_service.create_call(
        db=db,
        caller_id=request.caller_id,
        caller_name=request.caller_name,
        call_type=request.call_type,
        language=request.language,
        call_metadata=request.call_metadata,
        created_by=user.id,
    )
    return CallResponse.model_validate(call)


@router.get("", response_model=CallListResponse)
async def list_calls(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: str | None = Query(None, description="Filter by status"),
    call_type: str | None = Query(None, description="Filter by call type"),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> CallListResponse:
    """List calls with pagination and filtering."""
    calls, total = await call_service.get_calls(
        db=db, page=page, limit=limit,
        status_filter=status, call_type_filter=call_type,
    )
    return CallListResponse(
        items=[CallResponse.model_validate(c) for c in calls],
        total=total,
        page=page,
        limit=limit,
        pages=math.ceil(total / limit) if total > 0 else 0,
    )


@router.get("/stats", response_model=CallStatsResponse)
async def get_stats(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> CallStatsResponse:
    """Get aggregate call statistics for the dashboard."""
    stats = await call_service.get_call_stats(db)
    return CallStatsResponse(**stats)


@router.get("/{call_id}", response_model=CallResponse)
async def get_call(
    call_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> CallResponse:
    """Get a single call by ID."""
    call = await call_service.get_call(db, call_id)
    return CallResponse.model_validate(call)


@router.patch("/{call_id}", response_model=CallResponse)
async def update_call(
    call_id: UUID,
    request: UpdateCallRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> CallResponse:
    """Update a call record."""
    call = await call_service.update_call(
        db=db, call_id=call_id,
        status_value=request.status,
        duration_seconds=request.duration_seconds,
        completed_at=request.completed_at,
        caller_name=request.caller_name,
    )
    return CallResponse.model_validate(call)


@router.delete("/{call_id}", status_code=204)
async def delete_call(
    call_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> None:
    """Delete a call record."""
    await call_service.delete_call(db, call_id)
