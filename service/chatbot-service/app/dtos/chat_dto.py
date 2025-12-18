# app/dtos/chat_dto.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ChatRequest(BaseModel):
    user_id: str  # Nhận UUID dạng string (vd: "550e8400-e29b...")
    message: str

class ChatResponse(BaseModel):
    response: str
    status: str

# DTO trả về cho API lịch sử
class HistoryResponse(BaseModel):
    id: str
    role: str
    content: str
    timestamp: datetime