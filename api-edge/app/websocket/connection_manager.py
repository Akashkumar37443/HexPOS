import asyncio
import json
import logging
from typing import Dict, Set, Optional

from fastapi import WebSocket, WebSocketDisconnect
import aioredis

logger = logging.getLogger(__name__)

class TenantConnectionManager:
    """
    High-availability WebSocket manager built for Multi-Tenant POS architecture.
    Groups connections strictly by tenant_id and location_id to prevent data leakage.
    """
    def __init__(self, redis_url: str):
        self.redis_url = redis_url
        self.redis: Optional[aioredis.Redis] = None
        self.pubsub: Optional[aioredis.client.PubSub] = None
        
        # Structure: { "tenant_id": { "location_id": set(WebSocket) } }
        self.active_rooms: Dict[str, Dict[str, Set[WebSocket]]] = {}
        
        # Background task reference
        self._listener_task: Optional[asyncio.Task] = None

    async def connect_redis(self):
        try:
            self.redis = await aioredis.from_url(self.redis_url, decode_responses=True)
            self.pubsub = self.redis.pubsub()
            logger.info("Connected to Enterprise Redis Bus.")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            raise

    async def connect_client(self, websocket: WebSocket, tenant_id: str, location_id: str):
        """Accepts a WS connection and bins it into the correct tenant/location scope."""
        await websocket.accept()
        
        if tenant_id not in self.active_rooms:
            self.active_rooms[tenant_id] = {}
        
        if location_id not in self.active_rooms[tenant_id]:
            self.active_rooms[tenant_id][location_id] = set()
            
        self.active_rooms[tenant_id][location_id].add(websocket)
        logger.info(f"Connected Terminal in Tenant {tenant_id}, Location {location_id}.")
        
        # Ensure we are subscribed to this tenant's global event stream
        await self._ensure_tenant_subscription(tenant_id)

    def disconnect_client(self, websocket: WebSocket, tenant_id: str, location_id: str):
        try:
            self.active_rooms[tenant_id][location_id].discard(websocket)
            if not self.active_rooms[tenant_id][location_id]:
                del self.active_rooms[tenant_id][location_id]
            if not self.active_rooms[tenant_id]:
                del self.active_rooms[tenant_id]
                # Note: Might want to unsubscribe from redis if tenant has 0 locations online
        except KeyError:
            pass
        logger.info(f"Disconnected Terminal from Tenant {tenant_id}, Location {location_id}.")

    async def broadcast_to_location(self, tenant_id: str, location_id: str, message: dict):
        """Sends real-time updates (like KDS tickets) strictly to a specific store location."""
        if tenant_id in self.active_rooms and location_id in self.active_rooms[tenant_id]:
            dead_sockets = set()
            for connection in self.active_rooms[tenant_id][location_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    dead_sockets.add(connection)
            
            for dead in dead_sockets:
                self.disconnect_client(dead, tenant_id, location_id)

    async def _ensure_tenant_subscription(self, tenant_id: str):
        """Idempotent subscription to a tenant's Redis channel."""
        channel_name = f"tenant:{tenant_id}:events"
        if self.pubsub and channel_name not in self.pubsub.channels:
            await self.pubsub.subscribe(channel_name)
            logger.info(f"Subscribed to Redis channel: {channel_name}")
            
            # Start listener loop if not already running
            if not self._listener_task or self._listener_task.done():
                self._listener_task = asyncio.create_task(self._redis_event_loop())

    async def _redis_event_loop(self):
        """Asynchronously processes incoming events from the .NET Transactional Core."""
        if not self.pubsub:
            return
            
        try:
            async for message in self.pubsub.listen():
                if message["type"] == "message":
                    channel = message["channel"]
                    try:
                        # Expecting format: tenant:{tenant_id}:events
                        tenant_id = channel.split(":")[1]
                        data = json.loads(message["data"])
                        
                        # Route the message to the appropriate location rooms
                        # The payload must specify a target terminal or location
                        location_id = data.get("TerminalId") # Simplified mapping
                        
                        if location_id:
                            await self.broadcast_to_location(tenant_id, location_id, data)
                            
                    except Exception as e:
                        logger.error(f"Error routing Redis message on {channel}: {e}")
        except asyncio.CancelledError:
            logger.info("Redis event loop cancelled.")
            
# Singleton initialization for FastAPI DI
ws_manager = TenantConnectionManager(redis_url="redis://localhost:6379")
