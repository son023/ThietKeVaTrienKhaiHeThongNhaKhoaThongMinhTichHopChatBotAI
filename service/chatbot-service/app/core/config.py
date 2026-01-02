import os
from dotenv import load_dotenv
from pathlib import Path

# --- SỬA ĐOẠN NÀY ---
# Tìm đường dẫn gốc của dự án (thư mục chứa file .env)
# config.py nằm trong app/core/, nên cần lùi ra 2 cấp (../../) để về root
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BASE_DIR / ".env"

# Load file .env rõ ràng
load_dotenv(dotenv_path=ENV_PATH)

class Settings:
    is_docker = os.path.exists("/.dockerenv")

    if is_docker:
        default_neo4j_uri = "bolt://neo4j:7687"
        default_mongo_uri = "mongodb://mongodb:27017"
    else:
        default_neo4j_uri = "bolt://localhost:7687"
        default_mongo_uri = "mongodb://localhost:27017"
    
    NEO4J_URI = os.getenv("NEO4J_URI", default_neo4j_uri)
    NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PASS = os.getenv("NEO4J_PASSWORD", "password123")
    GEMINI_KEY = os.getenv("GEMINI_API_KEY")
    
    MONGO_URI = os.getenv("MONGO_URI", default_mongo_uri)
    MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "dental_chatbot")

    # Model config
    INTENT_MODEL_PATH = os.getenv("INTENT_MODEL_PATH") 
    NER_MODEL_PATH = os.getenv("NER_MODEL_PATH")

    EMBEDDING_MODEL_NAME = "keepitreal/vietnamese-sbert"
    
    DEVICE = "cuda" if os.getenv("USE_GPU") == "true" else "cpu"

settings = Settings()