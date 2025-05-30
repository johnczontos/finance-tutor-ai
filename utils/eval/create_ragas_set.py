import httpx
import json
import time

API_URL = "http://localhost:8000/ask"
INPUT_FILE = "test_qa.json"  # now using your QA file
OUTPUT_FILE = "ragas_dataset_from_gold.json"
TIMEOUT = 30.0  # seconds

def fetch_answer(query):
    try:
        start = time.perf_counter()
        response = httpx.get(API_URL, params={"query": query}, timeout=TIMEOUT)
        latency = time.perf_counter() - start

        if response.status_code != 200:
            return {
                "question": query,
                "answer": "",
                "contexts": [],
                "latency_sec": None,
                "error": f"HTTP {response.status_code}"
            }

        data = response.json()

        return {
            "question": query,
            "answer": data.get("answer", ""),
            "contexts": data.get("contexts", []),
            "latency_sec": round(latency, 3)
        }

    except Exception as e:
        return {
            "question": query,
            "answer": "",
            "contexts": [],
            "latency_sec": None,
            "error": str(e)
        }

def main():
    with open(INPUT_FILE, "r") as f:
        items = json.load(f)

    results = []
    for i, item in enumerate(items):
        query = item["question"]
        reference = item["answer"]  # gold answer becomes reference
        print(f"🔎 {i+1}/{len(items)}: {query[:80]}")
        result = fetch_answer(query)
        result["reference"] = reference
        results.append(result)

    with open(OUTPUT_FILE, "w") as f:
        json.dump(results, f, indent=2)

    print(f"\n✅ Saved {len(results)} to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
