# RedFreelance/auth-service/security.py

from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from sqlalchemy.orm import Session
import models

# --- NUEVAS IMPORTACIONES AÑADIDAS ---
from fastapi import Depends, HTTPException, status # Importaciones necesarias para dependencias y manejo de errores
from fastapi.security import OAuth2PasswordBearer # Para el esquema de seguridad OAuth2
import schemas # Para usar los modelos Pydantic de esquemas (ej. TokenData)
from database import get_db # Para obtener la sesión de la base de datos dentro de get_current_user


# Configuración para hashing de contraseñas
# Usamos bcrypt, un algoritmo de hashing recomendado para contraseñas.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Clave secreta y algoritmo para JWT
# ¡IMPORTANTE!: En un entorno de producción, esta clave DEBE ser una variable de entorno segura.
SECRET_KEY = "tu_super_secreto_jwt_seguro_y_largo" # ¡Cámbialo por una cadena aleatoria y compleja!
ALGORITHM = "HS256" # Algoritmo de hashing para JWT

# Tiempo de expiración del token de acceso (en minutos)
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# --- Esquema de seguridad OAuth2 ---
# "token" es la URL de tu endpoint de login que devuelve el token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- Funciones de Hashing de Contraseñas ---

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si una contraseña en texto plano coincide con una contraseña hasheada."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hashea una contraseña en texto plano."""
    return pwd_context.hash(password)

# --- Funciones de JWT ---

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Crea un token de acceso JWT.
    data: Diccionario con la información a incluir en el token (ej. {"sub": "email", "role": "client"})
    expires_delta: Tiempo de vida del token. Si no se provee, usa ACCESS_TOKEN_EXPIRE_MINUTES.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire}) # Agrega la fecha de expiración al payload
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- Funciones de Autenticación de Usuarios ---

def get_user(db: Session, email: str):
    """Obtiene un usuario de la base de datos por su email."""
    return db.query(models.User).filter(models.User.email == email).first()

def authenticate_user(db: Session, email: str, password: str):
    """
    Autentica un usuario verificando su email y contraseña.
    Retorna el objeto User si las credenciales son válidas, de lo contrario None.
    """
    user = get_user(db, email=email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

# --- NUEVA FUNCIÓN AÑADIDA: Obtener el usuario actual a partir del token ---
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Decodifica el token JWT del encabezado de autorización, valida las credenciales
    y devuelve el objeto de usuario correspondiente de la base de datos.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub") # 'sub' (subject) es donde guardamos el email del usuario
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=username) # Usamos el modelo TokenData para la validación
    except JWTError:
        raise credentials_exception

    # Busca al usuario en la base de datos
    user = db.query(models.User).filter(models.User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user

# --- NUEVA FUNCIÓN AÑADIDA: Dependencia para verificar roles ---
def get_current_active_user_by_role(required_roles: list[str]):
    """
    Dependencia de FastAPI para verificar si el usuario autenticado
    tiene uno de los roles requeridos.
    """
    async def _get_current_active_user_by_role(
        current_user: schemas.UserOut = Depends(get_current_user)
    ):
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para acceder a este recurso."
            )
        return current_user
    return _get_current_active_user_by_role