"""Full audio file analysis endpoint."""
import tempfile
import os
from fastapi import APIRouter, File, HTTPException, UploadFile, status
from app.analysis.pipeline import analyze_audio
from app.utils.logging import log

router = APIRouter(prefix="/ml", tags=["Analysis"])

ALLOWED_CONTENT_TYPES = {
    "audio/wav", "audio/x-wav", "audio/wave",
    "audio/mpeg", "audio/mp3",
    "audio/flac",
    "audio/ogg",
}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB


@router.post("/analyze")
async def analyze_file(audio: UploadFile = File(...)):
    """Analyze an uploaded audio file for voice cloning detection."""
    # Validate content type
    if audio.content_type and audio.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unsupported audio format: {audio.content_type}. Allowed: {', '.join(ALLOWED_CONTENT_TYPES)}",
        )
    
    # Read file
    audio_bytes = await audio.read()
    if len(audio_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB",
        )
    
    # Save to temp file for processing
    suffix = os.path.splitext(audio.filename or "audio.wav")[1]
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name
    
    try:
        # Get model and device from app state
        from app.main import app_state
        result = analyze_audio(
            file_path=tmp_path,
            model=app_state.get("model"),
            device=app_state.get("device"),
        )
        return result.to_dict()
    except Exception as e:
        log("error", "Analysis failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Analysis failed. Please try again.",
        )
    finally:
        # Clean up temp file
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
