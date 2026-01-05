import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api import chat_controller

@asynccontextmanager
async def lifespan(app: FastAPI):
    chat_controller.initialize_components()
    
    yield

    chat_controller.shutdown_components()

app = FastAPI(title="Dental AI Service", lifespan=lifespan)

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