import time
from app.services.transcription.base import BaseTranscriptionService

class MockTranscriptionService(BaseTranscriptionService):
    """
    Serviço de transcrição simulado para facilitar o desenvolvimento
    e testes no frontend sem gastar créditos de API ou exigir GPUs.
    """
    def transcribe(self, audio_path: str) -> str:
        # Simula o tempo de processamento de uma rede neural
        time.sleep(2)
        return "Paciente relata dor de cabeça há 3 dias..."
