"""Async HTTP client for communicating with the ML inference service."""
import httpx
from fastapi import HTTPException, status

from app.config import settings
from app.utils.logging import log

# Timeout: 30s connect, 60s read (ML inference can be slow)
_TIMEOUT = httpx.Timeout(connect=10.0, read=60.0, write=10.0, pool=10.0)


async def analyze_audio(audio_bytes: bytes, filename: str) -> dict:
    """Send audio file to ML service for full analysis.

    Implements retry-once on timeout per build-plan.md requirements.
    """
    for attempt in range(2):
        try:
            async with httpx.AsyncClient(
                base_url=settings.ML_SERVICE_URL, timeout=_TIMEOUT
            ) as client:
                files = {"audio": (filename, audio_bytes, "audio/wav")}
                response = await client.post("/ml/analyze", files=files)
                response.raise_for_status()
                return response.json()
        except httpx.TimeoutException:
            if attempt == 0:
                log("warning", "ML service timeout, retrying", endpoint="/ml/analyze")
                continue
            log("error", "ML service timeout after retry", endpoint="/ml/analyze")
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="ML service timed out",
            )
        except httpx.HTTPStatusError as exc:
            log("error", "ML service error", status_code=exc.response.status_code)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"ML service returned {exc.response.status_code}",
            )
        except httpx.ConnectError:
            log("error", "ML service unavailable", endpoint=settings.ML_SERVICE_URL)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="ML service is unavailable",
            )


async def stream_chunk(audio_bytes: bytes) -> dict:
    """Send an audio chunk for quick real-time risk estimation."""
    try:
        async with httpx.AsyncClient(
            base_url=settings.ML_SERVICE_URL, timeout=_TIMEOUT
        ) as client:
            files = {"audio": ("chunk.wav", audio_bytes, "audio/wav")}
            response = await client.post("/ml/stream", files=files)
            response.raise_for_status()
            return response.json()
    except (httpx.TimeoutException, httpx.ConnectError) as exc:
        log("error", "ML stream request failed", error=str(exc))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML service unavailable for streaming",
        )


async def check_health() -> dict:
    """Check ML service health status."""
    try:
        async with httpx.AsyncClient(
            base_url=settings.ML_SERVICE_URL, timeout=httpx.Timeout(5.0)
        ) as client:
            response = await client.get("/health")
            response.raise_for_status()
            return response.json()
    except Exception as exc:
        return {"status": "unhealthy", "error": str(exc)}
