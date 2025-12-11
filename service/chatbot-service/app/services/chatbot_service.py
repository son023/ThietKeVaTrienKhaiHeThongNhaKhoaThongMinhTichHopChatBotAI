import google.generativeai as genai
from thefuzz import process
from app.core.config import settings
from app.services.ai_engine import AIEngine
from app.repositories.neo4j_repo import Neo4jRepository
from app.repositories.history_repo import HistoryRepository

# Cấu hình Gemini (Chỉ làm 1 lần ở cấp module hoặc trong __init__)
genai.configure(api_key=settings.GEMINI_KEY)
llm = genai.GenerativeModel('gemini-2.5-flash-lite')

class ChatService:
    def __init__(self, ai_engine: AIEngine, neo4j_repo: Neo4jRepository, history_repo: HistoryRepository):
        self.ai = ai_engine
        self.repo = neo4j_repo
        self.history_repo = history_repo
        
        # Cache danh sách bệnh để sửa lỗi chính tả
        print("📥 Đang caching danh sách thực thể từ DB...")
        self.valid_entities = self.repo.get_all_entity_names() # Giả sử repo đã có hàm này
        
        # Mapping từ Intent Model -> Quan hệ trong Neo4j
        self.intent_map = {
            "INTENT_TREATMENT": ["TREATED_BY", "REQUIRES_TREATMENT", "MANAGED_BY"],
            "INTENT_CAUSE": ["CAUSE_BY", "RISK_FACTOR"],
            "INTENT_DIAGNOSIS": ["INDICATES_DISEASE", "HAS_SYMPTOM"], 
            "INTENT_ADVICE": ["REQUIRES_ADVICE", "PREVENTS"]
        }

    async def process_question(self, user_id: str, user_msg: str) -> dict:
        # 1. Lưu User Message
        await self.history_repo.save_message(user_id, "user", user_msg)
        
        # 2. AI Dự đoán
        intent_data = self.ai.predict_intent(user_msg)
        intent_label = intent_data['label']
        entities = self.ai.predict_ner(user_msg)
        
        # --- LOGIC NHÁNH 1: KHÔNG TÌM THẤY ENTITY (CHIT-CHAT) ---
        if not entities:
            reply = self._chat_chit_chat(user_msg)
            await self.history_repo.save_message(user_id, "bot", reply)
            return {"reply": reply, "intent": "CHAT"}

        # --- LOGIC NHÁNH 2: HỎI BỆNH LÝ ---
        raw_name = entities[0]['text']
        entity_type = entities[0]['type']

        # 3. Sửa lỗi chính tả
        corrected_name = self._normalize_name(raw_name)
        
        # 4. Query Neo4j
        relations = self.intent_map.get(intent_label, [])
        knowledge = []
        
        # Tìm kiến thức dựa trên intent
        for rel in relations:
            found = self.repo.find_relations(corrected_name, entity_type, rel) 
            # (Bạn cần đảm bảo hàm find_relations trong Neo4jRepo hoạt động đúng)
            knowledge.extend(found)
        
        # Nếu tìm theo intent không thấy, thử tìm generic (Fallback)
        if not knowledge:
            print("⚠️ Không tìm thấy theo intent, tìm kiếm mở rộng...")
            # Có thể gọi 1 hàm tìm chung chung ở repo tại đây
        
        # 5. Gemini sinh câu trả lời
        knowledge_str = ", ".join(list(set(knowledge)))
        reply = self._generate_response(user_msg, corrected_name, knowledge_str)
        
        # 6. Lưu Bot Message
        await self.history_repo.save_message(user_id, "bot", reply)
        
        return {
            "reply": reply,
            "intent": intent_label,
            "entities_found": corrected_name
        }

    def _normalize_name(self, raw):
        if not self.valid_entities: return raw
        best, score = process.extractOne(raw, self.valid_entities)
        return best if score >= 75 else raw

    def _generate_response(self, question, entity, context):
        if not context:
            return f"Tôi xin lỗi, hiện tại tôi chưa có đủ dữ liệu về vấn đề '{entity}' này."
            
        prompt = f"""
        Bạn là bác sĩ nha khoa AI.
        Dựa trên kiến thức y khoa sau: [{context}]
        Hãy trả lời câu hỏi: "{question}" liên quan đến "{entity}".
        Trả lời tự nhiên, thân thiện, dùng Markdown in đậm ý chính.
        """
        try:
            return llm.generate_content(prompt).text.strip()
        except:
            return f"Thông tin tìm được: {context}"

    def _chat_chit_chat(self, msg):
        try:
            prompt = f"Trả lời ngắn gọn, thân thiện câu hỏi này với vai trò trợ lý nha khoa: '{msg}'"
            return llm.generate_content(prompt).text.strip()
        except:
            return "Chào bạn, tôi là trợ lý nha khoa. Bạn cần giúp gì?"