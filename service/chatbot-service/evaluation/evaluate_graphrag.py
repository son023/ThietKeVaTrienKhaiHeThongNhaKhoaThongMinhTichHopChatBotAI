"""
Script đánh giá GraphRAG chatbot nha khoa sử dụng Ragas framework
"""

import asyncio
import json
import os
import sys
import codecs
from typing import List, Dict
from datetime import datetime

# Fix Windows console encoding
if sys.platform == "win32":
    sys.stdout = codecs.getwriter("utf-8")(sys.stdout.buffer, "strict")
    sys.stderr = codecs.getwriter("utf-8")(sys.stderr.buffer, "strict")

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# ==================== CẤU HÌNH ====================
USE_GOOGLE_API = True
GOOGLE_API_KEY = "AIzaSyAwD1QocytbPR9G2sSo7QRLXGMaULH_87o"
GOOGLE_MODEL = "gemini-2.5-flash-lite"

OLLAMA_MODEL = "gemma3:12b"
OLLAMA_BASE_URL = "http://localhost:11434"

MAX_TEST_CASES = 3
NUM_EPOCHS = 1
USE_SINGLE_METRIC = True
# ===================================================

try:
    from datasets import Dataset
    from ragas import evaluate
    from ragas.metrics import faithfulness
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain_ollama import ChatOllama
    from langchain_huggingface import HuggingFaceEmbeddings
    from ragas.llms import LangchainLLMWrapper
    from ragas.embeddings import LangchainEmbeddingsWrapper

    print("[OK] Đã import các thư viện cần thiết")
except ImportError as e:
    print(f"[LỖI] Lỗi import: {e}")
    print(
        "Vui lòng cài đặt: pip install ragas langchain-google-genai langchain-ollama langchain-huggingface datasets pandas"
    )
    sys.exit(1)

try:
    from app.services.ai_engine import AIEngine
    from app.repositories.neo4j_repo import Neo4jRepository
    from app.repositories.history_repo import HistoryRepository
    from app.services.chatbot_service import ChatService
    from app.core.config import settings

    print("[OK] Đã import các component của chatbot")
except ImportError as e:
    print(f"[LỖI] Lỗi import component chatbot: {e}")
    sys.exit(1)


