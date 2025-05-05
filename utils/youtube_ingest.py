# youtube_ingest.py
import os
import json
import time
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv

# Load API keys
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
pinecone_api_key = os.getenv("PINECONE_API_KEY")
index_name = "youtube-index"

# Initialize Pinecone
pc = Pinecone(api_key=pinecone_api_key)
if index_name not in [i["name"] for i in pc.list_indexes()]:
    pc.create_index(index_name, dimension=1536, metric="cosine", spec=ServerlessSpec(cloud="aws", region="us-east-1"))

embeddings = OpenAIEmbeddings(api_key=openai_api_key)
vectorstore = PineconeVectorStore(index_name=index_name, embedding=embeddings)

# Load video metadata
with open("video_metadata.json") as f:
    video_metadata = json.load(f)

# Chunk transcript into ~5 min blocks
def chunk_transcript(transcript, chunk_duration=300):
    chunks = []
    current_chunk = []
    current_start = 0.0

    for entry in transcript:
        if not current_chunk:
            current_start = entry["start"]

        current_chunk.append(entry)
        current_end = entry["start"] + entry.get("duration", 0)

        if current_end - current_start >= chunk_duration:
            chunks.append({
                "text": " ".join(e["text"] for e in current_chunk),
                "start": int(current_start)
            })
            current_chunk = []

    if current_chunk:
        chunks.append({
            "text": " ".join(e["text"] for e in current_chunk),
            "start": int(current_start)
        })

    return chunks

documents = []
for video in video_metadata:

    video_id = video.get("video_id")
    title = video.get("title")
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        chunks = chunk_transcript(transcript)

        for chunk in chunks:
            ts_url = f"https://youtu.be/{video_id}?t={chunk['start']}"
            documents.append(Document(
                page_content=chunk["text"],
                metadata={"url": ts_url, "heading": title}
            ))
        print(f"✅ Loaded: {video_id} ({len(chunks)} chunks)")
        time.sleep(1)
    except TranscriptsDisabled:
        print(f"❌ Transcript disabled: {video_id}")
    except Exception as e:
        print(f"❌ Error fetching {video_id}: {e}")

# Upload documents in batches
batch_size = 32
for i in range(0, len(documents), batch_size):
    vectorstore.add_documents(documents[i:i + batch_size])
    print(f"✅ Uploaded batch {i // batch_size + 1}")

print(f"\n🎉 Done! Uploaded {len(documents)} transcript chunks.")
