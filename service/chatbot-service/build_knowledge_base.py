# build_knowledge_base.py (PHIÊN BẢN NẠP TRỰC TIẾP - KHÔNG CẦN AI)
import json
import sys
from neo4j_db import Neo4jConnection

# --- CẤU HÌNH ---
DATA_FILE_PATH = "kb_v4_final_train.json"
NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "password123"

# Kết nối DB
try:
    db = Neo4jConnection(NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD)
    print("✅ Đã kết nối đến Neo4j.")
except Exception as e:
    print(f"❌ Lỗi kết nối Neo4j: {e}")
    sys.exit(1)

def build_graph_direct(json_file_path):
    print(f"\n--- BẮT ĐẦU NẠP DỮ LIỆU TRỰC TIẾP TỪ FILE ---")
    
    # 1. Đọc dữ liệu
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            documents = json.load(f)
    except Exception as e:
        print(f"❌ Lỗi đọc file data: {e}")
        return
    
    print(f"📂 Đã đọc {len(documents)} tài liệu. Đang nạp vào Database...")
    
    count_triples = 0
    
    # 2. Duyệt và Insert
    for i, doc in enumerate(documents):
        # Lấy danh sách entities và relations CÓ SẴN trong file
        raw_entities = doc.get('entities', [])
        raw_relations = doc.get('relations', [])
        
        # Tạo map ID -> Entity để tra cứu nhanh
        # Ví dụ: {'T1': {'id': 'T1', 'text': 'Sâu răng', 'type': 'Disease'}}
        id_to_entity = {e['id']: e for e in raw_entities}
        
        for rel in raw_relations:
            try:
                head_id = rel['head']
                tail_id = rel['tail']
                relation_type = rel['type']
                
                head_ent = id_to_entity.get(head_id)
                tail_ent = id_to_entity.get(tail_id)
                
                if head_ent and tail_ent:
                    # --- SỬA Ở ĐÂY: CHUẨN HÓA DỮ LIỆU ---
                    # Đưa hết về chữ thường để tránh trùng lặp (Fluor vs fluor)
                    head_ent['text'] = head_ent['text'].strip().lower()
                    tail_ent['text'] = tail_ent['text'].strip().lower()
                    
                    db.insert_triple(head_ent, tail_ent, relation_type)
                    count_triples += 1
                    
            except Exception as e:
                print(f"⚠️ Lỗi tại dòng quan hệ trong doc {i}: {e}")
                continue

        # In tiến độ
        if (i+1) % 100 == 0:
            print(f" -> Đã xử lý {i+1}/{len(documents)} docs... ({count_triples} quan hệ)")

    print("\n------------------------------------------------")
    print(f"🎉 HOÀN TẤT NẠP DỮ LIỆU!")
    print(f"🔗 Tổng số quan hệ đã nạp: {count_triples}")
    print("------------------------------------------------")
    db.close()

if __name__ == "__main__":
    build_graph_direct(DATA_FILE_PATH)