from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Paciente(Base):
    __tablename__ = "pacientes"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)
    cpf = Column(String, unique=True, index=True)
    data_nascimento = Column(DateTime)

    consultas = relationship("Consulta", back_populates="paciente")


class Consulta(Base):
    __tablename__ = "consultas"

    id = Column(Integer, primary_key=True, index=True)
    paciente_id = Column(Integer, ForeignKey("pacientes.id"))
    data_consulta = Column(DateTime, default=datetime.utcnow)
    observacoes = Column(String)

    paciente = relationship("Paciente", back_populates="consultas")
