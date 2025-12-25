# build_knowledge_base.py
import json
import sys
import os
import time
from neo4j_db import Neo4jConnection

# --- IMPORT THƯ VIỆN CHUẨN ---
try:
    from langchain_huggingface import HuggingFaceEmbeddings
    from langchain_neo4j import Neo4jVector
except ImportError:
    print("❌ Thiếu thư viện! Hãy chạy: pip install langchain-huggingface langchain-neo4j sentence-transformers")
    sys.exit(1)

# --- CẤU HÌNH ---
DATA_FILE_PATH = os.getenv("KB_DATA_FILE", "kb_v4_final_train.json")
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")

is_docker = os.path.exists("/.dockerenv")
if is_docker:
    env_uri = os.getenv("NEO4J_URI", "bolt://neo4j:7687")
    if "localhost" in env_uri or "127.0.0.1" in env_uri:
        NEO4J_URI = "bolt://neo4j:7687"
        print(f"⚠️  Phát hiện localhost trong NEO4J_URI, đã tự động chuyển sang tên service Docker")
    else:
        NEO4J_URI = env_uri
    default_neo4j_uri = "bolt://neo4j:7687"
else:
    NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    default_neo4j_uri = "bolt://localhost:7687"

NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password123")
NEO4J_DATABASE = "neo4j"
print(f"\n📋 Cấu hình kết nối:")
print(f"   NEO4J_URI: {NEO4J_URI}")
print(f"   NEO4J_USER: {NEO4J_USER}")
print(f"   KB_DATA_FILE: {DATA_FILE_PATH}")

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

def ensure_database_exists():
    """Đảm bảo database 'neo4j' tồn tại và đang online"""
    print(f"\n🔍 Kiểm tra database '{NEO4J_DATABASE}'...")
    
    try:
        with db.driver.session(database="system") as session:
            result = session.run(
                "SHOW DATABASES WHERE name = $db_name",
                db_name=NEO4J_DATABASE
            )
            records = list(result)
            
            if not records:
                print(f" Database '{NEO4J_DATABASE}' chưa tồn tại. Đang tạo...")
                session.run(f"CREATE DATABASE {NEO4J_DATABASE} IF NOT EXISTS")
                print(f" Đã tạo database '{NEO4J_DATABASE}'")
                time.sleep(3)  # Đợi database được tạo
            else:
                db_info = records[0]
                current_status = db_info.get("currentStatus", "unknown")
                requested_status = db_info.get("requestedStatus", "unknown")
                
                print(f"   Status hiện tại: {current_status}")
                print(f"   Status yêu cầu: {requested_status}")
                
                if current_status != "online":
                    print(f" Đang start database '{NEO4J_DATABASE}'...")
                    session.run(f"START DATABASE {NEO4J_DATABASE}")
                    print(f" Đợi database '{NEO4J_DATABASE}' khởi động...")
                    
                    max_wait = 30
                    wait_interval = 2
                    for i in range(max_wait // wait_interval):
                        time.sleep(wait_interval)
                        result = session.run(
                            "SHOW DATABASES WHERE name = $db_name",
                            db_name=NEO4J_DATABASE
                        )
                        db_info = list(result)[0]
                        if db_info.get("currentStatus") == "online":
                            print(f" Database '{NEO4J_DATABASE}' đã online!")
                            return
                        print(f"   Đợi... ({(i+1)*wait_interval}s)")
                    
                    print(f"  Database mất nhiều thời gian để start, nhưng sẽ tiếp tục...")
                else:
                    print(f" Database '{NEO4J_DATABASE}' đã online và sẵn sàng!")
                    
    except Exception as e:
        print(f"  Không thể kiểm tra/tạo database: {e}")
        print(f"   Sẽ thử kết nối trực tiếp...")

ensure_database_exists()

def clear_database():
    print("\n🧹 Đang dọn dẹp dữ liệu và Index cũ...")
    query_data = "MATCH (n) DETACH DELETE n"
    query_drop_index = "DROP INDEX dental_entity_index IF EXISTS"
    try:
        with db.driver.session(database=NEO4J_DATABASE) as session:
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
    with db.driver.session(database=NEO4J_DATABASE) as session:
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
            database=NEO4J_DATABASE, 
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