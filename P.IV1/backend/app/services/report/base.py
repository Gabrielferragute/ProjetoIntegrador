from abc import ABC, abstractmethod
from typing import Optional

class BaseReportService(ABC):
    @abstractmethod
    def generate_report(self, transcription: str, patient_info: Optional[dict] = None) -> str:
        """
        Recebe o texto transcrito da consulta (e opcionalmente dados do paciente)
        e retorna um laudo clínico estruturado (ex: em Markdown ou JSON).
        """
        pass
