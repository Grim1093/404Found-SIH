"""Audio upload and analysis API routes."""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.call import Call, CallStatus, CallType
from app.models.configuration import Configuration
from app.models.user import User
from app.schemas.analysis import AnalysisResultResponse
from app.services import analysis_service
from app.utils.logging import log

router = APIRouter(prefix="/api/analysis", tags=["Analysis"])

# Allowed audio formats and max size (50MB)
_ALLOWED_EXTENSIONS = {".wav", ".mp3", ".flac", ".ogg"}
_MAX_FILE_SIZE = 50 * 1024 * 1024


@router.post("/upload", response_model=AnalysisResultResponse, status_code=201)
async def upload_and_analyze(
    audio: UploadFile = File(..., description="Audio file (.wav, .mp3, .flac, .ogg)"),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> AnalysisResultResponse:
    """Upload an audio file for voice cloning analysis.

    1. Validates file format and size
    2. Creates a call record (type=uploaded)
    3. Forwards audio to ML service
    4. Stores analysis result and creates alert if threshold exceeded
    """
    # Validate file extension
    filename = audio.filename or "upload.wav"
    extension = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if extension not in _ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid file format '{extension}'. Allowed: {', '.join(_ALLOWED_EXTENSIONS)}",
        )

    # Read and validate size
    audio_bytes = await audio.read()
    if len(audio_bytes) > _MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size is {_MAX_FILE_SIZE // (1024*1024)}MB",
        )
    if len(audio_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Uploaded file is empty",
        )

    log("info", "Audio upload received", filename=filename, size_bytes=len(audio_bytes))

    # Create call record
    call = Call(
        call_type=CallType.UPLOADED,
        status=CallStatus.ACTIVE,
        caller_name=filename,
        created_by=user.id,
    )
    db.add(call)
    await db.flush()

    # Get user's threshold configuration
    result = await db.execute(
        select(Configuration).where(Configuration.user_id == user.id)
    )
    user_config = result.scalar_one_or_none()
    if not user_config:
        # Create default config if missing
        user_config = Configuration(user_id=user.id)
        db.add(user_config)
        await db.flush()

    # Run the analysis pipeline
    analysis = await analysis_service.run_analysis(
        db=db, call=call, audio_bytes=audio_bytes,
        filename=filename, user_config=user_config,
    )

    # Mark call as completed
    call.status = CallStatus.COMPLETED if call.status == CallStatus.ACTIVE else call.status

    return AnalysisResultResponse.model_validate(analysis)
