from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Document, ComplianceItem


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get("/summary")
def analytics_summary(
    range_days: int = 30,
    db: Session = Depends(get_db)
):

    # ---------------------------------------------------------
    # VALIDATE RANGE
    # ---------------------------------------------------------

    if range_days not in [7, 30, 90]:
        range_days = 30

    now = datetime.now()


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
    # 7. EXTRACTION VOLUME
    # ---------------------------------------------------------
    #
    # 7 DAYS  -> one bar per day
    #
    # 30 DAYS -> one bar per week
    #
    # 90 DAYS -> one bar per week
    # ---------------------------------------------------------

    range_start = now - timedelta(days=range_days)

    documents = db.query(
        Document.upload_date
    ).filter(
        Document.upload_date >= range_start
    ).order_by(
        Document.upload_date
    ).all()


    volume_by_period = []


    # =========================================================
    # LAST 7 DAYS
    # ONE BAR PER DAY
    # =========================================================

    if range_days == 7:

        # Start from today - 6 days so we get exactly
        # seven calendar days including today.

        first_day = (
            now - timedelta(days=6)
        ).replace(
            hour=0,
            minute=0,
            second=0,
            microsecond=0
        )

        daily_counts = {}

        # Create all 7 days first.
        # This makes sure days with zero documents
        # still appear on the graph.

        for i in range(7):

            current_day = (
                first_day + timedelta(days=i)
            )

            day_key = current_day.date().isoformat()

            daily_counts[day_key] = 0


        # Count documents for each day.

        for (upload_date,) in documents:

            day_key = upload_date.date().isoformat()

            if day_key in daily_counts:

                daily_counts[day_key] += 1


        # Build graph data.

        for day, count in sorted(
            daily_counts.items()
        ):

            date_object = datetime.strptime(
                day,
                "%Y-%m-%d"
            )

            volume_by_period.append({
                "period": date_object.strftime("%a"),
                "date": day,
                "count": count
            })


    # =========================================================
    # LAST 30 / 90 DAYS
    # ONE BAR PER WEEK
    # =========================================================

    else:

        weekly_counts = {}


        for (upload_date,) in documents:

            # Monday of the document's week

            monday = (
                upload_date -
                timedelta(days=upload_date.weekday())
            ).date()

            week_key = monday.isoformat()

            weekly_counts[week_key] = (
                weekly_counts.get(week_key, 0) + 1
            )


        # Build weekly graph data.

        for week, count in sorted(
            weekly_counts.items()
        ):

            week_date = datetime.strptime(
                week,
                "%Y-%m-%d"
            )

            volume_by_period.append({
                "period": week_date.strftime("%d %b"),
                "week_start": week,
                "count": count
            })


    # ---------------------------------------------------------
    # FINAL RESPONSE
    # ---------------------------------------------------------

    return {
        "range_days": range_days,

        "total_processed": total_processed,

        "compliance_score": compliance_score,

        "documents_this_week": documents_this_week,

        "manual_review_required": manual_review_required,

        "doc_type_counts": doc_type_counts,

        "urgency_counts": urgency_counts,

        "volume_by_period": volume_by_period
    }