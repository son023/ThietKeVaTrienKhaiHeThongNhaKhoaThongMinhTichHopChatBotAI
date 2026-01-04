from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ChatRequest(BaseModel):
    user_id: str
    message: str

class ChatResponse(BaseModel):
    response: str
    status: str


class HistoryResponse(BaseModel):
    id: str
    role: str
    content: str
    timestamp: datetime