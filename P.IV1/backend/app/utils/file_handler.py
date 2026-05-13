import os
import shutil
from datetime import datetime
from fastapi import UploadFile, HTTPException, status

UPLOAD_DIR = "uploads/audios"
ALLOWED_EXTENSIONS = {"wav", "mp3", "m4a", "ogg", "webm"}

os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_upload_file(file: UploadFile, prefix: str = "file") -> str:
    """
    Valida e salva um arquivo de upload localmente.
    Retorna o caminho relativo do arquivo salvo.
    """
    # Verifica a extensão do arquivo
    file_extension = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Formato de arquivo não suportado. Formatos permitidos: {', '.join(ALLOWED_EXTENSIONS)}"
        )
        
    # Gera um nome de arquivo único
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{prefix}_{timestamp}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, filename).replace("\\", "/")
    
    # Salva o arquivo fisicamente
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return file_path
