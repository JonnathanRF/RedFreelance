# RedFreelance/service-service/app/security.py

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from typing import Set
import os # ¡IMPORTAR OS AQUÍ!

from . import schemas # Importar schemas para UserInToken
from dotenv import load_dotenv # También necesitamos cargar las variables de entorno aquí

load_dotenv() # Cargar variables de entorno para este módulo

# Configuración de JWT (¡Usar una clave secreta fuerte y segura en producción!)
# Estas variables deben venir de .env o ser consistentes con auth-service
SECRET_KEY = os.getenv("SECRET_KEY") # Obtener SECRET_KEY del .env
ALGORITHM = os.getenv("ALGORITHM", "HS256") # Obtener ALGORITHM del .env

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://auth-service:8000/token") # Apunta al auth-service

async def get_current_user(token: str = Depends(oauth2_scheme)) -> schemas.UserInToken:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user_id: int = payload.get("user_id")
        user_role: str = payload.get("role")
        if email is None or user_id is None or user_role is None:
            raise credentials_exception
        # Directamente devolver UserInToken desde el payload del JWT
        return schemas.UserInToken(id=user_id, email=email, role=user_role, is_active=True)
    except JWTError:
        raise credentials_exception

# FUNCIÓN DE DEPENDENCIA PARA ROLES MÚLTIPLES
def get_current_active_user_by_roles(required_roles: Set[str]):
    async def _get_current_active_user_by_roles(current_user: schemas.UserInToken = Depends(get_current_user)):
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Not authorized: User role '{current_user.role}' is not in allowed roles: {', '.join(required_roles)}"
            )
        return current_user
    return _get_current_active_user_by_roles
