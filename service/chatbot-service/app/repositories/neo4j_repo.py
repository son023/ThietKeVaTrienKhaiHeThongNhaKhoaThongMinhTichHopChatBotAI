from langchain_huggingface import HuggingFaceEmbeddings
from langchain_neo4j import Neo4jVector
from app.core.config import settings

class Neo4jRepository:
    def __init__(self):
        print("Đang kết nối đến Neo4j Vector Index...")
        
        self.embedding_model = HuggingFaceEmbeddings(
            model_name="keepitreal/vietnamese-sbert",
            model_kwargs={'device': settings.DEVICE if settings.DEVICE == 'cpu' else 'cuda'},
            encode_kwargs={'normalize_embeddings': True}
        )

        try:
            self.vector_store = Neo4jVector.from_existing_index(
                embedding=self.embedding_model,
                url=settings.NEO4J_URI,
                username=settings.NEO4J_USER,
                password=settings.NEO4J_PASS,
                index_name="dental_entity_index",
                embedding_node_property="embedding"
            )
            print("Kết nối Vector Store OK!")
        except Exception as e:
            print(f"Lỗi kết nối Vector Store: {e}")
            self.vector_store = None

    def search_with_relations(self, query: str, allowed_relations: list, limit: int = 3):
        if not self.vector_store: 
            return []

        try:
            search_results = self.vector_store.similarity_search(query, k=limit)
        except Exception as e:
            print(f"⚠️ Lỗi Vector Search: {e}")
            return []

        final_data = []

        driver = self.vector_store._driver 

        for doc in search_results:
            node_text = doc.page_content

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

            final_data.append({
                "text": node_text,
                "neighbors": neighbors_list
            })

        return final_data

    def close(self):
        pass