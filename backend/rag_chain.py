# rag_chain.py

import os
from dotenv import load_dotenv
from typing import Dict
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from pinecone import Pinecone

# Load API keys
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
pinecone_api_key = os.getenv("PINECONE_API_KEY")

# Init models
llm = ChatOpenAI(
    model="gpt-4",
    temperature=0,
    api_key=openai_api_key,
    streaming=True,  # ✅ Enable streaming
    callbacks=[StreamingStdOutCallbackHandler()]  # Replace with custom handler below for full control
)
embeddings = OpenAIEmbeddings(api_key=openai_api_key)

# Init Pinecone
pc = Pinecone(api_key=pinecone_api_key)
index_name = "financetutor"
vectorstore = PineconeVectorStore(index_name=index_name, embedding=embeddings)

youtube_index_name = "youtube-index"
youtube_vectorstore = PineconeVectorStore(index_name=youtube_index_name, embedding=OpenAIEmbeddings(api_key=openai_api_key))

# Prompt templates based on detail level
base_template = """
You are an AI designed to answer questions with clear and concise explanations.
Talk directly to the student as if you are a teacher.
The audience is business and finance undergraduate students.

Use:
- Markdown for headings, lists, and emphasis.
- LaTeX for inline math with `$...$` and block math with `$$...$$`.
- Step-by-step explanations to build understanding.

{style_instructions}

Context from the textbook:
{{context}}

Question:
{{question}}

Answer:
"""

# detail_prompt_templates: Dict[str, str] = {
#     "simple": base_template.format(style_instructions="""
# Write in simple, clear language.
# Avoid technical jargon.
# Use short sentences and plain words.
# """),

#     "regular": base_template.format(style_instructions="""
# Use clear, academic language.
# Define any finance-specific terms.
# Answer with clarity and completeness.
# """),

#     "in-depth": base_template.format(style_instructions="""
# Write with deep technical clarity, suitable for graduate students.
# Be detailed and thorough.
# Use sources when necessary.
# """)
# }

# base_template = """
# You are an AI finance tutor helping undergraduate business students understand finance concepts.

# You must answer the question using the context provided below if applicable.

# Your explanation should be clear.

# {style_instructions}

# ### 📘 Context:
# {{context}}

# ### ❓ Question:
# {{question}}

# ### ✅ Answer:
# """

detail_prompt_templates: Dict[str, str] = {
    "simple": base_template.format(style_instructions="""
Write in very simple, accessible language.
Avoid technical jargon entirely.
Use short sentences, plain words, and everyday examples.
Explain key terms if they appear in the context.
Structure your answer using markdown with **bolded terms**, bullet points, and clear sections.
"""),

    "regular": base_template.format(style_instructions="""
Use clear, structured academic language suitable for undergraduates.
Define any finance-specific terms that are used.
Explain your answer step-by-step, using markdown to highlight important points.
Use numbered steps or bullet points where appropriate to guide reasoning.
"""),

    "in-depth": base_template.format(style_instructions="""
Use precise technical language suitable for graduate students in finance.
Be thorough and detailed in your reasoning, breaking down complex ideas clearly.
If relevant, reference specific models, formulas, or textbook sections from the context.
Use markdown formatting including section headings, bold terms, equations (if mentioned), and explanatory lists.
Do not include any information not found in the context.
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
