import requests

response = requests.post(
    "http://localhost:8000/ask",
    json={"query": "What is the purpose of a balance sheet?"}
)

print(response.json())
