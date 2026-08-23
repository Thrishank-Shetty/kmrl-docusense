from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Document , DocumentChange


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
@router.get("/documents/{document_id}/changes")
def get_document_changes(
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

    changes = (
        db.query(DocumentChange)
        .filter(DocumentChange.document_id == document_id)
        .order_by(DocumentChange.created_at.desc())
        .all()
    )

    return {
        "document_id": document_id,
        "filename": document.filename,
        "total_changes": len(changes),
        "changes": [
            {
                "change_id": change.id,
                "old_filename": change.old_filename,
                "new_filename": change.new_filename,
                "old_entities": change.old_entities,
                "new_entities": change.new_entities,
                "old_summary": change.old_summary,
                "new_summary": change.new_summary,
                "ai_summary": change.ai_summary,
                "created_at": change.created_at
            }
            for change in changes
        ]
    }