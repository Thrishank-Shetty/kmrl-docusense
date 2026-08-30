from pydantic import BaseModel, ConfigDict
from datetime import date, datetime


# ==================================================
# DOCUMENT ENTITIES
# ==================================================

class DocumentEntities(BaseModel):
    reference_number: str | None = None
    department: str | None = None
    issue_date: date | None = None
    expiry_date: date | None = None
    amount: float | None = None
    vendor_or_party_name: str | None = None
    asset_id: str | None = None


# ==================================================
# DOCUMENT RESPONSE
# ==================================================

class DocumentResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    doc_type: str | None = None
    summary: str | None = None
    entities: dict
    upload_date: datetime
    extraction_confidence: float | None = None
    human_verified: bool


# ==================================================
# COMPLIANCE
# ==================================================

class ComplianceItemResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: int
    document_id: int
    deadline_date: date | None = None
    risk_type: str
    urgency: str


class ComplianceItemUpdate(BaseModel):
    deadline_date: date | None = None
    risk_type: str | None = None
    urgency: str | None = None


# ==================================================
# DOCUMENT UPDATE
# ==================================================

class DocumentUpdate(BaseModel):
    doc_type: str | None = None
    summary: str | None = None
    entities: DocumentEntities | None = None
    verify: bool = False


# ==================================================
# DOCUMENT REVISIONS
# ==================================================

class DocumentRevisionResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: int
    document_id: int
    revision_number: int
    doc_type: str | None = None
    summary: str | None = None
    entities: dict | None = None
    compliance_risk: dict | None = None
    created_at: datetime
    changed_by: str | None = None


# ==================================================
# AUTHENTICATION
# ==================================================

class UserRegister(BaseModel):
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    is_active: bool


class TokenResponse(BaseModel):
    access_token: str
    token_type: str