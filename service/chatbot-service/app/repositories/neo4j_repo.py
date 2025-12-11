from neo4j import GraphDatabase
from app.core.config import settings

class Neo4jRepository:
    def __init__(self):
        # Kết nối DB
        self.driver = GraphDatabase.driver(
            settings.NEO4J_URI, 
            auth=(settings.NEO4J_USER, settings.NEO4J_PASS)
        )

    def close(self):
        self.driver.close()

    def get_all_entity_names(self):
        """Lấy tất cả tên thực thể để làm từ điển sửa lỗi chính tả"""
        query = "MATCH (n) RETURN n.name as name"
        with self.driver.session() as session:
            result = session.run(query)
            return list(set([record["name"] for record in result if record["name"]]))

    def find_relations(self, entity_name: str, entity_type: str, relation_type: str):
        """Tìm thông tin tri thức trong Graph"""
        name_lower = entity_name.strip().lower()
        
        # Query Cypher của bạn
        cypher_query = f"""
        MATCH (source)
        WHERE toLower(source.name) CONTAINS $name_lower 
        AND $label in labels(source)
        MATCH (source)-[:{relation_type}]->(target)
        RETURN target.name as result_name
        """
        
        with self.driver.session() as session:
            result = session.run(cypher_query, name_lower=name_lower, label=entity_type)
            return [record["result_name"] for record in result]