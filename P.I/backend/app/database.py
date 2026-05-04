from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

# Troque "postgres:password" e "localhost" pelas suas credenciais do PostgreSQL
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:password@localhost/prontuario_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
