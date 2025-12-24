# build_knowledge_base.py
import json
import sys
import os
from neo4j_db import Neo4jConnection

# --- IMPORT THƯ VIỆN CHUẨN ---
try:
    from langchain_huggingface import HuggingFaceEmbeddings
    from langchain_neo4j import Neo4jVector
except ImportError:
    print("❌ Thiếu thư viện! Hãy chạy: pip install langchain-huggingface langchain-neo4j sentence-transformers")
    sys.exit(1)

# --- CẤU HÌNH ---
DATA_FILE_PATH = "kb_v4_final_train.json"
NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "password123"

# Tên model embedding (Dùng model này khá tốt cho tiếng Việt y khoa)
MODEL_NAME = "keepitreal/vietnamese-sbert"

# 1. Tải Model Embedding (Load 1 lần dùng chung)
print(f"📥 Đang tải model embedding: {MODEL_NAME}...")
try:
    hf_embedding = HuggingFaceEmbeddings(
        model_name=MODEL_NAME,
        model_kwargs={'device': 'cpu'}, # Đổi thành 'cuda' nếu có GPU
        encode_kwargs={'normalize_embeddings': True}
    )
    print("✅ Đã load xong Model!")
except Exception as e:
    print(f"❌ Lỗi load model: {e}")
    sys.exit(1)

# 2. Kết nối DB
try:
    db = Neo4jConnection(NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD)
    print("✅ Đã kết nối đến Neo4j.")
except Exception as e:
    print(f"❌ Lỗi kết nối Neo4j: {e}")
    sys.exit(1)

def clear_database():
    print("\n🧹 Đang dọn dẹp dữ liệu và Index cũ...")
    query_data = "MATCH (n) DETACH DELETE n"
    query_drop_index = "DROP INDEX dental_entity_index IF EXISTS"
    try:
        with db.driver.session() as session:
            session.run(query_data)
            session.run(query_drop_index)
        print("✅ Đã xóa sạch Database và Index cũ!")
    except Exception as e:
        print(f"❌ Lỗi khi xóa DB: {e}")
        sys.exit(1)

def add_common_label_for_indexing():
    """Gán nhãn :Searchable cho các node quan trọng"""
    print("\n🏷️  Đang gán nhãn chung 'Searchable' cho các node...")
    # List này giờ đã khớp với DB vì bước 1 đã ép về Title Case (Disease, Symptom...)
    target_labels = ['Disease', 'Symptom', 'Treatment', 'Advice', 'Cause']

    count = 0
    with db.driver.session() as session:
        for label in target_labels:
            query = f"MATCH (n:{label}) SET n:Searchable"
            result = session.run(query)
            summary = result.consume()
            # --- SỬA ĐOẠN NÀY: Dùng labels_added thay vì properties_set ---
            count += summary.counters.labels_added

    if count == 0:
        print("⚠️ CẢNH BÁO: Không tìm thấy node nào để gán nhãn. Kiểm tra lại Label trong DB!")
    else:
        print(f"✅ Đã gán nhãn :Searchable cho {count} node.")

def create_vector_index():
    """Tạo Index và tính toán Vector"""
    print("\n🧠 Đang tính toán Vector và tạo Index (Giai đoạn này mất vài phút)...")

    try:
        # Hàm này sẽ:
        # 1. Quét các node có nhãn "Searchable"
        # 2. Lấy nội dung từ thuộc tính "text" (đã sửa ở neo4j_db.py)
        # 3. Tính vector và lưu vào thuộc tính "embedding"
        Neo4jVector.from_existing_graph(
            embedding=hf_embedding,
            url=NEO4J_URI,
            username=NEO4J_USER,
            password=NEO4J_PASSWORD,
            index_name="dental_entity_index",
            node_label="Searchable",
            text_node_properties=["text"], # <--- QUAN TRỌNG: Phải khớp với DB
            embedding_node_property="embedding",
        )
        print("🎉 TẠO VECTOR INDEX THÀNH CÔNG!")

    except Exception as e:
        print(f"❌ Lỗi khi tạo Index: {e}")

def build_graph_direct(json_file_path):
    # 1. Xóa sạch DB cũ
    clear_database()

    print(f"\n--- BẮT ĐẦU NẠP DỮ LIỆU TỪ FILE ---")
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            documents = json.load(f)
    except Exception as e:
        print(f"❌ Lỗi đọc file data: {e}")
        return

    print(f"📂 Đã đọc {len(documents)} tài liệu. Đang nạp vào Database...")

    count_triples = 0
    # 2. Nạp dữ liệu thô (Nodes + Relations)
    for i, doc in enumerate(documents):
        raw_entities = doc.get('entities', [])
        raw_relations = doc.get('relations', [])

        id_to_entity = {e['id']: e for e in raw_entities}

        for rel in raw_relations:
            try:
                head_id = rel['head']
                tail_id = rel['tail']
                relation_type = rel['type']

                head_ent = id_to_entity.get(head_id)
                tail_ent = id_to_entity.get(tail_id)

                if head_ent and tail_ent:
                    head_ent['text'] = head_ent['text'].strip().lower()
                    tail_ent['text'] = tail_ent['text'].strip().lower()

                    db.insert_triple(head_ent, tail_ent, relation_type)
                    count_triples += 1
            except Exception as e:
                # --- SỬA: IN LỖI RA ĐỂ BIẾT TẠI SAO KHÔNG NẠP ĐƯỢC ---
                print(f"❌ Lỗi nạp quan hệ trong doc {i}: {e}")
                # continue (có thể continue hoặc dừng luôn để fix)

        if (i+1) % 100 == 0:
            print(f" -> Đã xử lý {i+1} tài liệu...")

    print(f"🔗 Tổng số quan hệ đã nạp: {count_triples}")

    # 3. Gán nhãn phụ để Index
    add_common_label_for_indexing()

    # 4. Tính toán Vector (Embedding)
    create_vector_index()

    print("\n------------------------------------------------")
    print(f"🎉 HOÀN TẤT! Dữ liệu đã sẵn sàng cho Chatbot.")
    print("------------------------------------------------")
    db.close()

if __name__ == "__main__":
    build_graph_direct(DATA_FILE_PATH)