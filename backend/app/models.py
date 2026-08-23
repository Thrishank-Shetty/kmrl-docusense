from app.database import Base
from sqlalchemy import Integer, Column, String, Text, JSON, DateTime, ForeignKey, Date,Float
from datetime import datetime
from sqlalchemy.orm import relationship

class Document(Base):
    __tablename__="documents"
    id=Column(Integer,primary_key=True,index=True)
    filename=Column(String)
    raw_text=Column(Text)
    doc_type=Column(String,nullable=True)
    summary=Column(Text,nullable=True)
    entities=Column(JSON)
    upload_date=Column(DateTime,default=datetime.now)
    queue_position = Column(Integer, nullable=True)
    extraction_confidence = Column(Float)
    compliance=relationship(
        "ComplianceItem",
        back_populates="document"
    )
    status = Column(String, default="pending")
    file_hash = Column(String, unique=True, nullable=False, index=True)
    extraction_confidence = Column(Float, nullable=True)
    human_verified = Column(Boolean, default=False, nullable=False)


class ComplianceItem(Base):
    __tablename__="compliance_item"
    id=Column(Integer,primary_key=True,index=True)
    document_id=Column(Integer,ForeignKey("documents.id"))
    deadline_date=Column(Date,nullable=True)
    risk_type=Column(String)
    urgency=Column(String)
    created_at=Column(DateTime,default=datetime.now)
    document=relationship(
        "Document",
        back_populates="compliance"
    )