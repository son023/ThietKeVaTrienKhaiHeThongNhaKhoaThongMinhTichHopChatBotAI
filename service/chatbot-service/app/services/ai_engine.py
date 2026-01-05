import torch
from transformers import (
    AutoTokenizer, 
    AutoModelForTokenClassification, 
    pipeline
)
from app.core.config import settings

class AIEngine:
    def __init__(self):
        print(f"Đang khởi tạo AI Engine trên thiết bị: {settings.DEVICE}...")

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

        print(f"   - Loading NER model từ: {settings.NER_MODEL_PATH}")
        try:
            self.ner_tokenizer = AutoTokenizer.from_pretrained(settings.NER_MODEL_PATH)
            self.ner_model = AutoModelForTokenClassification.from_pretrained(settings.NER_MODEL_PATH)
            self.ner_model.to(settings.DEVICE)
            self.ner_model.eval()

            self.id2label = self.ner_model.config.id2label
        except Exception as e:
            print(f"⚠️ Lỗi load NER Model: {e}")
            self.ner_model = None

    def predict_intent(self, text: str) -> dict:
        if not self.intent_classifier:
            return {"label": "CHAT", "score": 0.0}

        result = self.intent_classifier(text)[0]
        return result

    def predict_ner(self, text: str) -> list:
        if not self.ner_model:
            return []

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

        entities = []
        current_entity = None

        for idx, pred in enumerate(predictions):
            label_name = self.id2label[pred]
            start, end = offset_mapping[idx]
            
            if start == end: continue

            if label_name.startswith("B-"):
                if current_entity:
                    entities.append(current_entity)
                current_entity = {
                    "type": label_name[2:],
                    "text": text[start:end],
                    "start": int(start),
                    "end": int(end)
                }
            elif label_name.startswith("I-") and current_entity:
                if label_name[2:] == current_entity["type"]:
                    current_entity["end"] = int(end)
                    current_entity["text"] = text[current_entity["start"]:current_entity["end"]]
            else:
                if current_entity:
                    entities.append(current_entity)
                    current_entity = None
        
        if current_entity:
            entities.append(current_entity)

        return entities