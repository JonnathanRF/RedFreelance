# RedFreelance/auth-service/schemas.py

from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum # Importamos Enum

# --- Clase para definir los Roles permitidos ---
class Role(str, Enum):
    client = "client"
    freelancer = "freelancer"
    admin = "admin" # Ahora 'admin' es un rol válido y reconocido por el backend
# --- Fin Clase Role ---


class UserBase(BaseModel):
    email: EmailStr # Usa EmailStr para validación de formato de correo
    role: Role      # Usamos el Enum 'Role' para validar que el rol sea uno de los definidos


class UserCreate(UserBase):
    password: str   # La contraseña sin hashear al momento del registro


class UserInDBBase(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True # Permite que Pydantic lea los datos del modelo ORM de SQLAlchemy


class UserInDB(UserInDBBase):
    hashed_password: str # Incluye la contraseña hasheada (solo para uso interno del backend)


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[Role] = None # Usamos el Enum 'Role' para el rol en el token, puede ser opcional

# Clase que define cómo se presenta la información del usuario al cliente (sin la contraseña hasheada)
class UserOut(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True