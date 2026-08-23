from fastapi import APIRouter, Depends, HTTPException
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
        .order_by(
            Document.queue_position.asc().nullslast(),
            Document.upload_date.desc()
        )
        .all()
    )

    return documents


@router.put("/documents/queue/reorder")
def reorder_processing_queue(
    document_ids: list[int],
    db: Session = Depends(get_db)
):
    documents = (
        db.query(Document)
        .filter(Document.id.in_(document_ids))
        .all()
    )

    found_ids = {document.id for document in documents}

    missing_ids = [
        document_id
        for document_id in document_ids
        if document_id not in found_ids
    ]

    if missing_ids:
        raise HTTPException(
            status_code=404,
            detail=f"Documents not found: {missing_ids}"
        )

    for position, document_id in enumerate(document_ids, start=1):
        document = next(
            document
            for document in documents
            if document.id == document_id
        )

        document.queue_position = position

    db.commit()

    return {
        "message": "Queue reordered successfully.",
        "queue": document_ids
    }


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
            Document.entities["reference_number"].as_string()
            == reference_number
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

@router.get("/documents/review-required")
def get_review_required(
    db: Session = Depends(get_db)
):
    documents = (
        db.query(Document)
        .filter(
            Document.extraction_confidence.isnot(None),
            Document.extraction_confidence < 0.70,
            Document.human_verified == False
        )
        .order_by(Document.upload_date.desc())
        .all()
    )

    return documents

@router.post("/documents/{document_id}/verify")
def verify_document(
    document_id: int,
    db: Session = Depends(get_db)
):
    document = (
        db.query(Document)
        .filter(Document.id == document_id)
        .first()
    )

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    document.human_verified = True

    db.commit()
    db.refresh(document)

    return {
        "message": "Document verified successfully",
        "document_id": document.id,
        "human_verified": document.human_verified
    }