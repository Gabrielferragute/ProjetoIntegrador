import time
from app.services.report.base import BaseReportService
from typing import Optional

class MockReportService(BaseReportService):
    """
    Serviço simulado que estrutura um laudo básico para uso no TCC 
    sem depender de consumo imediato de IA externa.
    """
    def generate_report(self, transcription: str, patient_info: Optional[dict] = None) -> str:
        # Simula o tempo de processamento do modelo
        time.sleep(1)
        
        nome = patient_info.get("nome", "Paciente") if patient_info else "Paciente"
        
        # Template fixo estruturado exigido
        report = f"""### Identificação
Nome: {nome}

### Queixa principal
Cefaleia

### História
{transcription}

### Conduta
- Prescrição de analgésico
- Repouso
- Retorno SN
"""
        return report
