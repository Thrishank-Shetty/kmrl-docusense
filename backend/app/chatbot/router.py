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


@router.post("/ask/{document_id}")
def ask_question(
    document_id: int,
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    # Get the requested document
    document = db.query(Document).filter(
        Document.id == document_id
    ).first()

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )

    # Build context using only this document
    context = f"""
Document: {document.filename}

Content:
{document.raw_text}
"""

    # Prompt for the LLM
    prompt = f"""
You are a document assistant for KMRL DocuSense.

Answer the user's question using ONLY the information
present in the uploaded document.

If the answer cannot be found in the document,
say:

"I could not find this information in the uploaded document."

Do not invent or assume information.

Give a clear and concise answer.

Uploaded document:
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
        "document_id": document_id,
        "question": request.question,
        "answer": answer
    }