from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case

from app.database import get_db
from app.models import Document, ComplianceItem


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get("/summary")
def analytics_summary(db: Session = Depends(get_db)):

    # ---------------------------------------------------------
    # 1. TOTAL PROCESSED
    # ---------------------------------------------------------

    total_processed = db.query(
        func.count(Document.id)
    ).scalar() or 0


    # ---------------------------------------------------------
    # 2. COMPLIANCE SCORE
    # ---------------------------------------------------------

    if total_processed == 0:
        compliance_score = 100.0

    else:
        risky_documents = db.query(
            func.count(func.distinct(ComplianceItem.document_id))
        ).filter(
            ComplianceItem.urgency.in_(["critical", "high"])
        ).scalar() or 0

        compliant_documents = total_processed - risky_documents

        compliance_score = round(
            (compliant_documents / total_processed) * 100,
            1
        )


    # ---------------------------------------------------------
    # 3. DOCUMENTS THIS WEEK
    # ---------------------------------------------------------

    now = datetime.now()

    # Monday 00:00 of the current week
    start_of_week = (
        now - timedelta(days=now.weekday())
    ).replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0
    )

    documents_this_week = db.query(
        func.count(Document.id)
    ).filter(
        Document.upload_date >= start_of_week
    ).scalar() or 0


        # ---------------------------------------------------------
    # 4. MANUAL REVIEW REQUIRED
    # ---------------------------------------------------------
    #
    manual_review_required = db.query(
    func.count(Document.id)
).filter(
    Document.extraction_confidence.isnot(None),
    Document.extraction_confidence < 0.70,
    Document.human_verified == False
).scalar() or 0

    # ---------------------------------------------------------
    # 5. DOCUMENT TYPE COUNTS
    # ---------------------------------------------------------

    doc_type_results = db.query(
        Document.doc_type,
        func.count(Document.id)
    ).filter(
        Document.doc_type.isnot(None)
    ).group_by(
        Document.doc_type
    ).all()

    doc_type_counts = []

    for doc_type, count in doc_type_results:

        percentage = round(
            (count / total_processed) * 100,
            1
        ) if total_processed else 0

        doc_type_counts.append({
            "type": doc_type,
            "count": count,
            "percentage": percentage
        })


    # ---------------------------------------------------------
    # 6. URGENCY COUNTS
    # ---------------------------------------------------------

    urgency_results = db.query(
        ComplianceItem.urgency,
        func.count(ComplianceItem.id)
    ).filter(
        ComplianceItem.urgency.isnot(None)
    ).group_by(
        ComplianceItem.urgency
    ).all()

    urgency_counts = []

    for urgency, count in urgency_results:

        urgency_counts.append({
            "urgency": urgency,
            "count": count
        })


    # ---------------------------------------------------------
    # 7. VOLUME BY WEEK
    # ---------------------------------------------------------

    thirty_days_ago = now - timedelta(days=30)

    documents = db.query(
        Document.upload_date
    ).filter(
        Document.upload_date >= thirty_days_ago
    ).order_by(
        Document.upload_date
    ).all()

    weekly_counts = {}

    for (upload_date,) in documents:

        monday = (
            upload_date - timedelta(days=upload_date.weekday())
        ).date()

        week_key = monday.isoformat()

        weekly_counts[week_key] = (
            weekly_counts.get(week_key, 0) + 1
        )

    volume_by_week = [
        {
            "week": week,
            "count": count
        }
        for week, count in sorted(weekly_counts.items())
    ]


    # ---------------------------------------------------------
    # FINAL RESPONSE
    # ---------------------------------------------------------

    return {
        "total_processed": total_processed,
        "compliance_score": compliance_score,
        "documents_this_week": documents_this_week,
        "manual_review_required": manual_review_required,
        "doc_type_counts": doc_type_counts,
        "urgency_counts": urgency_counts,
        "volume_by_week": volume_by_week
    }