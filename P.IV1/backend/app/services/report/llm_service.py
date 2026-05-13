import google.generativeai as genai
from app.services.report.base import BaseReportService
from app.config import settings
from typing import Optional

class LLMReportService(BaseReportService):
    """
    Implementação real que enviará a transcrição para o Google Gemini
    para análise e criação inteligente do laudo médico.
    """
    def __init__(self):
        # Configura a chave de API usando a nossa variável de ambiente configurada
        genai.configure(api_key=settings.GEMINI_API_KEY)
        # Utiliza o modelo gemini-2.5-flash atualizado (o modelo antigo 1.5 foi descontinuado pelo Google)
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    def generate_report(self, transcription: str, patient_info: Optional[dict] = None) -> str:
        name = patient_info.get("name", "Paciente") if patient_info else "Paciente"
        
        prompt = f"""
        Você é um assistente médico especialista de alta precisão. 
        Sua tarefa é ler a transcrição de uma consulta médica e estruturar um laudo clínico formal e profissional para o paciente '{name}'.
        
        Você DEVE extrair as informações relevantes da transcrição e organizá-las ESTRITAMENTE nas 4 seções abaixo.
        Utilize a formatação Markdown exata para os títulos (com 3 hashtags '### ' e a primeira letra maiúscula), pois o nosso sistema depende desta exata formatação para ler o seu retorno:

        ### Identificação
        (Inclua o nome do paciente, sexo, idade e outras informações de identificação, se mencionadas na consulta).

        ### Queixa principal
        (Resumo direto do motivo principal da consulta).

        ### História
        (Relato do paciente, evolução dos sintomas, comorbidades, alergias, etc., extraídos da consulta).

        ### Conduta
        (Orientações, medicamentos, exames pedidos ou recomendações dadas pelo médico na consulta).

        IMPORTANTE: 
        1. NÃO adicione nenhum título diferente destes.
        2. NÃO invente dados. Se uma informação (como idade ou medicamentos) não estiver clara na transcrição, deixe vago ou não mencione.
        3. Escreva de forma profissional, impessoal e médica.
        
        Transcrição do áudio da consulta:
        "{transcription}"
        """
        
        print("Enviando requisição para a API do Google Gemini...")
        response = self.model.generate_content(prompt)
        print("Laudo gerado com sucesso pelo Gemini!")
        
        return response.text

