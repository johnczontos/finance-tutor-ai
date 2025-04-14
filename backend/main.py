# main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag_chain import qa_chain

app = FastAPI()

# Allow frontend origin
origins = [
    "http://localhost:5173", 
    "https://finance-tutor-ai.vercel.app",
    "https://finance-tutor-ai-john-zontos-projects.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           # Or use ["*"] for all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str

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
