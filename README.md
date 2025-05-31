# Finance Tutor AI

**Finance Tutor AI** is a Retrieval-Augmented Generation (RAG) web application that helps students learn finance by asking natural language questions. It provides clear, step-by-step answers grounded in reliable sources like the OpenStax Finance textbook and educational YouTube videos.

The system uses OpenAI's GPT-4 for answer generation, Pinecone for vector search, and supports streaming responses for a fast, interactive chat experience. Built with a modern stack: FastAPI backend, LangChain, and a Vite + React TypeScript frontend.

---

## Features

* Ask finance-related questions in natural language
* Answers grounded in OpenStax Principles of Finance and curated YouTube videos
* Cited sources with clickable timestamps and URLs
* Real-time streaming of LLM responses via Server-Sent Events (SSE)
* Optional video recommendations powered by vector search on transcript chunks
* Toggle-able knowledge checks for self-assessment
* Adjustable response detail level (simple → in-depth)
* Download chat history or clear session
* Markdown + LaTeX support for equations and finance formulas
* Responsive and scroll-stable UI

---

## Tech Stack

| Layer          | Technology                            |
| -------------- | ------------------------------------- |
| Frontend       | React + Vite + TypeScript             |
| Backend        | FastAPI + LangChain + SSE             |
| Embeddings     | OpenAI `text-embedding-ada-002`       |
| Language Model | OpenAI GPT-4 (streaming enabled)      |
| Vector Store   | Pinecone (OpenStax + YouTube Indexes) |
| Deployment     | Vercel (frontend), Render (backend)   |

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/finance-tutor-ai.git
cd finance-tutor-ai
```

### 2. Set up the backend

```bash
cd backend
python -m venv env
source env/bin/activate  # or use `env\Scripts\activate` on Windows
pip install -r requirements.txt

# Create and configure environment variables
cp .env.example .env
# Fill in: OPENAI_API_KEY, PINECONE_API_KEY

# Start the FastAPI server
uvicorn main:app --reload
```

### 3. Set up the frontend

```bash
cd ../frontend
npm install

# Create frontend .env file
cp .env.example .env
# Set: VITE_API_URL=http://localhost:8000

npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Project Structure

```
finance-tutor-ai/
├── backend/                  # FastAPI backend with LangChain + Pinecone
│   ├── main.py               # API entry point (includes SSE streaming)
│   ├── rag_chain.py          # Chain setup with custom prompts
│   ├── youtube_ingest.py     # YouTube transcript chunking + embedding
│   └── video_metadata.json   # YouTube video metadata
│
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── App.tsx           # Main UI logic
│   │   ├── components/       # ChatWindow, Sidebar, SourcesDisplay, etc.
│   │   └── api/api.ts        # Handles /ask/stream and /generate-quiz
│   ├── public/example_queries.json
│   ├── .env
│   └── vite.config.ts
```

---

## API Endpoints

### `GET /ask/stream`

Streams the assistant's response using SSE.

**Params:**

* `query`: your question
* `detailLevel`: `simple` | `regular` | `in-depth`

**Events Streamed:**

* `message`: tokens from GPT-4
* `metadata`: list of sources + YouTube videos
* `end`: signals completion

### `POST /generate-quiz`

Returns a single multiple-choice knowledge check.

**Request:**

```json
{ "topic": "Time Value of Money" }
```

**Response:**

```json
{
  "question": "What is the time value of money?",
  "choices": [...],
  "correctAnswer": "...",
  "explanation": "..."
}
```

---

## Deployment

### Frontend (Vercel)

* Push frontend to GitHub
* Connect Vercel to your repo
* Set environment: `VITE_API_URL=https://your-backend.onrender.com`

### Backend (Render)

* Create a new web service from `backend/`
* Add env vars: `OPENAI_API_KEY`, `PINECONE_API_KEY`
* Start command:

```bash
gunicorn main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:10000
```

---

## Future Improvements

* ✅ Token-by-token streaming (implemented!)
* ✅ Markdown + LaTeX support (implemented!)
* ✅ Scroll isolation for ChatWindow (implemented!)
* [ ] Personalized follow-ups based on chat history
* [ ] Section-specific citations with URL anchors
* [ ] Role-based access or usage tracking

---

## Author

Created with care by **John Zontos**. Contributions welcome!

---

## License

[MIT](LICENSE)

---