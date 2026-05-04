from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# =========================
# Consulta Schemas
# =========================
class ConsultaBase(BaseModel):
    observacoes: str
    data_consulta: datetime

class ConsultaCreate(ConsultaBase):
    pass

class ConsultaResponse(ConsultaBase):
    id: int
    paciente_id: int

    class Config:
        from_attributes = True

# =========================
# Paciente Schemas
# =========================
class PacienteBase(BaseModel):
    nome: str
    cpf: str
    data_nascimento: datetime

class PacienteCreate(PacienteBase):
    pass

class PacienteResponse(PacienteBase):
    id: int
    consultas: List[ConsultaResponse] = []

    class Config:
        from_attributes = True
