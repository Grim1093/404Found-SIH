"""VoxGuard ML Service — FastAPI application entry point."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.config import settings
from app.models.model_loader import load_model
from app.routers import analyze, stream
from app.utils.logging import log

# Global app state for model and device
app_state: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load ML model on startup, cleanup on shutdown."""
    log("info", "VoxGuard ML Service starting up")
    try:
        model, device = load_model()
        app_state["model"] = model
        app_state["device"] = device
        log("info", "ML model loaded successfully")
    except Exception as e:
        log("warning", "Failed to load ML model — running in demo mode", error=str(e))
        app_state["model"] = None
        app_state["device"] = None
    yield
    log("info", "VoxGuard ML Service shutting down")
    app_state.clear()


app = FastAPI(
    title=settings.APP_NAME,
    description="Voice cloning detection ML inference service",
    version="0.1.0",
    lifespan=lifespan,
)

# Routers
app.include_router(analyze.router)
app.include_router(stream.router)


@app.get("/ml/health", tags=["Health"])
async def health_check():
    """Health check with model status."""
    return {
        "status": "healthy",
        "service": "voxguard-ml",
        "model_loaded": app_state.get("model") is not None,
        "device": str(app_state.get("device", "none")),
    }
