from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from .websocket.connection_manager import ws_manager
import asyncio

app = FastAPI(title="HexPOS Edge API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Connect to Redis
    await ws_manager.connect_redis()

@app.websocket("/ws/{tenant_id}/{location_id}")
async def websocket_endpoint(websocket: WebSocket, tenant_id: str, location_id: str):
    await ws_manager.connect_client(websocket, tenant_id, location_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming client messages here
    except WebSocketDisconnect:
        ws_manager.disconnect_client(websocket, tenant_id, location_id)

@app.get("/health")
def health_check():
    return {"status": "healthy"}
