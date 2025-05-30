from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_precision,
    context_recall,
)
from datasets import Dataset
import json
import pandas as pd
import matplotlib.pyplot as plt

# Paths
DATA_PATH = "ragas_dataset_from_gold.json"
SUMMARY_JSON = "new_ragas_metrics_summary.json"
SCORES_CSV = "new_ragas_scores_detailed.csv"
LATENCY_CSV = "new_ragas_latency.csv"
METRIC_PLOT = "new_ragas_metric_plot.png"

def load_dataset_for_ragas(path):
    with open(path, "r") as f:
        data = json.load(f)

    required_fields = ["question", "answer", "contexts", "reference"]

    clean = [
        {k: d[k] for k in required_fields}
        for d in data
        if all(k in d and d[k] for k in required_fields)
    ]

    ds = Dataset.from_list(clean)

    if len(ds) == 0:
        raise ValueError("❌ No valid entries found with all required fields.")

    print("✅ Sample loaded row:", ds[0])
    print("✅ Dataset columns:", ds.column_names)

    return ds, data

def run_ragas_and_latency_summary():
    ds, raw_data = load_dataset_for_ragas(DATA_PATH)

    # Evaluate with RAGAS
    result = evaluate(
        ds,
        metrics=[
            faithfulness,
            answer_relevancy,
            context_precision,
            context_recall
        ],
    )

    # Convert to pandas DataFrame
    df = result.to_pandas()
    df.to_csv(SCORES_CSV, index=False)

    # Metric summary
    summary = df.mean(numeric_only=True).to_dict()
    with open(SUMMARY_JSON, "w") as f:
        json.dump(summary, f, indent=2)

    print("\n📊 RAGAS Summary Metrics:")
    for k, v in summary.items():
        print(f"{k.replace('_', ' ').title()}: {v:.3f}")

    # Plot metrics
    plt.figure(figsize=(6, 4))
    plt.bar(summary.keys(), summary.values(), color="skyblue")
    plt.title("RAGAS Average Metric Scores")
    plt.ylabel("Score")
    plt.ylim(0, 1)
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(METRIC_PLOT)
    print(f"📈 Metric bar chart saved to {METRIC_PLOT}")

    # Latency analysis
    latency_df = pd.DataFrame([
        {
            "query": r["question"],
            "latency_sec": r.get("latency_sec"),
            "ttf_token_sec": r.get("ttf_token_sec")
        }
        for r in raw_data if "error" not in r and r.get("latency_sec") is not None
    ])

    latency_df.to_csv(LATENCY_CSV, index=False)
    print(f"✅ Latency data saved to {LATENCY_CSV}")

    print("\n⏱️ Latency Summary:")
    print(latency_df.describe().round(3))

if __name__ == "__main__":
    run_ragas_and_latency_summary()
