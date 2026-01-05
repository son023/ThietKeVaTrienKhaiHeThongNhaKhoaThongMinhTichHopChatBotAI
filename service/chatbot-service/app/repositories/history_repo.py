from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from datetime import datetime
import pymongo

class HistoryRepository:
    def __init__(self):
        self.client = AsyncIOMotorClient(settings.MONGO_URI)
        self.db = self.client[settings.MONGO_DB_NAME]
        self.collection = self.db["chat_messages"]

        self.collection.create_index([("user_id", pymongo.ASCENDING), ("timestamp", pymongo.DESCENDING)])

    async def save_message(self, user_id: str, role: str, content: str):
        doc = {
            "user_id": user_id,
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow()
        }
        await self.collection.insert_one(doc)

    async def get_history(self, user_id: str, limit: int = 20, before_time: str = None):
        query = {"user_id": user_id}
        if before_time:
            try:
                pivot = datetime.fromisoformat(before_time.replace('Z', '+00:00'))
                query["timestamp"] = {"$lt": pivot}
            except ValueError:
                pass
        cursor = self.collection.find(query).sort("timestamp", -1).limit(limit)
        
        messages = []
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            messages.append(doc)

        return messages