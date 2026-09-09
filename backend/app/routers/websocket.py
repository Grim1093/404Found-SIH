"""WebSocket server for real-time monitoring and live audio streaming."""
import json
from uuid import UUID

import jwt
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import async_session
from app.utils.logging import log

router = APIRouter(tags=["WebSocket"])


class ConnectionManager:
    """Manages active WebSocket connections per user."""

    def __init__(self):
        self._connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str) -> None:
        await websocket.accept()
        if user_id not in self._connections:
            self._connections[user_id] = []
        self._connections[user_id].append(websocket)
        log("info", "WebSocket connected", user_id=user_id,
            total_connections=self._total_count())

    def disconnect(self, websocket: WebSocket, user_id: str) -> None:
        if user_id in self._connections:
            self._connections[user_id] = [
                ws for ws in self._connections[user_id] if ws != websocket
            ]
            if not self._connections[user_id]:
                del self._connections[user_id]
        log("info", "WebSocket disconnected", user_id=user_id,
            total_connections=self._total_count())

    async def send_to_user(self, user_id: str, message: dict) -> None:
        """Send a JSON message to all connections of a specific user."""
        for ws in self._connections.get(user_id, []):
            try:
                await ws.send_json(message)
            except Exception:
                pass

    async def broadcast(self, message: dict) -> None:
        """Send a JSON message to all connected clients."""
        for user_id in list(self._connections.keys()):
            await self.send_to_user(user_id, message)

    def _total_count(self) -> int:
        return sum(len(conns) for conns in self._connections.values())


manager = ConnectionManager()


def _authenticate_ws(token: str) -> str | None:
    """Validate JWT from WebSocket query param. Returns user_id or None."""
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        if payload.get("type") != "access":
            return None
        return payload["sub"]
    except (jwt.InvalidTokenError, KeyError):
        return None


@router.websocket("/ws/monitor")
async def websocket_monitor(
    websocket: WebSocket,
    token: str = Query(..., description="JWT access token"),
) -> None:
    """Authenticated WebSocket for real-time dashboard monitoring.

    Server → Client events:
      - risk_update: real-time risk score update for a call
      - alert_created: new alert triggered
      - call_status_changed: call status update

    Client → Server events:
      - ping: heartbeat (server replies with pong)
    """
    user_id = _authenticate_ws(token)
    if not user_id:
        await websocket.close(code=4001, reason="Invalid or expired token")
        return

    await manager.connect(websocket, user_id)

    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                event_type = message.get("type", "")

                if event_type == "ping":
                    await websocket.send_json({"type": "pong"})

            except json.JSONDecodeError:
                await websocket.send_json({
                    "type": "error",
                    "detail": "Invalid JSON",
                })
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
