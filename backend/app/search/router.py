from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Document


router = APIRouter(
    prefix="/search",
    tags=["Search"]
)


@router.get("")
def search_documents(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db)
):
    documents = (
        db.query(Document)
        .filter(
            Document.raw_text.ilike(f"%{q}%")
        )
        .all()
    )

    return [
        {
            "id": document.id,
            "filename": document.filename,
            "summary": document.summary,
        }
        for document in documents
    ]