from fastapi import APIRouter, Depends, Query, Path, HTTPException
from typing import List

from app.dtos.chat_dto import ChatRequest, ChatResponse, HistoryResponse
from app.services.chatbot_service import ChatService
from app.services.ai_engine import AIEngine
from app.repositories.neo4j_repo import Neo4jRepository
from app.repositories.history_repo import HistoryRepository

router = APIRouter()

# --- KHAI BÁO BIẾN GLOBAL (Chưa khởi tạo) ---
ai_engine_instance = None
neo4j_repo_instance = None
history_repo_instance = None
chat_service_instance = None

# --- HÀM KHỞI TẠO (Sẽ được gọi khi Server bắt đầu chạy) ---
def initialize_components():
    global ai_engine_instance, neo4j_repo_instance, history_repo_instance, chat_service_instance
    
    print("🚀 Đang khởi tạo các module (bên trong Event Loop)...")
    
    # Lúc này Event Loop đã chạy, khởi tạo Mongo/Neo4j ở đây là an toàn
    ai_engine_instance = AIEngine()
    neo4j_repo_instance = Neo4jRepository()
    history_repo_instance = HistoryRepository() # Mongo Client tạo ở đây sẽ đúng loop

    chat_service_instance = ChatService(
        ai_engine=ai_engine_instance, 
        neo4j_repo=neo4j_repo_instance,
        history_repo=history_repo_instance
    )
    print("✅ Hệ thống đã sẵn sàng xử lý request!")

# --- HÀM DỌN DẸP (Khi tắt server) ---
def shutdown_components():
    if neo4j_repo_instance:
        neo4j_repo_instance.close()
    print("🛑 Đã đóng các kết nối.")

# --- API ENDPOINTS ---

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    if not chat_service_instance:
        raise HTTPException(status_code=503, detail="Server đang khởi động, vui lòng chờ...")
    
    try:
        result = await chat_service_instance.process_question(req.user_id, req.message)
        return ChatResponse(response=result["reply"], status="success")
    except Exception as e:
        print(f"❌ Error at chat_endpoint: {e}")
        return ChatResponse(response="Lỗi server.", status="error")

@router.get("/history/{user_id}", response_model=List[HistoryResponse])
async def get_history(
    user_id: str = Path(...),
    limit: int = 20, 
    before_time: str = Query(None)
):
    if not history_repo_instance:
        raise HTTPException(status_code=503, detail="Server đang khởi động...")

    try:
        messages = await history_repo_instance.get_history(user_id, limit, before_time)
        return messages
    except Exception as e:
        print(f"❌ Error at get_history: {e}")
        raise HTTPException(status_code=500, detail=str(e))