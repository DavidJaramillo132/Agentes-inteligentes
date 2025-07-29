# modules/chat/router.py
from fastapi import APIRouter, Depends
from ..mongodb import get_chat_collection
from .schemas import ChatMessage, ChatMessageCreate, ChatSession
from . import models
from motor.motor_asyncio import AsyncIOMotorCollection

router = APIRouter()

@router.post("/sessions", response_model=ChatSession)
async def create_session():
    session_id = models.create_session_id()
    return ChatSession(session_id=session_id)

@router.post("/messages", response_model=ChatMessage)
async def send_message(
    data: ChatMessageCreate,
    collection: AsyncIOMotorCollection = Depends(get_chat_collection),
):
    return await models.store_message(collection, data)

@router.get("/messages/{session_id}", response_model=list[ChatMessage])
async def get_chat(
    session_id: str,
    collection: AsyncIOMotorCollection = Depends(get_chat_collection),
):
    return await models.get_messages(collection, session_id)

@router.delete("/messages/{session_id}")
async def delete_chat(
    session_id: str,
    collection: AsyncIOMotorCollection = Depends(get_chat_collection),
):
    await models.delete_messages(collection, session_id)
    return {"detail": "Chat eliminado correctamente"}
