import torch
from transformers import (
    AutoTokenizer, 
    AutoModelForTokenClassification, 
    pipeline
)
from app.core.config import settings

class AIEngine:
    def __init__(self):
        print(f"🤖 Đang khởi tạo AI Engine trên thiết bị: {settings.DEVICE}...")
        
        # 1. Load Intent Model (Dùng Pipeline cho gọn)
        # Yêu cầu: folder 'intent_model' phải chuẩn HuggingFace
        print(f"   - Loading Intent model từ: {settings.INTENT_MODEL_PATH}")
        try:
            self.intent_classifier = pipeline(
                "text-classification", 
                model=settings.INTENT_MODEL_PATH, 
                tokenizer=settings.INTENT_MODEL_PATH,
                device=0 if settings.DEVICE == "cuda" else -1
            )
        except Exception as e:
            print(f"⚠️ Lỗi load Intent Model: {e}")
            self.intent_classifier = None

        # 2. Load NER Model (Load thủ công để xử lý offset kỹ hơn)
        print(f"   - Loading NER model từ: {settings.NER_MODEL_PATH}")
        try:
            self.ner_tokenizer = AutoTokenizer.from_pretrained(settings.NER_MODEL_PATH)
            self.ner_model = AutoModelForTokenClassification.from_pretrained(settings.NER_MODEL_PATH)
            self.ner_model.to(settings.DEVICE)
            self.ner_model.eval()
            
            # Lấy map label từ config của model (cái này tự có khi save_pretrained)
            self.id2label = self.ner_model.config.id2label
        except Exception as e:
            print(f"⚠️ Lỗi load NER Model: {e}")
            self.ner_model = None

    def predict_intent(self, text: str) -> dict:
        """Trả về: {'label': 'INTENT_A', 'score': 0.95}"""
        if not self.intent_classifier:
            return {"label": "CHAT", "score": 0.0}
            
        # Pipeline trả về list, lấy phần tử đầu tiên
        result = self.intent_classifier(text)[0]
        return result

    def predict_ner(self, text: str) -> list:
        """
        Trả về list các thực thể.
        Logic convert từ Token sang Word giữ nguyên từ code cũ của bạn nhưng gọn hơn.
        """
        if not self.ner_model:
            return []

        # Tokenize có trả về offset để map ngược lại vị trí trong câu
        inputs = self.ner_tokenizer(
            text, 
            return_offsets_mapping=True, 
            truncation=True, 
            return_tensors="pt"
        ).to(settings.DEVICE)
        
        offset_mapping = inputs.pop("offset_mapping")[0].cpu().numpy()
        
        with torch.no_grad():
            outputs = self.ner_model(**inputs)
        
        logits = outputs.logits
        predictions = torch.argmax(logits, dim=2)[0].cpu().numpy()

        # Logic ghép token thành entity (B-xxx, I-xxx)
        entities = []
        current_entity = None

        for idx, pred in enumerate(predictions):
            label_name = self.id2label[pred]
            start, end = offset_mapping[idx]
            
            if start == end: continue # Bỏ qua special tokens (CLS, SEP)

            if label_name.startswith("B-"):
                if current_entity:
                    entities.append(current_entity)
                current_entity = {
                    "type": label_name[2:], # Bỏ tiền tố B-
                    "text": text[start:end], # Tạm thời lấy text của token này
                    "start": int(start),
                    "end": int(end)
                }
            elif label_name.startswith("I-") and current_entity:
                if label_name[2:] == current_entity["type"]:
                    # Nối dài entity hiện tại
                    current_entity["end"] = int(end)
                    # Cập nhật text full
                    current_entity["text"] = text[current_entity["start"]:current_entity["end"]]
            else:
                if current_entity:
                    entities.append(current_entity)
                    current_entity = None
        
        if current_entity:
            entities.append(current_entity)

        return entities