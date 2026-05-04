from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(Integer, primary_key=True, index=True)
    paciente_id = Column(Integer, ForeignKey("patients.id"))
    data = Column(DateTime, default=datetime.utcnow)
    audio_path = Column(String, nullable=True)
    transcricao = Column(Text, nullable=True)
    laudo = Column(Text, nullable=True)
    status = Column(String, default="pendente") # pendente, processando, concluido

    # Relacionamento de volta para o paciente
    paciente = relationship("Patient", back_populates="consultas")
