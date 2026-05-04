from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ConsultationBase(BaseModel):
    paciente_id: int
    audio_path: Optional[str] = None
    transcricao: Optional[str] = None
    laudo: Optional[str] = None
    status: str = "pendente"

class ConsultationCreate(ConsultationBase):
    pass

class ConsultationUpdate(BaseModel):
    audio_path: Optional[str] = None
    transcricao: Optional[str] = None
    laudo: Optional[str] = None
    status: Optional[str] = None


class ConsultationResponse(ConsultationBase):
    id: int
    data: datetime

    class Config:
        from_attributes = True
