from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/pacientes",
    tags=["Pacientes"]
)

@router.get("/", response_model=List[schemas.PacienteResponse])
def read_pacientes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Funcionalidade base: buscar pacientes
    pacientes = db.query(models.Paciente).offset(skip).limit(limit).all()
    return pacientes

@router.post("/", response_model=schemas.PacienteResponse)
def create_paciente(paciente: schemas.PacienteCreate, db: Session = Depends(get_db)):
    # Aqui entraria a lógica de criação
    pass
