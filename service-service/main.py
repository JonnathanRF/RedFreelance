# RedFreelance/service-service/main.py
from fastapi import FastAPI, HTTPException, Depends, status, Header, Query
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, func
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

class DBCategory(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)

    services = relationship("DBService", back_populates="category_rel", primaryjoin="DBCategory.name == DBService.category")

class DBService(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    category = Column(String, ForeignKey('categories.name'), index=True)
    freelancer_id = Column(Integer, index=True)

    category_rel = relationship("DBCategory", back_populates="services", primaryjoin="DBCategory.name == DBService.category")

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

class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
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
    is_active: bool = True

# Schema for landing page response
class CategoryWithServices(BaseModel):
    category: str
    sample_services: List[Service] = []

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
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Service Microservice!"}

# --- Endpoints for Services ---

@app.post("/services/", response_model=Service, status_code=status.HTTP_201_CREATED)
async def create_service(
    service: ServiceCreate,
    current_freelancer: UserInToken = Depends(get_current_freelancer),
    db: Session = Depends(get_db)
):
    existing_category = db.query(DBCategory).filter(DBCategory.name == service.category).first()
    if not existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category '{service.category}' does not exist. Please create it first or choose an existing one."
        )

    db_service = DBService(**service.model_dump(), freelancer_id=current_freelancer.id)
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

@app.get("/services/", response_model=List[Service])
async def read_services(
    freelancer_id: Optional[int] = Query(None, description="Filtrar servicios por ID de freelancer"),
    category: Optional[str] = Query(None, description="Filtrar servicios por categoría"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(DBService)
    if freelancer_id is not None:
        query = query.filter(DBService.freelancer_id == freelancer_id)
    # CORRECCIÓN: Asegurarse de que 'category' sea un string o None, no un objeto Query
    if category is not None:
        query = query.filter(DBService.category == category)
    services = query.offset(skip).limit(limit).all()
    return services

@app.get("/services/my/", response_model=List[Service])
async def read_my_services(
    current_freelancer: UserInToken = Depends(get_current_freelancer),
    db: Session = Depends(get_db)
):
    # CORRECCIÓN: Asegurarse de que el parámetro 'category' no se pase si no es necesario,
    # o que se pase como None explícitamente si no hay filtro de categoría.
    # En este caso, read_my_services solo filtra por freelancer_id.
    return await read_services(freelancer_id=current_freelancer.id, category=None, db=db)


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
    
    if service_update.category is not None and service_update.category != service.category:
        existing_category = db.query(DBCategory).filter(DBCategory.name == service_update.category).first()
        if not existing_category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category '{service_update.category}' does not exist. Please choose an existing one."
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

# --- Endpoints for Category Management (Admin Only) ---

@app.post("/categories/", response_model=Category, status_code=status.HTTP_201_CREATED)
async def create_category(
    category: CategoryCreate,
    current_admin: UserInToken = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    existing_category = db.query(DBCategory).filter(DBCategory.name == category.name).first()
    if existing_category:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Category with this name already exists")
    
    db_category = DBCategory(name=category.name)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@app.get("/categories/", response_model=List[Category])
async def read_categories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    categories = db.query(DBCategory).offset(skip).limit(limit).all()
    return categories

@app.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    current_admin: UserInToken = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    category = db.query(DBCategory).filter(DBCategory.id == category_id).first()
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    db.delete(category)
    db.commit()
    return {"message": "Category deleted successfully"}

# --- Modified Endpoint: Get categories with sample services for landing page ---
@app.get("/landing-categories/", response_model=List[CategoryWithServices])
async def get_landing_categories(db: Session = Depends(get_db)):
    all_categories = db.query(DBCategory).all()
    
    result = []
    for db_category in all_categories:
        category_name = db_category.name
        sample_services = db.query(DBService).filter(DBService.category == category_name).order_by(DBService.id.desc()).limit(3).all()
        result.append(CategoryWithServices(category=category_name, sample_services=sample_services))
    
    return result
