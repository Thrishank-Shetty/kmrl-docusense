
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date

from app.database import get_db
from app.models import Document, ComplianceItem
from app.schemas import DocumentResponse, ComplianceItemResponse


router = APIRouter(
    prefix="/compliance",
    tags=["Compliance"]
)


# Analyze document text directly
@router.post("/analyze")
def analyze_document(document_text: str):
    from app.nlp.extractor import extract_document_data
    from app.compliance.risk_engine import calculate_risk

    try:
        extracted_data = extract_document_data(document_text)
        risk_result = calculate_risk(extracted_data)

        return {
            "extraction": extracted_data,
            "risk": risk_result
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# Get all documents
@router.get("/")
def get_all_documents(
    db: Session = Depends(get_db)
):
    documents = db.query(Document).order_by(
        Document.upload_date.desc()
    ).all()

    return documents


# Get upcoming compliance risks
@router.get("/upcoming")
def get_upcoming_compliance(
    db: Session = Depends(get_db)
):
    today = date.today()

    risks = (
        db.query(ComplianceItem)
        .filter(
            ComplianceItem.deadline_date >= today
        )
        .order_by(
            ComplianceItem.deadline_date.asc()
        )
        .all()
    )

    return risks
@router.get("/stats")
def get_compliance_stats(
    db: Session = Depends(get_db)
):
    documents = db.query(Document).count()
    compliance_items = db.query(ComplianceItem).all()

    critical = sum(
        1 for item in compliance_items
        if item.urgency == "critical"
    )

    high = sum(
        1 for item in compliance_items
        if item.urgency == "high"
    )

    low = sum(
        1 for item in compliance_items
        if item.urgency == "low"
    )

    today = date.today()

    upcoming_7_days = sum(
        1
        for item in compliance_items
        if item.deadline_date
        and 0 <= (item.deadline_date - today).days <= 7
    )

    upcoming_30_days = sum(
        1
        for item in compliance_items
        if item.deadline_date
        and 0 <= (item.deadline_date - today).days <= 30
    )

    overdue = sum(
        1
        for item in compliance_items
        if item.deadline_date
        and item.deadline_date < today
    )

    return {
        "total_documents": documents,
        "total_compliance_items": len(compliance_items),
        "critical": critical,
        "high": high,
        "low": low,
        "upcoming_7_days": upcoming_7_days,
        "upcoming_30_days": upcoming_30_days,
        "overdue": overdue
    }

# Get compliance information for one document
@router.get("/{document_id}")
def get_document(
    document_id: int,
    db: Session = Depends(get_db)
):
    document = (
        db.query(Document)
        .filter(Document.id == document_id)
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    compliance = (
        db.query(ComplianceItem)
        .filter(
            ComplianceItem.document_id == document_id
        )
        .all()
    )

    return {
        "document": document,
        "compliance": compliance
    }