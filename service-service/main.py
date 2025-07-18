# RedFreelance/service-service/main.py
from fastapi import FastAPI, HTTPException, Depends, status
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel
from typing import List, Optional
import os

# Cargar variables de entorno
from dotenv import load_dotenv
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./services.db")

Base = declarative_base()

# --- Modelos de Base de Datos (SQLAlchemy) ---
class DBService(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    category = Column(String, index=True)
    freelancer_id = Column(Integer, index=True) # ID del freelancer que ofrece el servicio

# --- Esquemas Pydantic (para validación de entrada/salida) ---
class ServiceBase(BaseModel):
    title: str
    description: str
    price: float
    category: str

class ServiceCreate(ServiceBase):
    pass # No hay campos adicionales para la creación aparte de los base

class ServiceUpdate(ServiceBase):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None

class Service(ServiceBase):
    id: int
    freelancer_id: int # Asegurarnos que este campo se incluya en la respuesta
    class Config:
        from_attributes = True # O from_orm = True en Pydantic v1.x

# --- Configuración de la Base de Datos ---
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Crear tablas de la base de datos
Base.metadata.create_all(bind=engine)

# Dependencia para obtener la sesión de la base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Aplicación FastAPI ---
app = FastAPI(title="Service Microservice", version="1.0.0")

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Service Microservice!"}

# --- Endpoints ---

# Endpoint para crear un servicio
@app.post("/services/", response_model=Service, status_code=status.HTTP_201_CREATED)
async def create_service(service: ServiceCreate, db: Session = Depends(get_db)):
    # TODO: Integrar con Auth Service para obtener el ID del freelancer autenticado.
    # Por ahora, usaremos un ID de freelancer de prueba.
    # La lógica real debería obtener el 'user_id' del token JWT.
    fake_freelancer_id = 1 

    db_service = DBService(**service.model_dump(), freelancer_id=fake_freelancer_id)
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

# Endpoint para listar todos los servicios
@app.get("/services/", response_model=List[Service])
async def read_services(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    services = db.query(DBService).offset(skip).limit(limit).all()
    return services

# Endpoint para obtener un servicio por ID
@app.get("/services/{service_id}", response_model=Service)
async def read_service(service_id: int, db: Session = Depends(get_db)):
    service = db.query(DBService).filter(DBService.id == service_id).first()
    if service is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    return service

# --- NUEVO: Endpoint para actualizar un servicio ---
@app.put("/services/{service_id}", response_model=Service)
async def update_service(
    service_id: int, 
    service_update: ServiceUpdate, 
    db: Session = Depends(get_db)
):
    service = db.query(DBService).filter(DBService.id == service_id).first()
    if service is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    
    # TODO: Implementar autorización. Solo el freelancer propietario o un admin debería poder actualizar.
    # current_user_id = obtener_id_del_usuario_autenticado()
    # if service.freelancer_id != current_user_id and current_user_role != "admin":
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this service")

    # Actualizar los campos del servicio
    for key, value in service_update.model_dump(exclude_unset=True).items():
        setattr(service, key, value)
    
    db.add(service) # Añadir a la sesión para que SQLAlchemy detecte los cambios
    db.commit()
    db.refresh(service)
    return service

# --- NUEVO: Endpoint para eliminar un servicio ---
@app.delete("/services/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(service_id: int, db: Session = Depends(get_db)):
    service = db.query(DBService).filter(DBService.id == service_id).first()
    if service is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    
    # TODO: Implementar autorización. Solo el freelancer propietario o un admin debería poder eliminar.
    # current_user_id = obtener_id_del_usuario_autenticado()
    # if service.freelancer_id != current_user_id and current_user_role != "admin":
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this service")

    db.delete(service)
    db.commit()
    return {"message": "Service deleted successfully"} # FastAPI devolverá 204 No Content
