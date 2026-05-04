import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routers import patient, consultation
from app.database import engine, Base

# Cria as tabelas do banco de dados (Apenas para ambiente de desenvolvimento)
# Em produção, o ideal é usar o Alembic para migrações
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sistema de Gerenciamento de Pacientes",
    description="API para gerenciamento de pacientes com consultas por áudio e IA",
    version="1.0.0" # Atualizando para 1.0.0 (Pronto para TCC)
)

# Configuração de CORS para permitir requisições do Angular (geralmente localhost:4200)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Em produção, pode restringir para ["http://localhost:4200"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Criar pasta de uploads se não existir e expor como rota estática para o frontend tocar o áudio
os.makedirs("uploads/audios", exist_ok=True)
app.mount("/audios", StaticFiles(directory="uploads/audios"), name="audios")

# Incluindo os roteadores
app.include_router(patient.router)
app.include_router(consultation.router)

@app.get("/")
def root():
    return {"message": "Bem-vindo à API do Sistema de Gerenciamento de Pacientes"}
