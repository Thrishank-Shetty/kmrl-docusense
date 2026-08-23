from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Document, DocumentRevision, ComplianceItem
from app.schemas import DocumentUpdate,ComplianceItemUpdate
from app.compliance.risk_engine import calculate_risk


router = APIRouter()


@router.get("/documents")
def get_documents(
    skip:int=0,
    limit:int=20,
    db:Session=Depends(get_db)
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
    db:Session=Depends(get_db)
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
    document_ids:list[int],
    db:Session=Depends(get_db)
):
    documents = (
        db.query(Document)
        .filter(Document.id.in_(document_ids))
        .all()
    )

    found_ids={document.id for document in documents}

    missing_ids=[
        document_id
        for document_id in document_ids
        if document_id not in found_ids
    ]

    if missing_ids:
        raise HTTPException(
            status_code=404,
            detail=f"Documents not found: {missing_ids}"
        )

    for position,document_id in enumerate(
        document_ids,
        start=1
    ):
        document=next(
            document
            for document in documents
            if document.id==document_id
        )

        document.queue_position=position

    db.commit()

    return {
        "message":"Queue reordered successfully.",
        "queue":document_ids
    }


@router.get("/documents/{document_id}/duplicate-check")
def check_duplicate(
    document_id:int,
    db:Session=Depends(get_db)
):
    document=(
        db.query(Document)
        .filter(Document.id==document_id)
        .first()
    )

    if document is None:
        return {
            "error":"Document not found"
        }

    reference_number=None

    if document.entities:
        reference_number=document.entities.get(
            "reference_number"
        )

    if not reference_number:
        return {
            "duplicate":False,
            "message":"No reference_number found"
        }

    duplicate=(
        db.query(Document)
        .filter(
            Document.id!=document_id,
            Document.entities["reference_number"].as_string()
            ==reference_number
        )
        .first()
    )

    if duplicate:
        return {
            "duplicate":True,
            "document_id":duplicate.id,
            "filename":duplicate.filename,
            "reference_number":reference_number
        }

    return {
        "duplicate":False,
        "reference_number":reference_number
    }


@router.get("/documents/review-required")
def get_review_required(
    db:Session=Depends(get_db)
):
    documents=(
        db.query(Document)
        .filter(
            Document.extraction_confidence.isnot(None),
            Document.extraction_confidence<0.70,
            Document.human_verified==False
        )
        .order_by(Document.upload_date.desc())
        .all()
    )

    return documents


@router.post("/documents/{document_id}/verify")
def verify_document(
    document_id:int,
    db:Session=Depends(get_db)
):
    document=(
        db.query(Document)
        .filter(Document.id==document_id)
        .first()
    )

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    document.human_verified=True

    db.commit()
    db.refresh(document)

    return {
        "message":"Document verified successfully",
        "document_id":document.id,
        "human_verified":document.human_verified
    }


@router.put("/documents/{document_id}")
def update_document(
    document_id:int,
    update:DocumentUpdate,
    db:Session=Depends(get_db)
):
    document=(
        db.query(Document)
        .filter(Document.id==document_id)
        .first()
    )

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    revision_count=(
        db.query(DocumentRevision)
        .filter(
            DocumentRevision.document_id==document.id
        )
        .count()
    )

    revision=DocumentRevision(
        document_id=document.id,
        revision_number=revision_count+1,
        doc_type=document.doc_type,
        summary=document.summary,
        entities=document.entities,
        compliance_risk=None,
        changed_by="user"
    )
    db.add(revision)

    if update.doc_type is not None:
        document.doc_type=update.doc_type

    if update.summary is not None:
        document.summary=update.summary

    if update.entities is not None:
        document.entities=update.entities.model_dump(
            mode="json"
        )



    if update.verify:
        document.human_verified=True

    db.commit()
    db.refresh(document)

    return {
        "message":"Document updated successfully",
        "document":document,
        "human_verified":document.human_verified
    }

@router.put("/documents/{document_id}/compliance/{compliance_id}")
def update_compliance_item(
    document_id:int,
    compliance_id:int,
    update:ComplianceItemUpdate,
    db:Session=Depends(get_db)
):
    document=(
        db.query(Document)
        .filter(Document.id==document_id)
        .first()
    )

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    compliance_item=(
        db.query(ComplianceItem)
        .filter(
            ComplianceItem.id==compliance_id,
            ComplianceItem.document_id==document_id
        )
        .first()
    )

    if compliance_item is None:
        raise HTTPException(
            status_code=404,
            detail="Compliance item not found for this document"
        )

    previous_compliance={
        "compliance_item_id":compliance_item.id,
        "deadline_date":str(
            compliance_item.deadline_date
        ) if compliance_item.deadline_date else None,
        "risk_type":compliance_item.risk_type,
        "urgency":compliance_item.urgency
    }

    revision_count=(
        db.query(DocumentRevision)
        .filter(
            DocumentRevision.document_id==document.id
        )
        .count()
    )

    revision=DocumentRevision(
        document_id=document.id,
        revision_number=revision_count+1,
        doc_type=document.doc_type,
        summary=document.summary,
        entities=document.entities,
        compliance_risk=previous_compliance,
        changed_by="user"
    )

    db.add(revision)

    if update.deadline_date is not None:

        risk_data={
    "has_deadline":True,
    "deadline_date":str(
        update.deadline_date
    ),
    "risk_type":(
        update.risk_type
        if update.risk_type is not None
        else compliance_item.risk_type
    )
}

        risk=calculate_risk(risk_data)

        compliance_item.deadline_date=risk["deadline_date"]
        compliance_item.risk_type=risk["risk_type"]
        compliance_item.urgency=risk["urgency"]

    else:

        if update.risk_type is not None:
            compliance_item.risk_type=update.risk_type

        if update.urgency is not None:
            compliance_item.urgency=update.urgency

    db.commit()
    db.refresh(compliance_item)

    return {
        "message":"Compliance item updated successfully",
        "compliance_item":compliance_item
    }

@router.get("/documents/{document_id}/revisions")
def get_document_revisions(
    document_id:int,
    db:Session=Depends(get_db)
):
    document=(
        db.query(Document)
        .filter(Document.id==document_id)
        .first()
    )

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    revisions=(
        db.query(DocumentRevision)
        .filter(
            DocumentRevision.document_id==document_id
        )
        .order_by(
            DocumentRevision.revision_number.desc()
        )
        .all()
    )

    return revisions

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
