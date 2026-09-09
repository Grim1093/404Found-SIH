"""Real-time audio chunk analysis endpoint."""
from fastapi import APIRouter, File, HTTPException, UploadFile, status
from app.analysis.pipeline import analyze_chunk
from app.utils.logging import log

router = APIRouter(prefix="/ml", tags=["Streaming"])


@router.post("/stream")
async def analyze_stream_chunk(audio: UploadFile = File(...)):
    """Analyze a short audio chunk for real-time streaming detection.
    
    Designed for low-latency analysis of 1-3 second audio windows.
    """
    audio_bytes = await audio.read()
    
    if len(audio_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Empty audio data",
        )
    
    try:
        from app.main import app_state
        result = analyze_chunk(
            audio_bytes=audio_bytes,
            model=app_state.get("model"),
            device=app_state.get("device"),
        )
        return result
    except Exception as e:
        log("error", "Stream analysis failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stream analysis failed",
        )
