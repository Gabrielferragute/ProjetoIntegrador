from sqlalchemy.orm import Session
from app.models.consultation import Consultation
from app.schemas.consultation import ConsultationCreate

class ConsultationRepository:
    def __init__(self, db: Session):
        self.db = db
        
    def get_all(self):
        return self.db.query(Consultation).all()
        
    def get_by_paciente_id(self, paciente_id: int):
        return self.db.query(Consultation).filter(Consultation.paciente_id == paciente_id).all()
        
    def create(self, consultation: ConsultationCreate):
        db_consultation = Consultation(**consultation.model_dump())
        self.db.add(db_consultation)
        self.db.commit()
        self.db.refresh(db_consultation)
        return db_consultation

    def get_by_id(self, consultation_id: int):
        return self.db.query(Consultation).filter(Consultation.id == consultation_id).first()

    def update(self, db_consultation: Consultation, update_data: dict):
        for key, value in update_data.items():
            setattr(db_consultation, key, value)
        self.db.commit()
        self.db.refresh(db_consultation)
        return db_consultation

    def delete(self, db_consultation: Consultation):
        self.db.delete(db_consultation)
        self.db.commit()
