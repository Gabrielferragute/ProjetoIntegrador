import os
from fastapi import APIRouter, Depends, status, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.consultation import ConsultationResponse, ConsultationCreate, ConsultationUpdate
from app.services.consultation import ConsultationService
from app.utils.file_handler import save_upload_file

router = APIRouter(prefix="/consultations", tags=["consultations"])

UPLOAD_DIR = "uploads/audios"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=ConsultationResponse, status_code=status.HTTP_201_CREATED)
def create_consultation(consultation: ConsultationCreate, db: Session = Depends(get_db)):
    service = ConsultationService(db)
    return service.create_consultation(consultation)

@router.get("/", response_model=List[ConsultationResponse])
def read_consultations(db: Session = Depends(get_db)):
    service = ConsultationService(db)
    return service.get_all_consultations()

@router.get("/{consultation_id}", response_model=ConsultationResponse)
def read_consultation(consultation_id: int, db: Session = Depends(get_db)):
    service = ConsultationService(db)
    return service.get_consultation_by_id(consultation_id)

@router.put("/{consultation_id}", response_model=ConsultationResponse)
def update_consultation(consultation_id: int, consultation: ConsultationUpdate, db: Session = Depends(get_db)):
    service = ConsultationService(db)
    return service.update_consultation(consultation_id, consultation)

@router.post("/{consultation_id}/audio", response_model=ConsultationResponse)
def upload_audio(
    consultation_id: int, 
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    service = ConsultationService(db)
    
    # Verifica se a consulta existe
    service.get_consultation_by_id(consultation_id)
    
    # Salva o arquivo fisicamente
    file_path = save_upload_file(file, prefix=f"consultation_{consultation_id}")
        
    # Atualiza a consulta com o caminho do áudio e muda o status
    update_data = ConsultationUpdate(
        audio_path=file_path,
        status="processando"
    )
    updated_consultation = service.update_consultation(consultation_id, update_data)

    # Inicia a orquestração de Inteligência (Transcrição + Laudo) em background
    background_tasks.add_task(service.process_consultation_data, consultation_id)

    return updated_consultation

@router.delete("/{consultation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_consultation(consultation_id: int, db: Session = Depends(get_db)):
    service = ConsultationService(db)
    service.delete_consultation(consultation_id)
