from typing import List, Optional
from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str  # user, assistant, system
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []


class ChatResponse(BaseModel):
    reply: str
    suggested_actions: Optional[List[str]] = []
    is_fallback: bool = False
