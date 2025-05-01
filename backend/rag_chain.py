# rag_chain.py

import os
from dotenv import load_dotenv
from typing import Dict
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

# Prompt templates based on detail level
base_template = """
You are an AI designed to answer questions with clear and concise explanations.
Talk directly to the student as if you are a teacher.
The audience is business and finance undergraduate students.

Explain your answers using step-by-step logic.
Focus on guiding students through reasoning steps to grasp the principles behind the problems.
Use markdown to make your Answers easier to follow by adding formatted section to your answer.

{style_instructions}

Context:
{{context}}

Question:
{{question}}

Answer:
"""

detail_prompt_templates: Dict[str, str] = {
    "simple": base_template.format(style_instructions="""
Write in simple, clear language.
Avoid technical jargon.
Use short sentences and plain words.
"""),

    "regular": base_template.format(style_instructions="""
Use clear, academic language.
Define any finance-specific terms.
Answer with clarity and completeness.
"""),

    "in-depth": base_template.format(style_instructions="""
Write with deep technical clarity, suitable for graduate students.
Be detailed and thorough.
Use sources whee necessary.
""")
}


# Factory function to create a chain for a given detail level
def get_qa_chain(detail_level: str = "regular") -> RetrievalQA:
    template = detail_prompt_templates.get(detail_level, detail_prompt_templates["regular"])

    prompt_template = PromptTemplate(
        input_variables=["context", "question"],
        template=template
    )

    return RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=vectorstore.as_retriever(),
        return_source_documents=True,
        chain_type_kwargs={"prompt": prompt_template}
    )
