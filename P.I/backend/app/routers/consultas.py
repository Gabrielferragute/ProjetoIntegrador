from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/consultas",
    tags=["Consultas"]
)

@router.get("/", response_model=List[schemas.ConsultaResponse])
def read_consultas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Funcionalidade base: buscar consultas
    consultas = db.query(models.Consulta).offset(skip).limit(limit).all()
    return consultas

@router.post("/", response_model=schemas.ConsultaResponse)
def create_consulta(consulta: schemas.ConsultaCreate, db: Session = Depends(get_db)):
    # Aqui entraria a lógica de criação
    pass
