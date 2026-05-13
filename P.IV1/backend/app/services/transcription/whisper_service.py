import os
import whisper
from app.services.transcription.base import BaseTranscriptionService

class WhisperTranscriptionService(BaseTranscriptionService):
    """
    Implementação real da transcrição usando Whisper.
    """
    def __init__(self):
        # Carrega o modelo 'base' do Whisper na memória ao instanciar o serviço.
        # Pode demorar alguns segundos na primeira vez para baixar o modelo (~74MB).
        print("Carregando modelo Whisper Local...")
        self.model = whisper.load_model("base")
        print("Modelo Whisper Local carregado com sucesso!")

    def transcribe(self, audio_path: str) -> str:
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Arquivo de áudio não encontrado: {audio_path}")
            
        print(f"Iniciando transcrição do áudio: {audio_path}")
        result = self.model.transcribe(audio_path, language="pt")
        print(f"Transcrição finalizada.")
        
        return result["text"]
