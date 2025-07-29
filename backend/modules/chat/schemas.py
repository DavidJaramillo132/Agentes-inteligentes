from pydantic import BaseModel
from typing import Optional

class ChatSession(BaseModel):
    session_id: str
    user_email: Optional[str] = None

class ChatMessageCreate(BaseModel):
    session_id: str
    message: str
    sender: str

class ChatMessage(BaseModel):
    session_id: str
    message: str
    sender: str
    timestamp: str