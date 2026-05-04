from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)
    idade = Column(Integer)
    sexo = Column(String)
    criado_em = Column(DateTime, default=datetime.utcnow)

    # Relacionamento: Um paciente pode ter várias consultas
    consultas = relationship("Consultation", back_populates="paciente")
