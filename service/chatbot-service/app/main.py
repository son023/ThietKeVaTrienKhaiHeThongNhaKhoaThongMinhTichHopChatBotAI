import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Import controller và hàm khởi tạo
from app.api import chat_controller

# --- LIFESPAN MANAGER (Quản lý vòng đời) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Code chạy KHI SERVER BẬT (Startup)
    chat_controller.initialize_components()
    
    yield # Server chạy tại đây
    
    # 2. Code chạy KHI SERVER TẮT (Shutdown)
    chat_controller.shutdown_components()

app = FastAPI(title="Dental AI Service", lifespan=lifespan)

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "chatbot-service"}

app.include_router(chat_controller.router, prefix="/api")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9992)