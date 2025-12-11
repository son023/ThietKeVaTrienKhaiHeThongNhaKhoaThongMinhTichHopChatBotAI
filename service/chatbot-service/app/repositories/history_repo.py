# app/repositories/history_repo.py
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from datetime import datetime
import pymongo

class HistoryRepository:
    def __init__(self):
        self.client = AsyncIOMotorClient(settings.MONGO_URI)
        self.db = self.client[settings.MONGO_DB_NAME]
        self.collection = self.db["chat_messages"]
        
        # Tạo index cho user_id và timestamp để query nhanh hơn
        # (Chạy ngầm, không ảnh hưởng flow chính)
        self.collection.create_index([("user_id", pymongo.ASCENDING), ("timestamp", pymongo.DESCENDING)])

    async def save_message(self, user_id: str, role: str, content: str):
        """Lưu tin nhắn kèm user_id"""
        doc = {
            "user_id": user_id,
            "role": role,        # 'user' hoặc 'bot'
            "content": content,
            "timestamp": datetime.utcnow()
        }
        await self.collection.insert_one(doc)

    async def get_history(self, user_id: str, limit: int = 20, before_time: str = None):
        """
        Lấy lịch sử chat của 1 user cụ thể.
        Logic "Messenger": Lấy tin nhắn mới hơn (gần hiện tại) hoặc cũ hơn mốc before_time.
        """
        query = {"user_id": user_id}
        
        # Nếu có mốc thời gian (khi kéo lên trên), chỉ lấy tin cũ hơn mốc đó
        if before_time:
            try:
                # Client gửi lên string ISO, ta convert lại thành datetime để so sánh
                pivot = datetime.fromisoformat(before_time.replace('Z', '+00:00'))
                query["timestamp"] = {"$lt": pivot}
            except ValueError:
                pass

        # Sort giảm dần theo thời gian (mới nhất -> cũ nhất) để lấy đúng limit
        cursor = self.collection.find(query).sort("timestamp", -1).limit(limit)
        
        messages = []
        async for doc in cursor:
            # Convert ObjectId của Mongo sang string cho đẹp
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            messages.append(doc)
            
        # Đảo ngược list lại để Client hiển thị từ trên xuống dưới (Cũ -> Mới)
        # Hoặc để Client tự đảo, tùy bạn quy ước. Ở đây mình trả về Mới -> Cũ cho đúng logic lấy data.
        return messages