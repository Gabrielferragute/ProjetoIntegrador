import time
from app.services.report.base import BaseReportService
from typing import Optional

class MockReportService(BaseReportService):
    """
    Serviço simulado que estrutura um laudo básico para uso no TCC 
    sem depender de consumo imediato de IA externa.
    """
    def generate_report(self, transcription: str, patient_info: Optional[dict] = None) -> str:
        name = patient_info.get("name", "Paciente") if patient_info else "Paciente"
        time.sleep(1)
        
        # Template fixo estruturado exigido
        return f"""
### IDENTIFICAÇÃO
Nome: {name}

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
