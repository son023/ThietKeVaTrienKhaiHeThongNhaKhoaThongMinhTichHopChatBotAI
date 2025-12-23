from langchain_huggingface import HuggingFaceEmbeddings
from langchain_neo4j import Neo4jVector
from app.core.config import settings

class Neo4jRepository:
    def __init__(self):
        print("🔌 Đang kết nối đến Neo4j Vector Index...")

        # 1. Cấu hình Model Embedding
        self.embedding_model = HuggingFaceEmbeddings(
            model_name="keepitreal/vietnamese-sbert",
            model_kwargs={'device': settings.DEVICE if settings.DEVICE == 'cpu' else 'cuda'},
            encode_kwargs={'normalize_embeddings': True}
        )

        # 2. Định nghĩa câu Query lấy hàng xóm (ĐƯA VÀO ĐÂY)
        # Lưu ý: Phải dùng query này ngay lúc khởi tạo
        self.retrieval_query = """
        RETURN
            node.text AS text,
            score,
            {
                node_type: head(labels(node)),
                neighbors: [ (node)-[r]-(neighbor) | 
                    type(r) + ": " + coalesce(neighbor.text, neighbor.name, "N/A") 
                ]
            } AS metadata
        """

        # 3. Kết nối Vector Store với retrieval_query
        try:
            self.vector_store = Neo4jVector.from_existing_index(
                embedding=self.embedding_model,
                url=settings.NEO4J_URI,
                username=settings.NEO4J_USER,
                password=settings.NEO4J_PASS,
                index_name="dental_entity_index",
                embedding_node_property="embedding",
                retrieval_query=self.retrieval_query  # <--- QUAN TRỌNG: Gắn query vào đây!
            )
            print("✅ Đã kết nối Vector Store thành công!")
        except Exception as e:
            print(f"❌ Lỗi kết nối Vector Store: {e}")
            self.vector_store = None

    def search_hybrid(self, user_query: str, limit: int = 3):
        """
        Thực hiện tìm kiếm vector
        """
        if not self.vector_store:
            return []

        print(f"\n[DEBUG] 🔍 Vector Searching cho câu hỏi: '{user_query}'")

        try:
            # Không cần truyền retrieval_query vào đây nữa (vì đã config ở __init__)
            results = self.vector_store.similarity_search(
                user_query,
                k=limit
            )

            # --- DEBUG ĐỂ KIỂM TRA ---
            for doc in results:
                # Lấy neighbors an toàn (nếu None thì trả về list rỗng)
                neighbors = doc.metadata.get('neighbors', [])
                print(f"   -> Tìm thấy: '{doc.page_content}'")
                print(f"      Neighbors count: {len(neighbors)}")
                if neighbors:
                    print(f"      Sample neighbor: {neighbors[0]}")

            return results
        except Exception as e:
            print(f"⚠️ Lỗi khi search vector: {e}")
            return []

    def close(self):
        pass