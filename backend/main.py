# main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel
from rag_chain import qa_chain
import openai
import os
import json

# Initialize FastAPI app
app = FastAPI()

# Allow frontend origin
origins = [
    "http://localhost:5173", 
    "https://finance-tutor-ai.vercel.app",
    "https://finance-tutor-ai-john-zontos-projects.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load OpenAI API key
openai.api_key = os.getenv('OPENAI_API_KEY')

# Request and response models
class QueryRequest(BaseModel):
    query: str

class QuizRequest(BaseModel):
    topic: str

class QuizResponse(BaseModel):
    question: str
    choices: list[str]
    correctAnswer: str
    explanation: str

# Endpoint: /ask
@app.post("/ask")
def ask_question(request: QueryRequest):
    try:
        result = qa_chain(request.query)
        answer = result["result"]
        sources = [doc.metadata.get("source", "unknown") for doc in result["source_documents"]]
        return {
            "answer": answer,
            "sources": sources
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Endpoint: /generate-quiz
@app.post("/generate-quiz", response_model=QuizResponse)
def generate_quiz(request: QuizRequest):
    try:
        prompt = (
            f"Create a simple multiple-choice knowledge check question about the following finance topic: {request.topic}.\n"
            f"Provide exactly 4 answer choices. Clearly identify which one is correct.\n"
            f"Also provide a one-sentence explanation for the correct answer.\n"
            f"Respond ONLY in strict JSON format like this:\n"
            f"{{\n"
            f'  "question": "Sample Question?",\n'
            f'  "choices": ["Choice1", "Choice2", "Choice3", "Choice4"],\n'
            f'  "correctAnswer": "Choice2",\n'
            f'  "explanation": "Brief explanation."\n'
            f"}}"
        )

        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful finance tutor AI."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500,
        )

        content = response.choices[0].message.content
        quiz_data = json.loads(content)

        return QuizResponse(**quiz_data)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))