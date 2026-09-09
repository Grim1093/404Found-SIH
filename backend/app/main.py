"""VoxGuard Backend API — FastAPI application entry point."""
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routers import alerts, analysis, auth, calls, settings as settings_router, websocket
from app.utils.logging import log


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    log("info", "VoxGuard Backend API starting up")
    yield
    log("info", "VoxGuard Backend API shutting down")


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Real-Time Voice Cloning Detection & Prevention API",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    log(
        "error",
        "Unhandled exception",
        path=str(request.url),
        error=str(exc),
        error_type=type(exc).__name__,
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )

# Routers
app.include_router(auth.router)
app.include_router(calls.router)
app.include_router(alerts.router)
app.include_router(analysis.router)
app.include_router(settings_router.router)
app.include_router(websocket.router)


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "voxguard-backend"}
