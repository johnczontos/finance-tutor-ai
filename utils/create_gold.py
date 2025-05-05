import os
import json
from typing import List
from collections import defaultdict
from tqdm import tqdm
from dotenv import load_dotenv

from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_core.documents import Document

# Load .env variables
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
pinecone_api_key = os.getenv("PINECONE_API_KEY")
index_name = os.getenv("PINECONE_INDEX_NAME", "financetutor")

# Initialize clients
llm = ChatOpenAI(model="gpt-4", temperature=0.3, api_key=openai_api_key)
embeddings = OpenAIEmbeddings(api_key=openai_api_key)
vectorstore = PineconeVectorStore(index_name=index_name, embedding=embeddings)

# Load previously saved documents
with open("all_documents.json", "r") as f:
    data = json.load(f)

all_documents = [
    Document(page_content=d["page_content"], metadata=d["metadata"])
    for d in data
]

print(f"✅ Loaded {len(all_documents)} documents from all_documents.json")
print("Sample:", all_documents[0].metadata)

# Group by URL
grouped_by_url = defaultdict(list)
for doc in all_documents:
    url = doc.metadata.get("url")
    if url:
        grouped_by_url[url].append(doc)

print(f"📚 Found {len(grouped_by_url)} unique URLs to generate one hard question each.")

# Function to generate slightly harder conceptual question
def generate_one_question(doc: Document) -> str:
    prompt = f"""
You are a finance professor writing quiz questions. Write ONE slightly more challenging, conceptual question based on the content below. 
Avoid surface-level definitions — instead, ask the student to explain, compare, or apply a key idea.

--- DOCUMENT START ---
{doc.page_content}
--- DOCUMENT END ---

Respond with only the question.
"""
    try:
        response = llm.invoke(prompt)
        return response.content.strip()
    except Exception as e:
        print(f"❌ Error generating question for {doc.metadata.get('heading')} — {e}")
        return None

# Build evaluation dataset
eval_dataset = []

for url, docs in tqdm(grouped_by_url.items()):
    longest_doc = max(docs, key=lambda d: len(d.page_content))
    question = generate_one_question(longest_doc)
    if question:
        eval_dataset.append({
            "query": question,
            "expected_url": url,
            "expected_heading": longest_doc.metadata.get("heading")
        })

# # Save output
# with open("retrieval_eval_set.json", "w") as f:
#     json.dump(eval_dataset, f, indent=2)

# print(f"\n✅ Saved {len(eval_dataset)} hard queries to retrieval_eval_set.json")

existing_data = []
file_path = "retrieval_eval_set.json"

if os.path.exists(file_path):
    with open(file_path, "r") as f:
        try:
            existing_data = json.load(f)
        except json.JSONDecodeError:
            print("⚠️ Warning: retrieval_eval_set.json exists but could not be decoded. Starting fresh.")

# Combine and deduplicate by (query, expected_url)
combined = existing_data + eval_dataset
seen = set()
deduped = []

for item in combined:
    key = (item["query"], item["expected_url"])
    if key not in seen:
        deduped.append(item)
        seen.add(key)

# Save final result
with open(file_path, "w") as f:
    json.dump(deduped, f, indent=2)

print(f"\n✅ Appended {len(eval_dataset)} entries. Total unique examples: {len(deduped)}")