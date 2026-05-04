from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.schemas.consultation import ConsultationResponse

class PatientBase(BaseModel):
    nome: str
    idade: int
    sexo: str

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    nome: Optional[str] = None
    idade: Optional[int] = None
    sexo: Optional[str] = None

class PatientResponse(PatientBase):
    id: int
    criado_em: datetime

    class Config:
        from_attributes = True

class PatientProfileResponse(PatientResponse):
    consultas: List[ConsultationResponse] = []
