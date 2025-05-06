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


# ----- Chat Streaming Endpoint -----

@app.get("/ask/stream")
async def ask_question_stream(
    request: Request,
    query: str = Query(...),
    detailLevel: str = Query("regular")
):
    # Retrieve documents from vectorstore
    docs: list[Document] = vectorstore.as_retriever().get_relevant_documents(query)

    sources = [
        {
            "heading": doc.metadata.get("heading", "Unknown"),
            "url": doc.metadata.get("url"),
        }
        for doc in docs
    ]

    context = "\n\n".join([doc.page_content for doc in docs[:4]])

    # Retrieve YouTube video recommendations
    youtube_results = youtube_vectorstore.similarity_search(query, k=3)
    videos = [
        {
            "url": doc.metadata.get("url", ""),
            "title": doc.metadata.get("heading", "YouTube Video")
        }
        for doc in youtube_results
    ]

    for v in videos:
        print(v['url'])
        print(v['title'])

    # Compose prompt
    prompt_template = PromptTemplate(
        input_variables=["context", "question"],
        template=detail_prompt_templates.get(detailLevel, detail_prompt_templates["regular"])
    )
    prompt = prompt_template.format(context=context, question=query)

    llm = ChatOpenAI(
        model="gpt-4",
        temperature=0,
        api_key=openai_api_key,
        streaming=True
    )

    async def token_stream():
        try:
            async for chunk in llm.astream(prompt):
                if chunk.content:
                    yield {"event": "message", "data": chunk.content}

            # Emit metadata after streaming text
            yield {"event": "metadata", "data": json.dumps({
                "sources": sources,
                "videos": videos
            })}

            yield {"event": "end", "data": ""}
        except Exception as e:
            logging.exception("❌ Streaming error:")
            yield {"event": "error", "data": str(e)}

    return EventSourceResponse(token_stream())


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