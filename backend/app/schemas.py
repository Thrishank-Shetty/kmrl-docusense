from pydantic import BaseModel,ConfigDict
from datetime import date,datetime



class DocumentResponse(BaseModel):
    model_config=ConfigDict(from_attributes=True)
    id:int
    filename:str
    doc_type:str | None=None
    entities:dict
    upload_date:datetime 

class ComplianceItemResponse(BaseModel):
    model_config=ConfigDict(from_attributes=True)
    id:int
    document_id:int
    deadline_date:date |None=None
    risk_type:str
    urgency:str