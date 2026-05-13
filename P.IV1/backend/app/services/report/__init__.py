from app.services.report.base import BaseReportService
from app.services.report.mock_service import MockReportService
from app.services.report.llm_service import LLMReportService

def get_report_service() -> BaseReportService:
    """
    Fábrica que retorna a implementação atual da geração de laudos.
    """
    return LLMReportService()
