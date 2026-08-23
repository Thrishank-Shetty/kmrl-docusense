from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Document, ComplianceItem
from app.nlp.extractor import extract_document_data
from app.compliance.risk_engine import calculate_risk


router = APIRouter(
    prefix="/nlp",
    tags=["NLP"]
)


@router.post("/extract/{document_id}")
def extract(
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

    # Extract information using the LLM
    extracted = extract_document_data(
        document.raw_text
    )

    # Calculate OCR/extraction risk information
    compliance_risks = extracted.get(
        "compliance_risks",
        []
    )

    # Update document information
    document.doc_type = extracted.get("doc_type")
    document.entities = extracted.get("entities")
    document.summary = extracted.get("summary")
    document.extraction_confidence = extracted.get(
        "extraction_confidence"
    )

    document.human_verified = False

    # Remove previous compliance items
    db.query(ComplianceItem).filter(
        ComplianceItem.document_id == document.id
    ).delete(
        synchronize_session=False
    )

    # Create compliance items
    for compliance_risk in compliance_risks:

        risk = calculate_risk(
            compliance_risk
        )

        if risk["has_deadline"]:

            compliance_item = ComplianceItem(
                document_id=document.id,
                deadline_date=risk["deadline_date"],
                risk_type=risk["risk_type"],
                urgency=risk["urgency"]
            )

            db.add(compliance_item)

    db.commit()
    db.refresh(document)

    return {
        "document": document,
        "compliance_risks": compliance_risks
    }