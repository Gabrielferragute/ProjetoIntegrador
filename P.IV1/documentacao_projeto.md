# Documentação do Projeto: Sistema de Gerenciamento de Pacientes com IA

## 1. Visão Geral (Overview)

O projeto é um **Sistema de Gerenciamento de Pacientes e Consultas**, focado em otimizar o tempo de profissionais da saúde através da automação de laudos médicos. A principal inovação do sistema é permitir que o médico grave o áudio da consulta e, através de Inteligência Artificial, o sistema transcreva a conversa e gere um laudo clínico estruturado automaticamente.

Este projeto foi desenvolvido como parte de um Trabalho de Conclusão de Curso (TCC - Projeto Integrador P.IV1) e é dividido em duas partes principais:
- **Frontend:** Aplicação Web SPA desenvolvida em Angular.
- **Backend:** API RESTful desenvolvida em Python com FastAPI.

---

## 2. Como Funciona? (Arquitetura e Fluxo)

O fluxo principal do sistema baseia-se nas seguintes etapas:

1. **Gestão de Pacientes:** O médico acessa o sistema e pode cadastrar novos pacientes ou selecionar um paciente existente na lista.
2. **Início da Consulta:** Ao selecionar um paciente, o médico inicia uma nova consulta.
3. **Gravação de Áudio:** O frontend fornece uma interface para gravar o áudio da consulta em tempo real (via navegador).
4. **Upload e Processamento:** Após finalizar a gravação, o áudio é enviado para o backend. O backend salva o arquivo e inicia a orquestração:
   - **Transcrição:** Envia o áudio para um serviço de Speech-to-Text (Whisper da OpenAI) para converter a voz em texto.
   - **Geração do Laudo:** Envia o texto transcrito para um modelo de linguagem (LLM, como GPT-4) com um *prompt* específico para extrair os dados e formatar um laudo clínico estruturado (Identificação, Queixa Principal, História Clínica, Conduta).
5. **Visualização do Relatório:** O frontend consulta periodicamente ou recebe a notificação de que o processamento terminou e exibe o laudo finalizado para revisão do médico.

---

## 3. O Plano Geral

O plano geral é construir um **Produto Mínimo Viável (MVP) completo** que resolva a dor da digitação e preenchimento de prontuários. A arquitetura foi pensada de forma modular:
- O banco de dados armazena o histórico do paciente e das consultas.
- Os serviços de IA foram abstraídos (interfaces base e implementações) para que seja fácil trocar o provedor no futuro (ex: trocar OpenAI por LLaMA local).
- O frontend guia o usuário de forma intuitiva, separando as etapas de gravação, processamento e resultado.

---

## 4. Até Onde Já Foi Feito?

A estrutura central do projeto já está consolidada e muito madura. 

**No Backend (FastAPI):**
- Configuração do FastAPI com CORS e roteamento modular (`routers/`).
- Banco de dados SQLite configurado usando SQLAlchemy (ORM) com os modelos (`models/`) e repositórios de dados (`repositories/`) criados.
- Schemas (Pydantic) para validação de dados de entrada e saída.
- Endpoints completos de CRUD para Pacientes e Consultas.
- Endpoint de upload de arquivos de áudio implementado e salvando localmente.
- Serviço de Orquestração (`ConsultationService.process_consultation_data`) pronto, chamando os serviços de transcrição e relatório em sequência e atualizando o status no banco de dados.
- Estrutura dos serviços de IA (`transcription` e `report`) criadas utilizando os padrões Strategy/Interface (arquitetura limpa).

**No Frontend (Angular):**
- Projeto Angular 17+ em funcionamento com as dependências instaladas.
- Roteamento completo definido em `app.routes.ts`.
- Módulos/Componentes de páginas separados por contexto:
  - `patient-list`, `patient-form`, `patient-profile`
  - `consultation-start`, `consultation-recording`, `consultation-processing`, `consultation-report`
- Serviços HTTP (`patient.service.ts`) implementados para consumir a API (CRUD e upload de áudio).
- Modelos TypeScript (`patient.model.ts`, `consultation.model.ts`) alinhados com o backend.

---

## 5. O Que Falta Para Terminar?

O sistema já possui toda a "espinha dorsal" e fluxo criados. O que falta é primordialmente a ativação dos serviços externos e ajustes finos:

1. **Ativar as APIs de IA no Backend:**
   - Atualmente, os arquivos `whisper_service.py` e `llm_service.py` contêm o código real comentado e estão retornando *strings* *mockadas* (falsas) dizendo que a implementação está pronta.
   - **Ação:** É preciso instalar a biblioteca `openai` (`pip install openai`), descomentar o código e configurar uma variável de ambiente com a chave da API da OpenAI (`OPENAI_API_KEY`).
2. **Refinamento do Prompt (Opcional):** Validar se o prompt configurado no LLM está gerando o laudo exatamente no formato desejado com áudios reais de teste.
3. **Migração do Banco de Dados (Para Produção):** O backend atualmente usa SQLite (`sql_app.db`) e cria as tabelas via `Base.metadata.create_all`. Para um ambiente de produção real, é recomendado configurar o Alembic (migrações) e um banco como PostgreSQL.
4. **Tratamento de Erros e Feedback de UI:** Garantir que, se a chamada à API da OpenAI demorar ou falhar, o frontend lide bem com isso (exibir spinners de carregamento bonitos, mensagens de erro claras).

---

## 6. Com O Que Tem, Já Atende o Mercado Pretendido?

**No estado exato de hoje (com as IAs "mockadas"):** Ainda não atende o mercado de forma prática, pois o médico não receberá um laudo real do áudio gravado, mas sim uma mensagem de teste. Serve apenas como uma demonstração (Mock/Protótipo de interface) para avaliação acadêmica de que as rotas e botões funcionam.

**Após descomentar o código e inserir a chave da API (5 minutos de trabalho):** **SIM, atende com excelência ao mercado pretendido (MVP).** O mercado de clínicas médicas de pequeno porte e consultórios particulares carece exatamente dessa automação simples e direta. O fato do sistema focar numa interface limpa (gravar -> receber laudo estruturado) resolve a principal dor do médico: o tempo gasto preenchendo prontuários.
