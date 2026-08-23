

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Document, DocumentChange
from app.ingestion.ocr import process_document
from app.nlp.extractor import extract_document_data
from app.nlp.llm_client import call_llm

import os
import uuid


router = APIRouter()


ALLOWED_EXTENSIONS = {".pdf", ".docx"}


@router.post("/upload")
async def upload_documents(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    if not files:
        raise HTTPException(
            status_code=400,
            detail="At least one document is required"
        )

    results = []

    os.makedirs("temp", exist_ok=True)

    for file in files:

        if not file.filename:
            results.append({
                "success": False,
                "message": "File has no filename"
            })
            continue

        extension = os.path.splitext(file.filename)[1].lower()

        if extension not in ALLOWED_EXTENSIONS:
            results.append({
                "success": False,
                "filename": file.filename,
                "message": "Only PDF and DOCX files are supported"
            })
            continue

        file_path = f"temp/{uuid.uuid4()}_{file.filename}"

        try:
            # --------------------------------------------------
            # SAVE FILE
            # --------------------------------------------------

            file_content = await file.read()

            with open(file_path, "wb") as buffer:
                buffer.write(file_content)

            # --------------------------------------------------
            # OCR / TEXT EXTRACTION
            # --------------------------------------------------

            result = process_document(file_path)

            raw_text = result["raw_text"]
            confidence = result["confidence"]

            # --------------------------------------------------
            # NLP EXTRACTION
            # --------------------------------------------------

            extracted = extract_document_data(raw_text)

            doc_type = extracted.get("doc_type")
            summary = extracted.get("summary")
            entities = extracted.get("entities") or {}

            # --------------------------------------------------
            # CREATE DATABASE RECORD
            # --------------------------------------------------

            document = Document(
                filename=file.filename,
                raw_text=raw_text,
                doc_type=doc_type,
                summary=summary,
                entities=entities,
                extraction_confidence=str(
                    extracted.get(
                        "extraction_confidence",
                        confidence
                    )
                ),
                status="pending"
            )

            db.add(document)
            db.commit()
            db.refresh(document)

            results.append({
                "success": True,
                "document_id": document.id,
                "filename": document.filename,
                "confidence": confidence,
                "doc_type": doc_type,
                "summary": summary,
                "entities": entities
            })

        except Exception as error:

            db.rollback()

            results.append({
                "success": False,
                "filename": file.filename,
                "message": str(error)
            })

        finally:

            if os.path.exists(file_path):
                os.remove(file_path)

    return {
        "total_files": len(files),
        "results": results
    }


@router.post("/replace/{existing_document_id}")
async def replace_document(
    existing_document_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # --------------------------------------------------
    # FIND EXISTING DOCUMENT
    # --------------------------------------------------

    existing_document = (
        db.query(Document)
        .filter(Document.id == existing_document_id)
        .first()
    )

    if not existing_document:
        raise HTTPException(
            status_code=404,
            detail="Existing document not found"
        )

    # --------------------------------------------------
    # SAVE OLD DOCUMENT DATA
    # --------------------------------------------------

    old_entities = dict(existing_document.entities or {})
    old_summary = existing_document.summary
    old_filename = existing_document.filename

    # --------------------------------------------------
    # FILE VALIDATION
    # --------------------------------------------------

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="File has no filename"
        )

    extension = os.path.splitext(file.filename)[1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are supported"
        )

    os.makedirs("temp", exist_ok=True)

    file_path = f"temp/{uuid.uuid4()}_{file.filename}"

    try:
        # --------------------------------------------------
        # SAVE NEW FILE
        # --------------------------------------------------

        file_content = await file.read()

        with open(file_path, "wb") as buffer:
            buffer.write(file_content)

        # --------------------------------------------------
        # PROCESS NEW DOCUMENT
        # --------------------------------------------------

        result = process_document(file_path)

        raw_text = result["raw_text"]
        confidence = result["confidence"]

        # --------------------------------------------------
        # EXTRACT NEW DOCUMENT DATA
        # --------------------------------------------------

        extracted = extract_document_data(raw_text)

        new_entities = extracted.get("entities") or {}
        new_summary = extracted.get("summary")
        new_doc_type = extracted.get("doc_type")

        # --------------------------------------------------
        # BUILD CHANGE COMPARISON
        # --------------------------------------------------

        changes = []

        all_keys = set(old_entities.keys()) | set(new_entities.keys())

        for key in all_keys:

            old_value = old_entities.get(key)
            new_value = new_entities.get(key)

            if old_value != new_value:

                changes.append({
                    "field": key,
                    "old_value": old_value,
                    "new_value": new_value
                })

        # --------------------------------------------------
        # COMPARE SUMMARY
        # --------------------------------------------------

        if old_summary != new_summary:

            changes.append({
                "field": "summary",
                "old_value": old_summary,
                "new_value": new_summary
            })

        # --------------------------------------------------
        # GENERATE AI SUMMARY OF CHANGES
        # --------------------------------------------------

        ai_summary = None

        if changes:

            change_prompt = f"""
You are a document change intelligence system.

Compare the OLD and NEW values below.

Explain only the meaningful changes.

Do not invent information.

Do not mention fields that stayed the same.

OLD vs NEW changes:

{changes}

Write one concise human-readable summary.

Example:

"The deadline was extended from 15 September to
30 September, while the contract value increased
from ₹4.8 Cr to ₹5.1 Cr."
"""

            ai_summary = call_llm(change_prompt)

        # --------------------------------------------------
        # REPLACE EXISTING DOCUMENT DATA
        # --------------------------------------------------

        existing_document.filename = file.filename
        existing_document.raw_text = raw_text
        existing_document.doc_type = new_doc_type
        existing_document.summary = new_summary
        existing_document.entities = new_entities
        existing_document.extraction_confidence = str(
            extracted.get(
                "extraction_confidence",
                confidence
            )
        )
        existing_document.status = "pending"

        db.commit()
        db.refresh(existing_document)

        # --------------------------------------------------
        # CREATE CHANGE HISTORY RECORD
        # --------------------------------------------------

        change = DocumentChange(
            document_id=existing_document.id,
            old_filename=old_filename,
            new_filename=file.filename,
            old_entities=old_entities,
            new_entities=new_entities,
            old_summary=old_summary,
            new_summary=new_summary,
            ai_summary=ai_summary
        )

        db.add(change)
        db.commit()
        db.refresh(change)

        # --------------------------------------------------
        # RESPONSE
        # --------------------------------------------------

        return {
            "replaced": True,
            "document_id": existing_document.id,
            "filename": existing_document.filename,
            "message": "Document replaced successfully.",

            "changes_recorded": True,
            "change_id": change.id,

            "changes": changes,
            "ai_summary": ai_summary,

            "old_entities": old_entities,
            "new_entities": new_entities,

            "old_summary": old_summary,
            "new_summary": new_summary
        }

    except Exception as error:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to replace document: {str(error)}"
        )

    finally:

        if os.path.exists(file_path):
            os.remove(file_path)

