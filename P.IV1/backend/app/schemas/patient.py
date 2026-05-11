from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from app.schemas.consultation import ConsultationResponse

class PatientBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    age: int = Field(..., ge=0, le=150)
    gender: str = Field(..., min_length=1, max_length=30)
    email: Optional[str] = Field(None, pattern=r"^\S+@\S+\.\S+$", max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    observations: Optional[str] = Field(None, max_length=1000)

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    age: Optional[int] = Field(None, ge=0, le=150)
    gender: Optional[str] = Field(None, min_length=1, max_length=30)
    email: Optional[str] = Field(None, pattern=r"^\S+@\S+\.\S+$", max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    observations: Optional[str] = Field(None, max_length=1000)

class PatientResponse(PatientBase):
    id: int
    createdAt: datetime

    class Config:
        from_attributes = True

class PatientProfileResponse(PatientResponse):
    consultas: List[ConsultationResponse] = []
