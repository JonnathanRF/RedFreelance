# RedFreelance/auth-service/security.py

from datetime import datetime, timedelta, timezone
from typing import Optional, Union # <--- AÑADIDA 'Union' aquí

from jose import JWTError, jwt
from passlib.context import CryptContext

from sqlalchemy.orm import Session
import models

# --- NUEVAS IMPORTACIONES AÑADIDAS ---
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import schemas
from database import get_db


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

# --- Obtener el usuario actual a partir del token ---
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
        # Asegúrate de obtener el 'role' del payload para pasarlo a TokenData
        user_role: Optional[str] = payload.get("role")
        token_data = schemas.TokenData(email=username, role=user_role) # Pasa el rol a TokenData
    except JWTError:
        raise credentials_exception

    # Busca al usuario en la base de datos
    user = db.query(models.User).filter(models.User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    # Agrega la verificación de inactividad si aplica aquí, o en la función de rol
    # if not user.is_active:
    #     raise HTTPException(status_code=400, detail="Usuario inactivo")
    return user


# --- FUNCIÓN MODIFICADA: Dependencia para verificar roles (con admin como superusuario) ---
def get_current_active_user_by_role(required_roles: Union[str, list[str]]): # <--- Tipo de 'required_roles' modificado
    """
    Dependencia de FastAPI para verificar si el usuario autenticado
    tiene uno de los roles requeridos. Los usuarios 'admin' tienen acceso
    a todas las rutas protegidas por esta dependencia.
    """
    # Aseguramos que required_roles sea siempre una lista para consistencia
    if isinstance(required_roles, str):
        required_roles = [required_roles]

    async def _get_current_active_user_by_role(
        current_user: schemas.UserOut = Depends(get_current_user)
    ):
        # Lógica para que el rol 'admin' tenga acceso a todas las rutas
        # que usen esta dependencia.
        if current_user.role == schemas.Role.admin: # <--- Usamos el Enum para comparar 'admin'
            return current_user # Si es admin, le damos acceso inmediatamente.

        # Si no es admin, entonces verificamos si su rol está en los requeridos
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"No tienes permiso para acceder a este recurso. Requiere uno de los roles: {', '.join(required_roles)}" # Mensaje de error mejorado
            )
        return current_user
    return _get_current_active_user_by_role