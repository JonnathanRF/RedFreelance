# RedFreelance/service-service/main.py
from fastapi import FastAPI, HTTPException, Depends, status, Header, Query
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, func # <--- ASEGÚRATE DE QUE 'func' ESTÁ AQUÍ
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from jose import JWTError, jwt
from datetime import datetime, timedelta

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# --- JWT Configuration (Must match auth-service) ---
SECRET_KEY = os.getenv("SECRET_KEY") # Get SECRET_KEY from .env
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# OAuth2 scheme for token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://auth-service:8000/token")

# --- Database Models (SQLAlchemy) ---
Base = declarative_base()

class DBService(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    category = Column(String, index=True)
    freelancer_id = Column(Integer, index=True)

# --- Pydantic Schemas (for input/output validation) ---
class ServiceBase(BaseModel):
    title: str
    description: str
    price: float
    category: str

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(ServiceBase):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None

class Service(ServiceBase):
    id: int
    freelancer_id: int
    class Config:
        from_attributes = True

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    user_id: Optional[int] = None

class UserInToken(BaseModel):
    id: int
    email: str
    role: str
    is_active: bool = True # Asumiendo que siempre está activo si el token es válido

# NUEVO ESQUEMA: Para la respuesta del endpoint de landing page <--- ESTO DEBE ESTAR
class CategoryWithServices(BaseModel):
    category: str
    sample_services: List[Service] = [] # Una lista de servicios de ejemplo para esa categoría

# --- Database Configuration ---
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Security Functions for the Service Service ---
async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserInToken:
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
        token_data = TokenData(email=email, role=user_role, user_id=user_id)
    except JWTError:
        raise credentials_exception
    
    return UserInToken(id=token_data.user_id, email=token_data.email, role=token_data.role)

async def get_current_freelancer(current_user: UserInToken = Depends(get_current_user)):
    if current_user.role != "freelancer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized: Only freelancers can perform this action"
        )
    return current_user

async def get_current_admin(current_user: UserInToken = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized: Only administrators can perform this action"
        )
    return current_user

# --- FastAPI Application ---
app = FastAPI(title="Service Microservice", version="1.0.0")

# Configuración de CORS para permitir peticiones desde el frontend
origins = [
    "http://localhost",
    "http://localhost:3000", # Tu frontend
    "http://127.0.0.1",
    "http://127.0.0.1:3000", # Por si acaso
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Permite todos los métodos (GET, POST, PUT, DELETE, OPTIONS)
    allow_headers=["*"], # Permite todos los encabezados
)

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Service Microservice!"}

# --- Endpoints ---

@app.post("/services/", response_model=Service, status_code=status.HTTP_201_CREATED)
async def create_service(
    service: ServiceCreate,
    current_freelancer: UserInToken = Depends(get_current_freelancer),
    db: Session = Depends(get_db)
):
    db_service = DBService(**service.model_dump(), freelancer_id=current_freelancer.id)
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

@app.get("/services/", response_model=List[Service])
async def read_services(
    freelancer_id: Optional[int] = Query(None, description="Filtrar servicios por ID de freelancer"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(DBService)
    if freelancer_id is not None:
        query = query.filter(DBService.freelancer_id == freelancer_id)
    services = query.offset(skip).limit(limit).all()
    return services

@app.get("/services/my/", response_model=List[Service])
async def read_my_services(
    current_freelancer: UserInToken = Depends(get_current_freelancer),
    db: Session = Depends(get_db)
):
    return await read_services(freelancer_id=current_freelancer.id, db=db)


@app.get("/services/{service_id}", response_model=Service)
async def read_service(service_id: int, db: Session = Depends(get_db)):
    service = db.query(DBService).filter(DBService.id == service_id).first()
    if service is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Servicio no encontrado")
    return service

@app.put("/services/{service_id}", response_model=Service)
async def update_service(
    service_id: int,
    service_update: ServiceUpdate,
    current_user: UserInToken = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = db.query(DBService).filter(DBService.id == service_id).first()
    if service is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Servicio no encontrado")

    if service.freelancer_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this service"
        )

    for key, value in service_update.model_dump(exclude_unset=True).items():
        setattr(service, key, value)

    db.add(service)
    db.commit()
    db.refresh(service)
    return service

@app.delete("/services/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(
    service_id: int,
    current_user: UserInToken = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = db.query(DBService).filter(DBService.id == service_id).first()
    if service is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Servicio no encontrado")

    if service.freelancer_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this service"
        )

    db.delete(service)
    db.commit()
    return {"message": "Service deleted successfully"}

# NUEVO ENDPOINT: Obtener categorías con servicios de ejemplo para la landing page <--- ESTO DEBE ESTAR
@app.get("/landing-categories/", response_model=List[CategoryWithServices])
async def get_landing_categories(db: Session = Depends(get_db)):
    # Obtener todas las categorías únicas que tienen servicios
    categories_with_services = db.query(DBService.category).distinct().all()
    
    result = []
    for category_tuple in categories_with_services:
        category_name = category_tuple[0]
        # Obtener hasta 3 servicios de ejemplo para cada categoría
        # Ordenar por ID descendente para obtener los más recientes o simplemente un orden consistente
        sample_services = db.query(DBService).filter(DBService.category == category_name).order_by(DBService.id.desc()).limit(3).all()
        result.append(CategoryWithServices(category=category_name, sample_services=sample_services))
    
    return result
