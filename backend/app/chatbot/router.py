from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Document
from app.nlp.llm_client import call_llm


router = APIRouter(
    prefix="/chatbot",
    tags=["Chatbot"]
)


class ChatRequest(BaseModel):
    question: str


@router.post("/ask")
def ask_question(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    # Get all uploaded documents
    documents = db.query(Document).all()

    if not documents:
        raise HTTPException(
            status_code=404,
            detail="No documents found."
        )

    # Build context from uploaded documents
    context_parts = []

    for document in documents:
        context_parts.append(
            f"""
Document: {document.filename}

Content:
{document.raw_text}
"""
        )

    context = "\n\n".join(context_parts)

    # Prompt for the existing LLM client
    prompt = f"""
You are a document assistant for KMRL DocuSense.

Answer the user's question using ONLY the information
present in the uploaded documents.

If the answer cannot be found in the documents,
say:

"I could not find this information in the uploaded documents."

Give a clear and concise answer.

Uploaded documents:
{context}

User question:
{request.question}

Answer:
"""

    # Call the existing LLM function
    try:
        answer = call_llm(prompt)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"LLM request failed: {str(e)}"
        )

    return {
        "question": request.question,
        "answer": answer
    }