from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Document


router = APIRouter()


@router.get("/documents")
def get_documents(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    documents = (
        db.query(Document)
        .order_by(Document.upload_date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return documents


@router.get("/documents/queue")
def get_processing_queue(
    db: Session = Depends(get_db)
):
    documents = (
        db.query(Document)
        .filter(Document.doc_type.is_(None))
        .order_by(Document.upload_date.desc())
        .all()
    )

    return documents


@router.get("/documents/{document_id}/duplicate-check")
def check_duplicate(
    document_id: int,
    db: Session = Depends(get_db)
):
    document = (
        db.query(Document)
        .filter(Document.id == document_id)
        .first()
    )

    if document is None:
        return {
            "error": "Document not found"
        }

    reference_number = None

    if document.entities:
        reference_number = document.entities.get("reference_number")

    if not reference_number:
        return {
            "duplicate": False,
            "message": "No reference_number found"
        }

    duplicate = (
        db.query(Document)
        .filter(
            Document.id != document_id,
            Document.entities["reference_number"].as_string() == reference_number
        )
        .first()
    )

    if duplicate:
        return {
            "duplicate": True,
            "document_id": duplicate.id,
            "filename": duplicate.filename,
            "reference_number": reference_number
        }

    return {
        "duplicate": False,
        "reference_number": reference_number
    }