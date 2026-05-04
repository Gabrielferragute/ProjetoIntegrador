from app.services.transcription.base import BaseTranscriptionService
from app.services.transcription.mock_service import MockTranscriptionService
from app.services.transcription.whisper_service import WhisperTranscriptionService

def get_transcription_service() -> BaseTranscriptionService:
    """
    Fábrica que retorna a implementação atual do serviço de transcrição.
    Ao trocar a classe aqui, o sistema inteiro passa a usar a nova tecnologia,
    pois todas implementam a BaseTranscriptionService.
    """
    # Para usar o Whisper de verdade depois, basta trocar a linha abaixo para:
    # return WhisperTranscriptionService()
    
    return MockTranscriptionService()
