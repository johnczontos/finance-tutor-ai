import json
from dotenv import load_dotenv
import os
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from sklearn.metrics import precision_score, recall_score, f1_score

# --- Config ---
TOP_K = 3
SHOW_MISSES = True

# --- Load API keys ---
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
pinecone_api_key = os.getenv("PINECONE_API_KEY")
index_name = os.getenv("PINECONE_INDEX_NAME", "financetutor")

# --- Init vector store ---
embeddings = OpenAIEmbeddings(api_key=openai_api_key)
vectorstore = PineconeVectorStore(index_name=index_name, embedding=embeddings)

# --- Load gold queries ---
with open("retrieval_eval_set.json", "r") as f:
    eval_set = json.load(f)

# --- Evaluation ---
true_positives = 0
retrieval_results = []

print(f"\n🔍 Evaluating on {len(eval_set)} queries (Top-{TOP_K})...\n")

for i, item in enumerate(eval_set):
    query = item["query"]
    expected_url = item["expected_url"]

    try:
        retrieved_docs = vectorstore.similarity_search(query, k=TOP_K)
        retrieved_urls = [doc.metadata.get("url") for doc in retrieved_docs]

        hit = expected_url in retrieved_urls
        retrieval_results.append(hit)

        if not hit and SHOW_MISSES:
            print(f"❌ Miss {i+1}:")
            print("Query:", query)
            print("Expected:", expected_url)
            print("Retrieved:", retrieved_urls[:3])
            print()

    except Exception as e:
        print(f"⚠️ Retrieval error for query {i+1}: {e}")
        retrieval_results.append(False)

# --- Metrics ---
precision_at_k = sum(retrieval_results) / len(retrieval_results)
recall_at_k = precision_at_k  # since 1 relevant doc per query
f1_at_k = f1_score([1]*len(eval_set), retrieval_results)

print("\n📊 Evaluation Results:")
print(f"Precision@{TOP_K}: {precision_at_k:.3f}")
print(f"Recall@{TOP_K}:    {recall_at_k:.3f}")
print(f"F1@{TOP_K}:        {f1_at_k:.3f}")
