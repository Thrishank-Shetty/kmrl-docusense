from app.database import Base
from sqlalchemy import Integer, Column, String, Text, JSON, DateTime, ForeignKey, Date,Float,Boolean
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
    queue_position=Column(Integer,nullable=True)

    compliance=relationship(
        "ComplianceItem",
        back_populates="document"
    )

    status=Column(String,default="pending")
    file_hash=Column(String,unique=True,nullable=False,index=True)
    extraction_confidence=Column(Float,nullable=True)
    human_verified=Column(Boolean,default=False,nullable=False)

    revisions=relationship(
        "DocumentRevision",
        back_populates="document",
        cascade="all, delete-orphan"
    )

    change_history=relationship(
        "DocumentChange",
        back_populates="document",
        cascade="all, delete-orphan"
    )

class ComplianceItem(Base):
    __tablename__="compliance_item"
    id=Column(Integer,primary_key=True,index=True)
    document_id=Column(Integer,ForeignKey("documents.id"))
    deadline_date=Column(Date,nullable=True)
    risk_type=Column(String,nullable=False)
    urgency=Column(String)
    created_at=Column(DateTime,default=datetime.now)
    document=relationship(
        "Document",
        back_populates="compliance"
    )


class DocumentRevision(Base):
    __tablename__="document_revisions"
    id=Column(Integer,primary_key=True,index=True)
    document_id=Column(Integer,ForeignKey("documents.id"),nullable=False)
    revision_number=Column(Integer,nullable=False)
    doc_type=Column(String,nullable=True)
    summary=Column(Text,nullable=True)
    entities=Column(JSON,nullable=True)
    compliance_risk=Column(JSON,nullable=True)
    created_at=Column(DateTime,default=datetime.now)
    changed_by=Column(String,nullable=True)
    document=relationship(
        "Document",
        back_populates="revisions"
    )

class DocumentChange(Base):
    __tablename__ = "document_changes"

    id = Column(Integer, primary_key=True, index=True)

    document_id = Column(
        Integer,
        ForeignKey("documents.id"),
        nullable=False
    )

    old_filename = Column(String, nullable=True)
    new_filename = Column(String, nullable=True)

    old_entities = Column(JSON, nullable=True)
    new_entities = Column(JSON, nullable=True)

    old_summary = Column(Text, nullable=True)
    new_summary = Column(Text, nullable=True)

    ai_summary = Column(Text, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.now
    )

    document = relationship(
        "Document",
        back_populates="change_history"
    )