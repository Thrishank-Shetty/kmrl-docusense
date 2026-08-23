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
import hashlib


router = APIRouter()


ALLOWED_EXTENSIONS = {".pdf", ".docx"}


# ============================================================
# UPLOAD DOCUMENTS
# ============================================================

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
            # EXACT DUPLICATE CHECK
            # --------------------------------------------------

            file_hash = hashlib.sha256(file_content).hexdigest()

            existing_document = (
                db.query(Document)
                .filter(Document.file_hash == file_hash)
                .first()
            )

            if existing_document:

                results.append({
                    "success": False,
                    "duplicate": True,
                    "message": "This exact document has already been uploaded.",
                    "document_id": existing_document.id,
                    "filename": existing_document.filename
                })

                continue

            # --------------------------------------------------
            # OCR / TEXT EXTRACTION
            # --------------------------------------------------

            result = process_document(file_path)

            raw_text = result["raw_text"]
            ocr_confidence = result["confidence"]

            # --------------------------------------------------
            # NLP EXTRACTION
            # --------------------------------------------------

            extracted = extract_document_data(raw_text)

            doc_type = extracted.get("doc_type")
            summary = extracted.get("summary")
            entities = extracted.get("entities") or {}

            extraction_confidence = extracted.get(
                "extraction_confidence",
                ocr_confidence
            )

            # --------------------------------------------------
            # CHECK FOR EXISTING VERSION
            # --------------------------------------------------

            reference_number = entities.get("reference_number")

            existing_version = None

            if reference_number:

                existing_version = (
                    db.query(Document)
                    .filter(
                        Document.entities["reference_number"].as_string()
                        == reference_number
                    )
                    .first()
                )

            # --------------------------------------------------
            # EXISTING DOCUMENT WITH SAME REFERENCE
            # --------------------------------------------------

            if existing_version:

                results.append({
                    "success": False,
                    "duplicate": False,
                    "newer_version": True,
                    "requires_confirmation": True,

                    "message": (
                        "A document with the same reference number "
                        "already exists. Replace it to create a "
                        "document change record."
                    ),

                    "existing_document_id": existing_version.id,
                    "existing_filename": existing_version.filename,
                    "new_filename": file.filename,
                    "reference_number": reference_number
                })

                continue

            # --------------------------------------------------
            # CREATE NEW DOCUMENT
            # --------------------------------------------------

            document = Document(
                filename=file.filename,
                raw_text=raw_text,
                doc_type=doc_type,
                summary=summary,
                entities=entities,

                extraction_confidence=str(
                    extraction_confidence
                ),

                ocr_confidence=str(
                    ocr_confidence
                ),

                file_hash=file_hash,

                status="pending"
            )

            db.add(document)
            db.commit()
            db.refresh(document)

            # --------------------------------------------------
            # SUCCESS
            # --------------------------------------------------

            results.append({
                "success": True,
                "document_id": document.id,
                "filename": document.filename,
                "confidence": ocr_confidence,
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


# ============================================================
# REPLACE DOCUMENT
# ============================================================

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
    # SAVE OLD DATA
    # --------------------------------------------------

    old_entities = dict(
        existing_document.entities or {}
    )

    old_summary = existing_document.summary
    old_filename = existing_document.filename

    # --------------------------------------------------
    # VALIDATE FILE
    # --------------------------------------------------

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="File has no filename"
        )

    extension = os.path.splitext(
        file.filename
    )[1].lower()

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
        # HASH NEW FILE
        # --------------------------------------------------

        file_hash = hashlib.sha256(
            file_content
        ).hexdigest()

        # --------------------------------------------------
        # EXACT SAME FILE CHECK
        # --------------------------------------------------

        if (
            existing_document.file_hash
            and existing_document.file_hash == file_hash
        ):

            return {
                "replaced": False,
                "duplicate": True,
                "message": "This exact document is already uploaded.",
                "document_id": existing_document.id,
                "filename": existing_document.filename
            }

        # --------------------------------------------------
        # OCR
        # --------------------------------------------------

        result = process_document(file_path)

        raw_text = result["raw_text"]
        ocr_confidence = result["confidence"]

        # --------------------------------------------------
        # NLP
        # --------------------------------------------------

        extracted = extract_document_data(raw_text)

        new_entities = extracted.get("entities") or {}
        new_summary = extracted.get("summary")
        new_doc_type = extracted.get("doc_type")

        extraction_confidence = extracted.get(
            "extraction_confidence",
            ocr_confidence
        )

        # --------------------------------------------------
        # BUILD CHANGES
        # --------------------------------------------------

        changes = []

        all_keys = (
            set(old_entities.keys())
            | set(new_entities.keys())
        )

        for key in sorted(all_keys):

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
        # AI SUMMARY
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
        # UPDATE EXISTING DOCUMENT
        # --------------------------------------------------

        existing_document.filename = file.filename
        existing_document.raw_text = raw_text
        existing_document.doc_type = new_doc_type
        existing_document.summary = new_summary
        existing_document.entities = new_entities

        existing_document.extraction_confidence = str(
            extraction_confidence
        )

        existing_document.ocr_confidence = str(
            ocr_confidence
        )

        existing_document.file_hash = file_hash

        existing_document.status = "pending"

        db.commit()
        db.refresh(existing_document)

        # --------------------------------------------------
        # CREATE CHANGE HISTORY
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
            "new_summary": new_summary,

            "raw_text": raw_text,
            "doc_type": existing_document.doc_type,
            "summary": existing_document.summary,
            "entities": existing_document.entities,

            "confidence": ocr_confidence
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