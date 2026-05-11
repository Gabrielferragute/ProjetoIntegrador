from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.consultation import ConsultationRepository
from app.schemas.consultation import ConsultationCreate, ConsultationUpdate
# Opcionalmente, pode-se importar PatientRepository para checar se o paciente existe antes de criar a consulta
# from app.repositories.patient import PatientRepository

class ConsultationService:
    def __init__(self, db: Session):
        self.repository = ConsultationRepository(db)
        
    def get_all_consultations(self):
        return self.repository.get_all()
        
    def get_consultation_by_id(self, consultation_id: int):
        consultation = self.repository.get_by_id(consultation_id)
        if not consultation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Consulta não encontrada"
            )
        return consultation
        
    def create_consultation(self, consultation: ConsultationCreate):
        from app.services.patient import PatientService
        
        # Verifica se o paciente existe antes de criar a consulta para retornar erro 404 claro
        patient_service = PatientService(self.repository.db)
        patient_service.get_patient_by_id(consultation.paciente_id)
        
        return self.repository.create(consultation)

    def update_consultation(self, consultation_id: int, consultation_update: ConsultationUpdate):
        db_consultation = self.get_consultation_by_id(consultation_id)
        # Atualizar apenas campos enviados
        update_data = consultation_update.model_dump(exclude_unset=True)
        return self.repository.update(db_consultation, update_data)

    def delete_consultation(self, consultation_id: int):
        db_consultation = self.get_consultation_by_id(consultation_id)
        self.repository.delete(db_consultation)
        return {"detail": "Consulta excluída com sucesso"}

    def process_consultation_data(self, consultation_id: int):
        """
        Orquestra a transcrição do áudio e a geração do laudo, 
        salvando ambos na consulta.
        """
        from app.services.patient import PatientService
        from app.services.transcription import get_transcription_service
        from app.services.report import get_report_service

        try:
            consultation = self.get_consultation_by_id(consultation_id)
            if not consultation.audio_path:
                return

            # Dados do paciente
            patient_service = PatientService(self.repository.db)
            patient = patient_service.get_patient_by_id(consultation.paciente_id)
            
            # 1. Transcrição
            transcriber = get_transcription_service()
            texto_transcrito = transcriber.transcribe(consultation.audio_path)
            
            # 2. Laudo
            report_generator = get_report_service()
            patient_info = {"name": patient.name}
            laudo_gerado = report_generator.generate_report(texto_transcrito, patient_info)
            
            # 3. Salva na consulta
            update_data = ConsultationUpdate(
                transcricao=texto_transcrito,
                laudo=laudo_gerado,
                status="finalizada"
            )
            self.update_consultation(consultation_id, update_data)
            
        except Exception as e:
            # Em caso de erro, atualizamos o status
            self.update_consultation(consultation_id, ConsultationUpdate(status="erro_processamento"))


