"""Structured JSON logging utility."""
import json
import logging
from datetime import datetime, timezone

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger("voxguard")


def log(level: str, message: str, **kwargs) -> None:
    """Emit a structured JSON log entry."""
    entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "level": level,
        "message": message,
        "service": "backend",
        **kwargs,
    }
    logger.log(getattr(logging, level.upper()), json.dumps(entry))
