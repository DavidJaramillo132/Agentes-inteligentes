# modules/chat/models.py
from typing import List
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorCollection
from .schemas import ChatMessage, ChatMessageCreate
from uuid import uuid4

def create_session_id() -> str:
    return str(uuid4())

# Guarda un mensaje en MongoDB
async def store_message(collection: AsyncIOMotorCollection, data: ChatMessageCreate) -> ChatMessage:
    message = ChatMessage(
        session_id=data.session_id,
        message=data.message,
        sender=data.sender,
        timestamp=datetime.utcnow().isoformat()
    )
    await collection.insert_one(message.dict())
    return message

# Recupera mensajes de una sesión
async def get_messages(collection: AsyncIOMotorCollection, session_id: str) -> List[ChatMessage]:
    cursor = collection.find({"session_id": session_id})
    return [ChatMessage(**msg) async for msg in cursor]

# Elimina mensajes de una sesión
async def delete_messages(collection: AsyncIOMotorCollection, session_id: str):
    await collection.delete_many({"session_id": session_id})
