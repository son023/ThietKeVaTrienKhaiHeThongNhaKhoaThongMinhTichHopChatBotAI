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

    async def process_question(self, user_id: str, user_msg: str) -> dict:
        # 1. Lưu User Message
        await self.history_repo.save_message(user_id, "user", user_msg)

        # 2. AI Dự đoán Intent (Vẫn dùng để lọc Chit-chat)
        intent_data = self.ai.predict_intent(user_msg)
        intent_label = intent_data['label']

        # --- NHÁNH 1: CHIT-CHAT (Xã giao) ---
        if intent_label in ["GREETING", "THANKS", "OTHER"]:
            reply = self._chat_chit_chat(user_msg)
            await self.history_repo.save_message(user_id, "bot", reply)
            return {"reply": reply, "intent": intent_label, "entities_found": []}

        # --- NHÁNH 2: TRA CỨU KIẾN THỨC (LOGIC ƯU TIÊN NER) ---

        # Bước A: Chạy NER Model
        entities = self.ai.predict_ner(user_msg)
        search_results = []
        search_strategy = ""
        entities_found_names = []

        if entities:
            # === CHIẾN THUẬT 1: NER DRIVEN SEARCH ===
            # Nếu tìm thấy thực thể, TA CHỈ SEARCH THEO THỰC THỂ ĐÓ
            # Cách này tôn trọng độ chính xác của NER model
            search_strategy = "NER_MATCH"
            print(f"🎯 [NER DETECTED] Tìm thấy {len(entities)} thực thể. Bỏ qua search cả câu.")

            for ent in entities:
                entity_text = ent['text']
                entities_found_names.append(entity_text)
                print(f"   -> Đang Vector Search tập trung vào: '{entity_text}'")

                # Search chính xác vào thực thể này để lấy context hàng xóm
                # Limit=2 cho mỗi entity là đủ để lấy node chính và node tương đồng nhất
                specific_results = self.repo.search_hybrid(entity_text, limit=2)
                search_results.extend(specific_results)
        else:
            # === CHIẾN THUẬT 2: FALLBACK SEMANTIC SEARCH ===
            # Nếu NER không tìm ra gì, mới dùng cả câu hỏi để tìm kiếm
            search_strategy = "FULL_SENTENCE_FALLBACK"
            print(f"⚠️ [NO ENTITY] NER không bắt được gì. Chuyển sang search ngữ nghĩa cả câu.")

            # Search cả câu hỏi
            search_results = self.repo.search_hybrid(user_msg, limit=3)

        # --- Lọc trùng lặp kết quả (Dedup) ---
        unique_results = {}
        if search_results:
            for doc in search_results:
                if doc.page_content not in unique_results:
                    unique_results[doc.page_content] = doc
        final_docs = list(unique_results.values())

        # --- Tạo Context từ kết quả tìm được ---
        context_parts = []
        if final_docs:
            for doc in final_docs:
                node_text = doc.page_content
                # doc.metadata['neighbors'] chứa danh sách quan hệ hàng xóm từ Neo4j
                neighbors = doc.metadata.get('neighbors', [])
                neighbor_str = "; ".join(neighbors)
                context_parts.append(f"- Chủ đề: {node_text}\n  Thông tin chi tiết: {neighbor_str}")

            context_str = "\n".join(context_parts)
            print(f"📚 [CONTEXT] Dữ liệu nạp vào Gemini ({search_strategy}):\n{context_str[:200]}...") # In gọn để debug

            # Sinh câu trả lời
            reply = self._generate_response(user_msg, context_str)
        else:
            print("❌ Không tìm thấy thông tin nào từ DB.")
            reply = self._generate_response(user_msg, context=None)

        # 3. Lưu Bot Message
        await self.history_repo.save_message(user_id, "bot", reply)

        return {
            "reply": reply,
            "intent": intent_label,
            "entities_found": entities_found_names
        }

    def _generate_response(self, question, context):
        if not context:
            prompt = f"""
            Bạn là trợ lý nha khoa AI. Người dùng hỏi: "{question}".
            Hiện tại hệ thống cơ sở dữ liệu không trả về thông tin cụ thể nào.
            Hãy trả lời khéo léo dựa trên kiến thức y khoa chung của bạn, nhưng KHUYẾN CÁO người dùng đây chỉ là tham khảo 
            và nên đi khám bác sĩ nếu có triệu chứng bất thường.
            """
        else:
            prompt = f"""
            Bạn là bác sĩ nha khoa AI chuyên nghiệp.
            
            DỮ LIỆU BỆNH ÁN/KIẾN THỨC TÌM ĐƯỢC:
            {context}
            
            CÂU HỎI CỦA NGƯỜI DÙNG: "{question}"
            
            YÊU CẦU TRẢ LỜI:
            1. Dựa CHỦ YẾU vào thông tin tìm được ở trên.
            2. Nếu dữ liệu có nhắc đến "Nguyên nhân" (CAUSE_BY) hoặc "Cách chữa" (TREATED_BY), hãy ưu tiên nêu rõ.
            3. Trình bày ngắn gọn, dễ hiểu, dùng gạch đầu dòng nếu liệt kê.
            4. Giọng điệu ân cần, chuyên nghiệp.
            """

        try:
            return llm.generate_content(prompt).text.strip()
        except:
            return "Xin lỗi, hệ thống đang quá tải. Vui lòng thử lại sau."

    def _chat_chit_chat(self, msg):
        try:
            prompt = f"Trả lời ngắn gọn, thân thiện câu hỏi xã giao: '{msg}' (Vai trò: Trợ lý nha khoa)"
            return llm.generate_content(prompt).text.strip()
        except:
            return "Chào bạn, tôi có thể giúp gì cho sức khỏe răng miệng của bạn?"