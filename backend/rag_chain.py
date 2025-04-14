# rag_chain.py

import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from pinecone import Pinecone

# Load API keys
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
pinecone_api_key = os.getenv("PINECONE_API_KEY")

# Init models
llm = ChatOpenAI(model="gpt-4", temperature=0, api_key=openai_api_key)
embeddings = OpenAIEmbeddings(api_key=openai_api_key)

# Init Pinecone
pc = Pinecone(api_key=pinecone_api_key)
index_name = "financetutor"
vectorstore = PineconeVectorStore(index_name=index_name, embedding=embeddings)

# Prompt Template (optional, customize)
prompt_template = PromptTemplate(
    input_variables=["context", "question"],
    template="""
    You are a finance tutor. Use the following context to answer the question.
    Cite sources where appropriate.

    Context:
    {context}

    Question: {question}
    Answer:"""
)

# Build the chain
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vectorstore.as_retriever(),
    return_source_documents=True,
    chain_type_kwargs={"prompt": prompt_template}
)
