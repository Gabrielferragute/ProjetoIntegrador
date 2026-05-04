from abc import ABC, abstractmethod

class BaseTranscriptionService(ABC):
    @abstractmethod
    def transcribe(self, audio_path: str) -> str:
        """
        Recebe o caminho absoluto ou relativo do arquivo de áudio
        e retorna a transcrição em texto.
        """
        pass
