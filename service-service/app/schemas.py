# RedFreelance/service-service/app/schemas.py

from pydantic import BaseModel
from typing import List, Optional

class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    class Config:
        from_attributes = True

class ServiceBase(BaseModel):
    title: str
    description: str
    price: float

class ServiceCreate(ServiceBase):
    category_ids: List[int] # Ahora espera una lista de IDs de categorías

class ServiceUpdate(ServiceBase):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category_ids: Optional[List[int]] = None # Opcional: lista de IDs para actualizar

class Service(ServiceBase):
    id: int
    owner_id: int # Cambiado de freelancer_id a owner_id
    categories: List[Category] = [] # Ahora devuelve una lista de objetos Category

    class Config:
        from_attributes = True

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    user_id: Optional[int] = None

class UserInToken(BaseModel): # Este esquema viene del auth-service
    id: int
    email: str
    role: str
    is_active: bool = True # Asumimos que el usuario está activo si tiene token

# Schema for landing page response
class CategoryWithServices(BaseModel):
    category: str
    sample_services: List[Service] = []
