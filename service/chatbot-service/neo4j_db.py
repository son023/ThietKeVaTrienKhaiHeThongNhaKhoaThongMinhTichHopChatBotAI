# neo4j_db.py
from neo4j import GraphDatabase

class Neo4jConnection:
    def __init__(self, uri, user, pwd):
        self.driver = GraphDatabase.driver(uri, auth=(user, pwd))

    def close(self):
        if self.driver:
            self.driver.close()

    def query_graph(self, entity_name, entity_type, relation_type):
        """
        Hàm query dùng cho Chatbot (tìm kiếm tri thức)
        Đã sửa để return 'text' thay vì 'name'
        """
        name_lower = entity_name.strip().lower()

        # Query Cypher: Tìm kiếm vô hướng
        cypher_query = f"""
        MATCH (source)-[:{relation_type}]-(target)
        WHERE toLower(source.text) CONTAINS $name_lower 
        AND $label in labels(source)
        RETURN target.text as result_text
        """

        with self.driver.session() as session:
            result = session.run(cypher_query, name_lower=name_lower, label=entity_type)
            # Trả về list text
            return [record["result_text"] for record in result]

    def insert_triple(self, head, tail, relation):
        """
        Nhập bộ ba vào Neo4j.
        SỬA QUAN TRỌNG: Lưu property 'text' và Chuẩn hóa Label (Title Case)
        """
        head_text = head['text']
        tail_text = tail['text']

        # --- SỬA ĐOẠN NÀY ---
        # 1. replace khoảng trắng -> gạch dưới
        # 2. .title() để viết hoa chữ cái đầu (disease -> Disease)
        head_label = head['type'].strip().replace(" ", "_").title()
        tail_label = tail['type'].strip().replace(" ", "_").title()
        rel_type = relation.strip().replace(" ", "_").upper() # Quan hệ nên viết hoa hết (TREATED_BY)

        # Query MERGE
        query = f"""
        MERGE (h:{head_label} {{text: $head_text}})
        MERGE (t:{tail_label} {{text: $tail_text}})
        MERGE (h)-[:{rel_type}]->(t)
        """

        with self.driver.session() as session:
            session.run(query, head_text=head_text, tail_text=tail_text)

    def get_all_entities(self):
        """Lấy danh sách tất cả tên thực thể"""
        query = "MATCH (n) RETURN n.text as text"
        with self.driver.session() as session:
            result = session.run(query)
            return list(set([record["text"] for record in result if record["text"]]))