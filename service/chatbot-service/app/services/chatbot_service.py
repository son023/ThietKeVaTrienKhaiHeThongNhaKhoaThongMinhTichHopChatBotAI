# app/services/chatbot_service.py
import google.generativeai as genai
from app.core.config import settings
from app.services.ai_engine import AIEngine
from app.repositories.neo4j_repo import Neo4jRepository
from app.repositories.history_repo import HistoryRepository

# Cấu hình Gemini
genai.configure(api_key=settings.GEMINI_KEY)
llm = genai.GenerativeModel('gemini-2.5-flash-lite')

class ChatService:
    def __init__(self, ai_engine: AIEngine, neo4j_repo: Neo4jRepository, history_repo: HistoryRepository):
        self.ai = ai_engine
        self.repo = neo4j_repo
        self.history_repo = history_repo

        # --- BẢN ĐỒ ÁNH XẠ INTENT -> RELATION (Logic cũ bạn thích) ---
        self.intent_to_relations = {
            "INTENT_TREATMENT": ["TREATED_BY", "MANAGED_BY", "SUPPORTS_TREATMENT", "REQUIRES_TREATMENT"],
            "INTENT_CAUSE": ["CAUSE_BY", "RISK_FACTOR"],
            "INTENT_DIAGNOSIS": ["INDICATES_DISEASE", "HAS_SYMPTOM"],
            "INTENT_ADVICE": ["PREVENTS", "REQUIRES_ADVICE"],
            # Các intent khác hoặc không rõ thì lấy các quan hệ quan trọng nhất
            "DEFAULT": ["TREATED_BY", "CAUSE_BY", "HAS_SYMPTOM", "INDICATES_DISEASE"]
        }

    async def process_question(self, user_id: str, user_msg: str) -> dict:
        # 1. Lưu User Message
        await self.history_repo.save_message(user_id, "user", user_msg)

        # 2. AI Phân tích (NER + Intent)
        intent_data = self.ai.predict_intent(user_msg)
        intent_label = intent_data['label']
        entities = self.ai.predict_ner(user_msg)
        
        # Xác định các quan hệ cần loang dựa trên Intent
        target_relations = self.intent_to_relations.get(intent_label, self.intent_to_relations["DEFAULT"])
        
        print(f"🎯 [INTENT] {intent_label} -> Chỉ tìm quan hệ: {target_relations}")

        # 3. Tìm kiếm dữ liệu (Logic: Vector tìm Node -> Cypher lọc Relation)
        search_results = []
        
        if entities:
            # Ưu tiên tìm theo thực thể
            for ent in entities:
                # Gọi hàm search mới có tham số relations
                results = self.repo.search_with_relations(ent['text'], target_relations, limit=2)
                search_results.extend(results)
        
        # Fallback: Nếu không có entity hoặc search không ra, thử search cả câu
        if not search_results:
            print("⚠️ Fallback search cả câu...")
            search_results = self.repo.search_with_relations(user_msg, target_relations, limit=3)

        # 4. Xử lý kết quả & Tạo Context
        # Lọc trùng lặp
        unique_docs = {}
        for doc in search_results:
            if doc['text'] not in unique_docs:
                unique_docs[doc['text']] = doc
        
        context_str = ""
        if unique_docs:
            context_parts = []
            for doc in unique_docs.values():
                # Format lại thông tin hàng xóm
                neighbors_str = "; ".join(doc['neighbors']) if doc['neighbors'] else "Không có thông tin liên quan theo Intent này."
                context_parts.append(f"- Chủ đề: {doc['text']}\n  Chi tiết liên quan: {neighbors_str}")
            context_str = "\n".join(context_parts)
        
        # 5. Sinh câu trả lời (Prompt xử lý cả Chit-chat)
        reply = self._generate_response_smart(user_msg, context_str, intent_label)

        # 6. Lưu Bot Message
        await self.history_repo.save_message(user_id, "bot", reply)

        return {
            "reply": reply,
            "intent": intent_label,
            "entities": [e['text'] for e in entities]
        }

    def _generate_response_smart(self, question, context, intent):
        # Prompt thông minh xử lý cả Chit-chat lẫn Chuyên môn
        prompt = f"""
        Bạn là Trợ lý Nha khoa AI thông minh và thân thiện.
        
        THÔNG TIN ĐẦU VÀO:
        - Câu hỏi: "{question}"
        - Dự đoán ý định: {intent}
        - Kiến thức tìm được từ DB (nếu có):
        {context if context else "[Không tìm thấy dữ liệu chuyên môn]"}

        NHIỆM VỤ CỦA BẠN:
        1. XỬ LÝ CHIT-CHAT: Nếu ý định là 'GREETING', 'THANKS' hoặc câu hỏi là xã giao (chào hỏi, hỏi tên...), hãy trả lời ngắn gọn, vui vẻ, không cần dùng kiến thức DB.
        
        2. XỬ LÝ CHUYÊN MÔN: Nếu là câu hỏi bệnh lý/nha khoa:
           - Dựa CHỦ YẾU vào phần "Kiến thức tìm được" ở trên.
           - Trả lời đúng trọng tâm Intent (Ví dụ: Intent là TREATMENT thì tập trung vào cách chữa).
           - Nếu không có kiến thức trong DB, hãy khuyên người dùng đi khám bác sĩ, trả lời chung chung an toàn.
        
        3. Yêu cầu chung: Giọng điệu ân cần như bác sĩ, dùng tiếng Việt chuẩn, định dạng Markdown dễ đọc.
        """
        try:
            return llm.generate_content(prompt).text.strip()
        except:
            return "Hệ thống đang bận, vui lòng thử lại sau."