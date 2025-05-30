import json
import time
import os
from openai import OpenAI
from dotenv import load_dotenv

# Load API key from .env
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise ValueError("Missing OPENAI_API_KEY in .env file")

# Initialize OpenAI client
client = OpenAI(api_key=api_key)

# Load questions
with open("example_queries.json", "r") as f:
    questions = json.load(f)

qa_pairs = []

# Ask each question using the Chat Completions API
for idx, question in enumerate(questions):
    print(f"🔹 Asking question {idx + 1}/{len(questions)}")

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful finance tutor."},
                {"role": "user", "content": question}
            ],
            temperature=0.7
        )

        answer = response.choices[0].message.content.strip()

        qa_pairs.append({
            "question": question,
            "answer": answer
        })

        time.sleep(1)  # Optional: avoid hitting rate limits

    except Exception as e:
        print(f"❌ Error on question {idx + 1}: {e}")
        qa_pairs.append({
            "question": question,
            "answer": f"ERROR: {str(e)}"
        })
        time.sleep(2)

# Save results to file
with open("test_qa.json", "w") as f:
    json.dump(qa_pairs, f, indent=4)

print("✅ Finished saving to test_qa.json")
