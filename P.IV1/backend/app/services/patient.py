from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.patient import PatientRepository
from app.schemas.patient import PatientCreate, PatientUpdate

class PatientService:
    def __init__(self, db: Session):
        self.repository = PatientRepository(db)
        
    def get_all_patients(self):
        return self.repository.get_all()
        
    def get_patient_by_id(self, patient_id: int):
        patient = self.repository.get_by_id(patient_id)
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Paciente não encontrado"
            )
        return patient
        
    def create_patient(self, patient: PatientCreate):
        return self.repository.create(patient)

    def update_patient(self, patient_id: int, patient_update: PatientUpdate):
        db_patient = self.get_patient_by_id(patient_id)
        # exclude_unset=True garante que atualizaremos apenas os campos enviados na requisição
        update_data = patient_update.model_dump(exclude_unset=True)
        return self.repository.update(db_patient, update_data)

    def delete_patient(self, patient_id: int):
        db_patient = self.get_patient_by_id(patient_id)
        self.repository.delete(db_patient)
        return {"detail": "Paciente excluído com sucesso"}
