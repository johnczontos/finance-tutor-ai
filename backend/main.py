from fastapi import FastAPI, HTTPException, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from langchain.schema import Document
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from openai import OpenAI
from pydantic import BaseModel
from rag_chain import vectorstore, youtube_vectorstore, detail_prompt_templates, openai_api_key
import json
import os
import logging

# Initialize FastAPI app
app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://finance-tutor-ai.vercel.app",
        "https://finance-tutor-ai-john-zontos-projects.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load OpenAI key for quiz generation
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# ----- Data Models -----

class QueryRequest(BaseModel):
    query: str
    detailLevel: str  # 'simple' | 'regular' | 'in-depth'


class QuizRequest(BaseModel):
    topic: str


class QuizResponse(BaseModel):
    question: str
    choices: list[str]
    correctAnswer: str
    explanation: str

# Utility functions

def build_prompt(question: str, context: str, detail_level: str) -> str:
    template = PromptTemplate(
        input_variables=["context", "question"],
        template=detail_prompt_templates.get(detail_level, detail_prompt_templates["regular"])
    )
    return template.format(context=context, question=question)

# def retrieve_documents(query: str, k: int = 3, threshold: float = 0.6) -> list[Document]:
#     # Primary retriever: high precision with score threshold
#     primary_retriever = vectorstore.as_retriever(
#         search_type="similarity_score_threshold",
#         search_kwargs={"score_threshold": threshold, "k": k}
#     )
#     docs = primary_retriever.get_relevant_documents(query)

#     if not docs:
#         logging.warning("⚠️ No results from score_threshold retriever — falling back to default retriever.")
#         # Fallback retriever: standard similarity (or optionally use "mmr")
#         fallback_retriever = vectorstore.as_retriever(
#             search_type="similarity",
#             search_kwargs={"k": k}
#         )
#         docs = fallback_retriever.get_relevant_documents(query)

#     return docs

# def retrieve_documents(query: str, k: int = 3) -> list[Document]:
#     retriever = vectorstore.as_retriever(
#         search_type="mmr",
#         search_kwargs={
#             "k": k,
#             "fetch_k": 10,         # how many candidates to consider
#             "lambda_mult": 0.6     # balance between relevance and diversity
#         }
#     )
#     docs = retriever.get_relevant_documents(query)

#     if not docs:
#         logging.warning("⚠️ MMR retriever returned no documents.")

#     return docs

# def retrieve_documents(query: str, k: int = 3) -> list[Document]:
#     retriever = vectorstore.as_retriever(
#         search_type="similarity",  # use top-k similarity-based retrieval
#         search_kwargs={
#             "k": k
#         }
#     )
#     docs = retriever.get_relevant_documents(query)

#     if not docs:
#         logging.warning("⚠️ Top-k retriever returned no documents.")

#     return docs

def retrieve_documents(query: str, k: int = 3, threshold: float = 0.6) -> list[Document]:
    retriever = vectorstore.as_retriever(
        search_type="similarity_score_threshold",
        search_kwargs={
            "score_threshold": threshold,
            "k": k
        }
    )
    docs = retriever.get_relevant_documents(query)
    if not docs:
        logging.warning("⚠️ No results from score_threshold retriever — falling back to default retriever.")
        # Fallback retriever: standard similarity (or optionally use "mmr")
        fallback_retriever = vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={"k": k}
        )
        docs = fallback_retriever.get_relevant_documents(query)

    return docs

# ----- Non-streaming Endpoint -----

@app.get("/ask")
async def ask_question(
    query: str = Query(...),
    detailLevel: str = Query("regular")
):
    try:
        docs = retrieve_documents(query)

        context = "\n\n".join([doc.page_content for doc in docs[:4]])
        prompt = build_prompt(query, context, detailLevel)

        llm = ChatOpenAI(
            model="gpt-4.1",
            temperature=0,
            api_key=openai_api_key,
            streaming=False
        )

        response = llm.invoke(prompt)
        answer = response.content.strip()

        return {
            "answer": answer,
            "contexts": [doc.page_content for doc in docs[:4]],
        }

    except Exception as e:
        logging.exception("❌ Non-streaming RAG error:")
        raise HTTPException(status_code=500, detail=str(e))

# ----- Streaming Endpoint -----

@app.get("/ask/stream")
async def ask_question_stream(
    request: Request,
    query: str = Query(...),
    detailLevel: str = Query("regular")
):
    try:
        docs = retrieve_documents(query)
        if not docs:
            raise HTTPException(status_code=404, detail="No relevant documents found.")

        sources = [
            {
                "heading": doc.metadata.get("heading", "Unknown"),
                "url": doc.metadata.get("url"),
            }
            for doc in docs
        ]

        context = "\n\n".join([doc.page_content for doc in docs[:4]])
        prompt = build_prompt(query, context, detailLevel)

        # YouTube recommendations
        youtube_results = youtube_vectorstore.similarity_search(query, k=3)
        videos = [
            {
                "url": doc.metadata.get("url", ""),
                "title": doc.metadata.get("heading", "YouTube Video")
            }
            for doc in youtube_results
        ]

        llm = ChatOpenAI(
            model="gpt-4o",
            temperature=0.3,
            api_key=openai_api_key,
            streaming=True
        )

        async def token_stream():
            try:
                async for chunk in llm.astream(prompt):
                    if chunk.content:
                        yield {"event": "message", "data": chunk.content}

                yield {"event": "metadata", "data": json.dumps({
                    "sources": sources,
                    "videos": videos
                })}

                yield {"event": "end", "data": ""}
            except Exception as e:
                logging.exception("❌ Streaming error:")
                yield {"event": "error", "data": str(e)}

        return EventSourceResponse(token_stream())

    except Exception as e:
        logging.exception("❌ Streaming endpoint failure:")
        raise HTTPException(status_code=500, detail=str(e))


# ----- Quiz Generation Endpoint -----

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