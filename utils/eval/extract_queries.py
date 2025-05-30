import json

# Load the full dataset
with open("retrieval_eval_set.json", "r") as infile:
    full_data = json.load(infile)

# Extract just the queries
queries = [item["query"] for item in full_data if "query" in item]

# Save to a new file
with open("example_queries.json", "w") as outfile:
    json.dump(queries, outfile, indent=2)

print(f"✅ Extracted {len(queries)} queries to example_queries.json")
