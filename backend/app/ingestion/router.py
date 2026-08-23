
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Annotated
from app.database import get_db
from app.models import Document
from app.ingestion.ocr import process_document
from app.nlp.extractor import extract_document_data

import os
import uuid
import hashlib


router = APIRouter()


@router.post("/upload")
async def upload_document(
    files: list[UploadFile]=File(...),
    db: Session = Depends(get_db)
):
    # --------------------------------------------------
    # FILE VALIDATION
    # --------------------------------------------------

    if not files:
        raise HTTPException(
            status_code=400,
            detail="At least one PDF file is required"
        )

    for file in files:
        if not file.filename or not file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=400,
                detail=f"Only PDF files are supported: {file.filename}"
            )

    os.makedirs("temp", exist_ok=True)

    results = []

    # --------------------------------------------------
    # PROCESS EACH FILE
    # --------------------------------------------------

    for file in files:

        file_path = f"temp/{uuid.uuid4()}_{file.filename}"

        try:
            # --------------------------------------------------
            # SAVE UPLOADED FILE
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
                    "duplicate": True,
                    "message": "This document has already been uploaded.",
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

            # --------------------------------------------------
            # CHECK FOR EXISTING DOCUMENT USING
            # REFERENCE NUMBER
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
            # NEWER VERSION / SAME DOCUMENT CHECK
            # --------------------------------------------------

            if existing_version:
                results.append({
                    "duplicate": False,
                    "newer_version": True,
                    "requires_confirmation": True,
                    "message": (
                        "A document with the same reference number "
                        "already exists. Do you want to replace the "
                        "existing document with this newer version?"
                    ),
                    "existing_document_id": existing_version.id,
                    "existing_filename": existing_version.filename,
                    "new_filename": file.filename,
                    "reference_number": reference_number
                })

                continue

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
                        ocr_confidence
                    )
                ),
                file_hash=file_hash,
                status="pending"
            )

            db.add(document)

            try:
                db.commit()
                db.refresh(document)

            except IntegrityError:
                db.rollback()

                existing_document = (
                    db.query(Document)
                    .filter(Document.file_hash == file_hash)
                    .first()
                )

                if existing_document:
                    results.append({
                        "duplicate": True,
                        "message": (
                            "This document has already been uploaded."
                        ),
                        "document_id": existing_document.id,
                        "filename": existing_document.filename
                    })

                    continue

                raise HTTPException(
                    status_code=500,
                    detail="Failed to save document."
                )

            # --------------------------------------------------
            # SUCCESS RESULT FOR THIS FILE
            # --------------------------------------------------

            results.append({
                "document_id": document.id,
                "filename": document.filename,
                "raw_text": raw_text,
                "confidence": ocr_confidence,
                "doc_type": doc_type,
                "summary": summary,
                "entities": entities,
                "duplicate": False,
                "newer_version": False,
                "requires_confirmation": False,
                "message": "Document uploaded successfully."
            })

        finally:
            # --------------------------------------------------
            # REMOVE TEMPORARY FILE
            # --------------------------------------------------

            if os.path.exists(file_path):
                os.remove(file_path)

    # --------------------------------------------------
    # RETURN ALL RESULTS
    # --------------------------------------------------

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
    # FILE VALIDATION
    # --------------------------------------------------

    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported"
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

        file_hash = hashlib.sha256(file_content).hexdigest()

        # --------------------------------------------------
        # EXACT SAME FILE CHECK
        # --------------------------------------------------

        if file_hash == existing_document.file_hash:
            return {
                "duplicate": True,
                "message": "This exact document is already uploaded.",
                "document_id": existing_document.id
            }

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

        # --------------------------------------------------
        # UPDATE EXISTING DOCUMENT
        # --------------------------------------------------

        existing_document.filename = file.filename
        existing_document.raw_text = raw_text
        existing_document.doc_type = extracted.get("doc_type")
        existing_document.summary = extracted.get("summary")
        existing_document.entities = extracted.get("entities") or {}

        existing_document.extraction_confidence = str(
            extracted.get(
                "extraction_confidence",
                ocr_confidence
            )
        )

        existing_document.file_hash = file_hash
        existing_document.status = "pending"

        db.commit()
        db.refresh(existing_document)

        # --------------------------------------------------
        # SUCCESS RESPONSE
        # --------------------------------------------------

        return {
            "replaced": True,
            "document_id": existing_document.id,
            "filename": existing_document.filename,
            "message": "Document replaced successfully.",
            "raw_text": raw_text,
            "doc_type": existing_document.doc_type,
            "summary": existing_document.summary,
            "entities": existing_document.entities
        }

    finally:
        # --------------------------------------------------
        # REMOVE TEMPORARY FILE
        # --------------------------------------------------

        if os.path.exists(file_path):
            os.remove(file_path)