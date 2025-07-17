# RedFreelance/auth-service/schemas.py

from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr # Usa EmailStr para validación de formato de correo
    role: str # 'client' o 'freelancer'

class UserCreate(UserBase):
    password: str # La contraseña sin hashear al momento del registro

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
    role: Optional[str] = None

class UserOut(UserBase): # <-- Esta es la clase que faltaba
    id: int
    is_active: bool

    class Config:
        from_attributes = True