from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine
from .routers import pacientes, consultas

# Cria as tabelas do banco de dados
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Prontuário Médico Inteligente API",
    description="API para gerenciamento de pacientes e consultas",
    version="1.0.0"
)

# Configuração de CORS para permitir requisições do frontend Angular
origins = [
    "http://localhost:4200",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusão das rotas
app.include_router(pacientes.router)
app.include_router(consultas.router)

@app.get("/")
def root():
    return {"message": "Bem-vindo à API do Prontuário Médico Inteligente"}
