from sqlalchemy.orm import Session
from app.models.patient import Patient
from app.schemas.patient import PatientCreate

class PatientRepository:
    def __init__(self, db: Session):
        self.db = db
        
    def get_all(self):
        return self.db.query(Patient).all()
        
    def get_by_id(self, patient_id: int):
        return self.db.query(Patient).filter(Patient.id == patient_id).first()
        
    def create(self, patient: PatientCreate):
        db_patient = Patient(**patient.model_dump())
        self.db.add(db_patient)
        self.db.commit()
        self.db.refresh(db_patient)
        return db_patient

    def update(self, db_patient: Patient, update_data: dict):
        for key, value in update_data.items():
            setattr(db_patient, key, value)
        self.db.commit()
        self.db.refresh(db_patient)
        return db_patient

    def delete(self, db_patient: Patient):
        self.db.delete(db_patient)
        self.db.commit()
