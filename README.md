# Finance Tutor AI

Finance Tutor AI is a Retrieval-Augmented Generation (RAG) web application that allows users to ask finance-related questions and receive accurate, source-cited responses. The system leverages OpenAI's GPT-4 model with embeddings stored in Pinecone, powered by a FastAPI backend and a Vite + React TypeScript frontend.

---

## 🌟 Features
- Ask natural language questions about finance topics
- Get AI-generated answers grounded in OpenStax Finance textbook content
- Cited sources (e.g., chapter file names)
- FastAPI backend serving RAG pipeline
- React + Vite frontend with clean UI
- Pinecone vector database integration

---

## 🧱 Tech Stack

| Layer         | Technology                       |
|--------------|-----------------------------------|
| Frontend     | React + Vite + TypeScript        |
| Backend      | FastAPI + LangChain              |
| Embeddings   | OpenAI `text-embedding-ada-002`  |
| Language Model | OpenAI GPT-4                  |
| Vector Store | Pinecone                         |
| Deployment   | Frontend: Vercel<br>Backend: Render |

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/finance-tutor-ai.git
cd finance-tutor-ai
```

### 2. Set up backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Fill in OPENAI_API_KEY, PINECONE_API_KEY

# Start the server
uvicorn main:app --reload
```

### 3. Set up frontend
```bash
cd ../frontend
npm install

# Create .env file
cp .env.example .env
# Add your backend URL: VITE_API_URL=http://localhost:8000

npm run dev
```

Visit `http://localhost:5173` to try the app locally.

---

## 🧠 Project Structure
```
finance-tutor-ai/
├── backend/                  # FastAPI backend
│   ├── main.py               # App entry point
│   ├── rag_chain.py          # LangChain + Pinecone logic
│   ├── requirements.txt
│   └── .env
│
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   └── api/api.ts
│   ├── public/
│   ├── .env
│   └── vite.config.ts
```

---

## 🧪 API Endpoint
### POST `/ask`
**Request:**
```json
{
  "query": "What is the purpose of a balance sheet?"
}
```
**Response:**
```json
{
  "answer": "A balance sheet shows...",
  "sources": ["Chapter1.docx"]
}
```

---

## 🌐 Deployment

### Frontend: [Vercel](https://vercel.com/)
- Auto-deploy from GitHub
- Set `VITE_API_URL` in Vercel Environment Variables to point to your backend URL

### Backend: [Render](https://render.com/)
- Connect GitHub repo to Render Web Service
- Set environment variables: `OPENAI_API_KEY`, `PINECONE_API_KEY`
- Start command:
```bash
gunicorn main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:10000
```

---

## 📝 TODOs / Future Work
- Add support for YouTube transcripts via Whisper
- Improve citation formatting (timestamps, section headings)
- Add filtering by difficulty level or topic
- Enable chat history and follow-ups
- Add usage analytics or rate limiting

---

## 🧑‍💻 Author
Developed by John Zontos. Contributions and suggestions welcome!

---

## 📄 License
MIT License