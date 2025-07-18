# RedFreelance/service-service/main.py
from fastapi import FastAPI, HTTPException, Depends, status
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv # Import load_dotenv to load environment variables

# Load environment variables
load_dotenv()

# Get the database URL from environment variables
# This will now point to PostgreSQL as configured in .env
DATABASE_URL = os.getenv("DATABASE_URL")

Base = declarative_base()

# --- Database Models (SQLAlchemy) ---
class DBService(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    category = Column(String, index=True)
    freelancer_id = Column(Integer, index=True) # ID of the freelancer offering the service

# --- Pydantic Schemas (for input/output validation) ---
class ServiceBase(BaseModel):
    title: str
    description: str
    price: float
    category: str

class ServiceCreate(ServiceBase):
    pass # No additional fields for creation apart from base

class ServiceUpdate(ServiceBase):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None

class Service(ServiceBase):
    id: int
    freelancer_id: int # Ensure this field is included in the response
    class Config:
        from_attributes = True # Or from_orm = True in Pydantic v1.x

# --- Database Configuration ---
# Remove connect_args={"check_same_thread": False} because it's SQLite specific and not valid for PostgreSQL.
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create database tables
# This will create the tables in PostgreSQL if they do not exist
Base.metadata.create_all(bind=engine)

# Dependency to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- FastAPI Application ---
app = FastAPI(title="Service Microservice", version="1.0.0")

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Service Microservice!"}

# --- Endpoints ---

# Endpoint to create a service
@app.post("/services/", response_model=Service, status_code=status.HTTP_201_CREATED)
async def create_service(service: ServiceCreate, db: Session = Depends(get_db)):
    # TODO: Integrate with Auth Service to get the authenticated freelancer ID.
    # For now, we will use a test freelancer ID.
    # The real logic should get the 'user_id' from the JWT token.
    fake_freelancer_id = 1

    db_service = DBService(**service.model_dump(), freelancer_id=fake_freelancer_id)
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

# Endpoint to list all services
@app.get("/services/", response_model=List[Service])
async def read_services(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    services = db.query(DBService).offset(skip).limit(limit).all()
    return services

# Endpoint to get a service by ID
@app.get("/services/{service_id}", response_model=Service)
async def read_service(service_id: int, db: Session = Depends(get_db)):
    service = db.query(DBService).filter(DBService.id == service_id).first()
    if service is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    return service

# --- NEW: Endpoint to update a service ---
@app.put("/services/{service_id}", response_model=Service)
async def update_service(
    service_id: int,
    service_update: ServiceUpdate,
    db: Session = Depends(get_db)
):
    service = db.query(DBService).filter(DBService.id == service_id).first()
    if service is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")

    # TODO: Implement authorization. Only the owning freelancer or an admin should be able to update.
    # current_user_id = get_authenticated_user_id()
    # if service.freelancer_id != current_user_id and current_user_role != "admin":
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this service")

    # Update service fields
    for key, value in service_update.model_dump(exclude_unset=True).items():
        setattr(service, key, value)

    db.add(service) # Add to session so SQLAlchemy detects changes
    db.commit()
    db.refresh(service)
    return service

# --- NEW: Endpoint to delete a service ---
@app.delete("/services/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(service_id: int, db: Session = Depends(get_db)):
    service = db.query(DBService).filter(DBService.id == service_id).first()
    if service is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")

    # TODO: Implement authorization. Only the owning freelancer or an admin should be able to delete.
    # current_user_id = get_authenticated_user_id()
    # if service.freelancer_id != current_user_id and current_user_role != "admin":
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this service")

    db.delete(service)
    db.commit()
    return {"message": "Service deleted successfully"} # FastAPI will return 204 No Content
