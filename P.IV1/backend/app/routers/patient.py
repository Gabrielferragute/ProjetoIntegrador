from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.patient import PatientResponse, PatientCreate, PatientUpdate, PatientProfileResponse
from app.schemas.consultation import ConsultationResponse
from app.services.patient import PatientService

router = APIRouter(prefix="/patients", tags=["patients"])

@router.post("/", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    service = PatientService(db)
    return service.create_patient(patient)

@router.get("/", response_model=List[PatientResponse])
def read_patients(db: Session = Depends(get_db)):
    service = PatientService(db)
    return service.get_all_patients()

@router.get("/{patient_id}", response_model=PatientProfileResponse)
def read_patient(patient_id: int, db: Session = Depends(get_db)):
    service = PatientService(db)
    return service.get_patient_by_id(patient_id)

@router.get("/{patient_id}/consultations", response_model=List[ConsultationResponse])
def read_patient_consultations(patient_id: int, db: Session = Depends(get_db)):
    service = PatientService(db)
    patient = service.get_patient_by_id(patient_id)
    return patient.consultas

@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(patient_id: int, patient: PatientUpdate, db: Session = Depends(get_db)):
    service = PatientService(db)
    return service.update_patient(patient_id, patient)

@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    service = PatientService(db)
    service.delete_patient(patient_id)