class GraphRAGEvaluator:
    def __init__(self):
        """Khởi tạo evaluator với các component của chatbot"""
        print("\n" + "=" * 60)
        print("[KHỞI TẠO] Đang khởi tạo GraphRAG Evaluator...")
        print("=" * 60)

        print("\n[1/4] Đang tải AI Engine...")
        self.ai_engine = AIEngine()

        print("\n[2/4] Đang kết nối Neo4j Repository...")
        self.neo4j_repo = Neo4jRepository()

        print("\n[3/4] Đang khởi tạo History Repository...")
        self.history_repo = HistoryRepository()

        print("\n[4/4] Đang thiết lập Chat Service...")
        self.chat_service = ChatService(
            self.ai_engine, self.neo4j_repo, self.history_repo
        )

        print("\n[OK] Đã khởi tạo thành công!")

    async def collect_responses(self, test_cases: List[Dict]) -> List[Dict]:
        """Thu thập phản hồi từ chatbot cho tất cả test cases"""
        print("\n" + "=" * 60)
        print(f"[THU THẬP] Đang thu thập phản hồi cho {len(test_cases)} test cases")
        print("=" * 60)

        results = []
        for i, test_case in enumerate(test_cases, 1):
            question = test_case["question"]
            print(f"\n[{i}/{len(test_cases)}] Đang xử lý: {question}")
            print("-" * 60)

            try:
                response = await self.chat_service.process_question(
                    user_id="evaluator_test", user_msg=question
                )

                intent_label = response["intent"]
                entities = self.ai_engine.predict_ner(question)

                target_relations = self.chat_service.intent_to_relations.get(
                    intent_label, self.chat_service.intent_to_relations["DEFAULT"]
                )

                # Logic giống với production
                search_results = []
                if entities:
                    for ent in entities:
                        results_ent = self.neo4j_repo.search_with_relations(
                            ent["text"], target_relations, limit=2
                        )
                        search_results.extend(results_ent)

                if not search_results:
                    search_results = self.neo4j_repo.search_with_relations(
                        question, target_relations, limit=3
                    )

                # Deduplication
                unique_docs = {}
                for doc in search_results:
                    if doc["text"] not in unique_docs:
                        unique_docs[doc["text"]] = doc

                # Format contexts giống production
                contexts = []
                if unique_docs:
                    for doc in unique_docs.values():
                        neighbors_str = (
                            "; ".join(doc["neighbors"])
                            if doc["neighbors"]
                            else "Không có thông tin liên quan theo Intent này."
                        )
                        context_text = f"- Chủ đề: {doc['text']}\n  Chi tiết liên quan: {neighbors_str}"
                        contexts.append(context_text)

                result = {
                    "question": question,
                    "answer": response["reply"],
                    "contexts": contexts if contexts else ["Không tìm thấy context"],
                    "ground_truth": test_case.get("ground_truth", ""),
                }

                results.append(result)
                print(result)
                
                print(f"   [OK] Intent: {response['intent']}")
                print(f"   [OK] Entities: {response['entities']}")
                print(f"   [OK] Số contexts (sau dedup): {len(unique_docs)}")
                print(f"   [OK] Tổng context strings: {len(contexts)}")

            except Exception as e:
                print(f"   [LỖI] Lỗi khi xử lý câu hỏi: {e}")
                results.append(
                    {
                        "question": question,
                        "answer": "Đã xảy ra lỗi trong quá trình xử lý",
                        "contexts": ["Lỗi"],
                        "ground_truth": test_case.get("ground_truth", ""),
                    }
                )

        print("\n[OK] Đã thu thập tất cả phản hồi thành công!")
        return results

    def evaluate_with_ragas(self, results: List[Dict]) -> Dict:
        """Đánh giá kết quả sử dụng Ragas"""
        print("\n" + "=" * 60)
        if USE_GOOGLE_API:
            print("[ĐÁNH GIÁ] Bắt đầu đánh giá Ragas với Google API")
        else:
            print("[ĐÁNH GIÁ] Bắt đầu đánh giá Ragas với Ollama")
        print("=" * 60)

        eval_data = {
            "question": [r["question"] for r in results],
            "answer": [r["answer"] for r in results],
            "contexts": [r["contexts"] for r in results],
            "ground_truth": [r["ground_truth"] for r in results],
        }

        dataset = Dataset.from_dict(eval_data)

        # Luôn sử dụng Vietnamese SBERT để đồng nhất với Neo4j
        VIETNAMESE_SBERT_MODEL = "keepitreal/vietnamese-sbert"

        if USE_GOOGLE_API:
            print(f"\n[CẤU HÌNH] LLM Model: {GOOGLE_MODEL} (Google API)")
            print(
                f"[CẤU HÌNH] Embeddings: {VIETNAMESE_SBERT_MODEL} (Vietnamese SBERT - khớp với Neo4j)"
            )

            langchain_llm = ChatGoogleGenerativeAI(
                model=GOOGLE_MODEL,
                google_api_key=GOOGLE_API_KEY,
                temperature=0.0,
            )

            langchain_embeddings = HuggingFaceEmbeddings(
                model_name=VIETNAMESE_SBERT_MODEL,
                model_kwargs={
                    "device": settings.DEVICE if settings.DEVICE == "cpu" else "cuda"
                },
                encode_kwargs={"normalize_embeddings": True},
            )
        else:
            print(f"\n[CẤU HÌNH] LLM Model: {OLLAMA_MODEL} (Ollama)")
            print(
                f"[CẤU HÌNH] Embeddings: {VIETNAMESE_SBERT_MODEL} (Vietnamese SBERT - khớp với Neo4j)"
            )

            langchain_llm = ChatOllama(
                model=OLLAMA_MODEL,
                base_url=OLLAMA_BASE_URL,
                temperature=0.0,
            )

            langchain_embeddings = HuggingFaceEmbeddings(
                model_name=VIETNAMESE_SBERT_MODEL,
                model_kwargs={
                    "device": settings.DEVICE if settings.DEVICE == "cpu" else "cuda"
                },
                encode_kwargs={"normalize_embeddings": True},
            )

        evaluator_llm = LangchainLLMWrapper(langchain_llm)
        evaluator_embeddings = LangchainEmbeddingsWrapper(langchain_embeddings)

        metrics = [faithfulness]

        print("\n[METRICS] Đang đánh giá metric:")
        print(f"   - {faithfulness.name}")

        try:
            print(f"\n[ĐANG CHẠY] Đang chạy đánh giá...")
            print(f"[THÔNG TIN] Sẽ xử lý {len(results)} test cases")

            eval_results = evaluate(
                dataset=dataset,
                metrics=metrics,
                llm=evaluator_llm,
                embeddings=evaluator_embeddings,
                batch_size=1,
            )

            print("[OK] Đã hoàn thành đánh giá Ragas!")
            return eval_results

        except Exception as e:
            print(f"[LỖI] Lỗi trong quá trình đánh giá Ragas: {e}")
            import traceback

            traceback.print_exc()
            return None

    def generate_report(
        self,
        results: List[Dict],
        ragas_results,
        output_dir: str = "./evaluation_results",
    ):
        """Tạo báo cáo đánh giá"""
        os.makedirs(output_dir, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        results_file = os.path.join(output_dir, f"results_{timestamp}.json")
        with open(results_file, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)

        ragas_metrics = {}
        if ragas_results:
            try:
                if hasattr(ragas_results, "to_pandas"):
                    df = ragas_results.to_pandas()

                    exclude_columns = [
                        "question",
                        "answer",
                        "contexts",
                        "ground_truth",
                        "user_input",
                        "response",
                        "retrieved_contexts",
                        "reference",
                    ]

                    for col in df.columns:
                        if col not in exclude_columns:
                            try:
                                import pandas as pd
                                import numpy as np

                                numeric_values = pd.to_numeric(df[col], errors="coerce")

                                if not numeric_values.isna().all():
                                    mean_value = numeric_values.mean()
                                    if not np.isnan(mean_value):
                                        ragas_metrics[col] = float(mean_value)
                                        print(f"[METRIC] {col}: {mean_value:.4f}")

                            except Exception:
                                continue

            except Exception as e:
                print(f"[CẢNH BÁO] Không thể trích xuất metrics từ Ragas: {e}")

        report = {
            "timestamp": timestamp,
            "total_questions": len(results),
            "num_epochs": NUM_EPOCHS,
            "use_google_api": USE_GOOGLE_API,
            "llm_model": GOOGLE_MODEL if USE_GOOGLE_API else OLLAMA_MODEL,
            "embedding_model": "keepitreal/vietnamese-sbert",
            "ragas_metrics": ragas_metrics,
            "errors": len([r for r in results if "Lỗi" in r.get("answer", "")]),
        }

        report_file = os.path.join(output_dir, f"report_{timestamp}.json")
        with open(report_file, "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)

        print("\n" + "=" * 60)
        print("[BÁO CÁO] BÁO CÁO ĐÁNH GIÁ")
        print("=" * 60)
        print(f"Thời gian: {timestamp}")
        print(f"Tổng số câu hỏi: {len(results)}")
        if USE_GOOGLE_API:
            print(f"LLM Model: {GOOGLE_MODEL} (Google API)")
        else:
            print(f"LLM Model: {OLLAMA_MODEL} (Ollama)")
        print(f"Embedding Model: keepitreal/vietnamese-sbert (khớp với Neo4j)")
        print(f"Số epochs: {NUM_EPOCHS}")
        print(f"Lỗi: {report['errors']}")

        if ragas_metrics:
            print(f"\n[RAGAS] Metrics Ragas:")
            for metric, score in ragas_metrics.items():
                print(f"   {metric:.<30} {score:.4f}")

        print(f"\n[FILES] Kết quả đã lưu tại:")
        print(f"   - {results_file}")
        print(f"   - {report_file}")
        print("=" * 60)

        return report


async def main():
    """Pipeline đánh giá chính"""
    print("\n" + "=" * 60)
    if USE_GOOGLE_API:
        print("[BẮT ĐẦU] ĐÁNH GIÁ GRAPHRAG VỚI RAGAS + GOOGLE API")
    else:
        print("[BẮT ĐẦU] ĐÁNH GIÁ GRAPHRAG VỚI RAGAS + OLLAMA")
    print("=" * 60)

    if USE_GOOGLE_API:
        print(f"\n[THÔNG TIN] LLM Model: {GOOGLE_MODEL} (Google API)")
    else:
        print(f"\n[THÔNG TIN] LLM Model: {OLLAMA_MODEL} (Ollama)")

    print(f"[THÔNG TIN] Embedding model: keepitreal/vietnamese-sbert (khớp với Neo4j)")
    print(f"[THÔNG TIN] Số test cases tối đa: {MAX_TEST_CASES}")
    print(f"[THÔNG TIN] Số epochs: {NUM_EPOCHS}")
    print(f"[THÔNG TIN] Chế độ single metric: {USE_SINGLE_METRIC}")

    # Load test dataset
    test_file = os.path.join(os.path.dirname(__file__), "test_dataset.json")

    if not os.path.exists(test_file):
        print(f"\n[LỖI] Không tìm thấy test dataset: {test_file}")
        return

    with open(test_file, "r", encoding="utf-8") as f:
        test_cases = json.load(f)

    if len(test_cases) > MAX_TEST_CASES:
        print(
            f"\n[CẢNH BÁO] Giới hạn từ {len(test_cases)} xuống {MAX_TEST_CASES} test cases"
        )
        test_cases = test_cases[:MAX_TEST_CASES]

    print(f"\n[OK] Sử dụng {len(test_cases)} test cases")

    # Khởi tạo evaluator
    print("\n" + "=" * 60)
    print("[BƯỚC 1] Đang khởi tạo evaluator...")
    print("=" * 60)
    try:
        evaluator = GraphRAGEvaluator()
    except Exception as e:
        print(f"\n[LỖI] Không thể khởi tạo evaluator: {e}")
        import traceback

        traceback.print_exc()
        return

    # Thu thập phản hồi
    print("\n" + "=" * 60)
    print("[BƯỚC 2] Đang thu thập phản hồi từ chatbot...")
    print("=" * 60)
    try:
        results = await evaluator.collect_responses(test_cases)

        if not results:
            print("\n[LỖI] Không thu thập được kết quả nào!")
            return

        print(f"\n[OK] Đã thu thập thành công {len(results)} phản hồi")
    except Exception as e:
        print(f"\n[LỖI] Không thể thu thập phản hồi: {e}")
        import traceback

        traceback.print_exc()
        return

    # Đánh giá với Ragas
    print("\n" + "=" * 60)
    print("[BƯỚC 3] Đang chạy đánh giá Ragas...")
    print("=" * 60)
    try:
        ragas_results = evaluator.evaluate_with_ragas(results)

        if ragas_results is None:
            print("\n[CẢNH BÁO] Đánh giá Ragas không trả về kết quả")
    except Exception as e:
        print(f"\n[LỖI] Không thể chạy đánh giá Ragas: {e}")
        import traceback

        traceback.print_exc()
        ragas_results = None

    # Tạo báo cáo
    print("\n" + "=" * 60)
    print("[BƯỚC 4] Đang tạo báo cáo...")
    print("=" * 60)
    try:
        evaluator.generate_report(results, ragas_results)
    except Exception as e:
        print(f"\n[LỖI] Không thể tạo báo cáo: {e}")
        import traceback

        traceback.print_exc()
        return

    print("\n[OK] Đã hoàn thành đánh giá thành công!")
    print("=" * 60)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n[CẢNH BÁO] Đánh giá bị ngắt bởi người dùng")
    except Exception as e:
        print(f"\n\n[LỖI] Lỗi nghiêm trọng: {e}")
        import traceback

        traceback.print_exc()
