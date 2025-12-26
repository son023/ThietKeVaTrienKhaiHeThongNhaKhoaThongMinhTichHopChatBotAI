# app/repositories/neo4j_repo.py
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_neo4j import Neo4jVector
from app.core.config import settings

class Neo4jRepository:
    def __init__(self):
        print("🔌 Đang kết nối đến Neo4j Vector Index...")
        
        self.embedding_model = HuggingFaceEmbeddings(
            model_name="keepitreal/vietnamese-sbert",
            model_kwargs={'device': settings.DEVICE if settings.DEVICE == 'cpu' else 'cuda'},
            encode_kwargs={'normalize_embeddings': True}
        )

        # Khởi tạo Vector Store (Không cần retrieval_query ở đây nữa vì ta sẽ query tay)
        try:
            self.vector_store = Neo4jVector.from_existing_index(
                embedding=self.embedding_model,
                url=settings.NEO4J_URI,
                username=settings.NEO4J_USER,
                password=settings.NEO4J_PASS,
                index_name="dental_entity_index",
                embedding_node_property="embedding"
            )
            print("✅ Kết nối Vector Store OK!")
        except Exception as e:
            print(f"❌ Lỗi kết nối Vector Store: {e}")
            self.vector_store = None

    def search_with_relations(self, query: str, allowed_relations: list, limit: int = 3):
        """
        Tìm kiếm lai:
        1. Dùng Vector để tìm Node gốc (ví dụ: tìm ra node 'Sâu răng')
        2. Dùng Cypher để chỉ lấy các hàng xóm có quan hệ nằm trong allowed_relations
        """
        if not self.vector_store: 
            return []

        # Bước 1: Vector Search để lấy các Node gốc (nhưng chưa lấy hàng xóm vội)
        try:
            # results là list các Document, mỗi doc có page_content (text của node) và metadata
            # Lưu ý: Hàm này trả về Node có độ tương đồng cao nhất
            search_results = self.vector_store.similarity_search(query, k=limit)
        except Exception as e:
            print(f"⚠️ Lỗi Vector Search: {e}")
            return []

        final_data = []

        # Bước 2: Với mỗi Node tìm được, dùng Cypher để "soi" hàng xóm theo đúng Intent
        # Chúng ta cần truy cập trực tiếp driver Neo4j (nằm bên trong vector_store)
        driver = self.vector_store._driver 

        for doc in search_results:
            node_text = doc.page_content
            
            # Query Cypher: Tìm node có text này, rồi bung ra các quan hệ cho phép
            cypher = """
            MATCH (n:Searchable {text: $text})
            MATCH (n)-[r]-(m)
            WHERE type(r) IN $allowed_rels
            RETURN type(r) as rel_type, m.text as neighbor_text
            """
            
            neighbors_list = []
            try:
                with driver.session() as session:
                    result = session.run(cypher, text=node_text, allowed_rels=allowed_relations)
                    for record in result:
                        rel = record['rel_type']
                        nb_text = record['neighbor_text']
                        neighbors_list.append(f"[{rel}] {nb_text}")
            except Exception as e:
                print(f"⚠️ Lỗi Cypher Filter: {e}")

            # Đóng gói kết quả
            final_data.append({
                "text": node_text,
                "neighbors": neighbors_list
            })

        return final_data

    def close(self):
        pass