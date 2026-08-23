from pydantic import BaseModel,ConfigDict
from datetime import date,datetime


class DocumentEntities(BaseModel):
    reference_number:str | None=None
    department:str | None=None
    issue_date:date | None=None
    expiry_date:date | None=None
    amount:float | None=None
    vendor_or_party_name:str | None=None
    asset_id:str | None=None


class DocumentResponse(BaseModel):

    model_config=ConfigDict(from_attributes=True)

    id:int
    filename:str
    doc_type:str | None=None
    summary:str | None=None
    entities:dict
    upload_date:datetime
    extraction_confidence:float | None=None
    human_verified:bool


class ComplianceItemResponse(BaseModel):
    model_config=ConfigDict(from_attributes=True)
    id:int
    document_id:int
    deadline_date:date | None=None
    risk_type:str
    urgency:str


class DocumentUpdate(BaseModel):
    doc_type:str | None=None
    summary:str | None=None
    entities:DocumentEntities | None=None
    verify:bool=False

class ComplianceItemUpdate(BaseModel):
    deadline_date:date | None=None
    risk_type:str | None=None
    urgency:str | None=None


class DocumentRevisionResponse(BaseModel):
    model_config=ConfigDict(from_attributes=True)
    id:int
    document_id:int
    revision_number:int
    doc_type:str | None=None
    summary:str | None=None
    entities:dict | None=None
    compliance_risk:dict | None=None
    created_at:datetime
    changed_by:str | None=None

