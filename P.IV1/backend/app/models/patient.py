from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    age = Column(Integer)
    gender = Column(String)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    observations = Column(String, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)

    # Relacionamento: Um paciente pode ter várias consultas
    consultas = relationship("Consultation", back_populates="paciente")
