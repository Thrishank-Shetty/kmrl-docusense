from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Document,  ComplianceItem 
from app.nlp.extractor import extract_document_data
from app.compliance.risk_engine import calculate_risk
from app.nlp.extractor import extract_document_data
router = APIRouter(prefix="/nlp", tags=["NLP"])

@router.post("/extract/{document_id}")
def extract(document_id: int, db: Session = Depends(get_db)):
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    extracted = extract_document_data(document.raw_text)
    risk = calculate_risk(extracted)

    document.doc_type = extracted.get("doc_type")
    document.entities = extracted.get("entities")
    document.summary = extracted.get("summary")

    if risk["has_deadline"]:
        compliance_item = ComplianceItem(
            document_id=document.id,
            deadline_date=risk["deadline_date"],
            risk_type=risk["risk_type"],
            urgency=risk["urgency"],
        )
        db.add(compliance_item)

    db.commit()
    db.refresh(document)
    return {"document": document, "risk": risk}