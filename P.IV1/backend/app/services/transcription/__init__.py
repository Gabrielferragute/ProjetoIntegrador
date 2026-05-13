from app.services.transcription.base import BaseTranscriptionService
from app.services.transcription.mock_service import MockTranscriptionService
from app.services.transcription.whisper_service import WhisperTranscriptionService

def get_transcription_service() -> BaseTranscriptionService:
    """
    Fábrica que retorna a implementação atual do serviço de transcrição.
    """
    return WhisperTranscriptionService()
