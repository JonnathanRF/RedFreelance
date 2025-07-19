# RedFreelance/auth-service/security.py

from datetime import datetime, timedelta, timezone
from typing import Optional, Union

from jose import JWTError, jwt
from passlib.context import CryptContext

from sqlalchemy.orm import Session
import models

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import schemas
from database import get_db


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Clave secreta y algoritmo para JWT
# ¡IMPORTANTE!: En un entorno de producción, esta clave DEBE ser una variable de entorno segura.
SECRET_KEY = "9fKK38TLROXvkgZ_BLUweAYe40TXyYm5J55txx21MXc" # ¡TU NUEVA CLAVE SECRETA!
ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def authenticate_user(db: Session, email: str, password: str):
    user = get_user(db, email=email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        # Asegúrate de obtener el 'user_id' del payload si lo estás incluyendo al crear el token
        user_id: Optional[int] = payload.get("user_id")
        user_role: Optional[str] = payload.get("role")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=username, role=user_role, user_id=user_id)
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_active_user_by_role(required_roles: Union[str, list[str]]):
    if isinstance(required_roles, str):
        required_roles = [required_roles]

    async def _get_current_active_user_by_role(
        current_user: schemas.UserOut = Depends(get_current_user)
    ):
        if current_user.role == schemas.Role.admin:
            return current_user

        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"No tienes permiso para acceder a este recurso. Requiere uno de los roles: {', '.join(required_roles)}"
            )
        return current_user
    return _get_current_active_user_by_role
