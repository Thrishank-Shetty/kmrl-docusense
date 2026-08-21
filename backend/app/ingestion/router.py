from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Document
from app.ingestion.ocr import process_document

import os
import uuid


router = APIRouter()


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported"
        )

    os.makedirs("temp", exist_ok=True)

    file_path = f"temp/{uuid.uuid4()}_{file.filename}"

    try:
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        result = process_document(file_path)

        document = Document(
            filename=file.filename,
            raw_text=result["raw_text"],
            extraction_confidence=str(result["confidence"])
        )

        db.add(document)
        db.commit()
        db.refresh(document)

        return {
            "document_id": document.id,
            "raw_text": result["raw_text"],
            "confidence": result["confidence"]
        }

    finally:
        if os.path.exists(file_path):
            os.remove(file_path)
