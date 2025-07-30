# RedFreelance/service-service/main.py

from fastapi import FastAPI, HTTPException, Depends, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

# Importar los módulos que acabamos de crear
from app import database, models, schemas, security

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

# Crear todas las tablas al inicio de la aplicación
@app.on_event("startup")
def on_startup():
    database.create_db_and_tables()

# --- Endpoints para Categorías (Admin Only) ---

@app.post("/categories/", response_model=schemas.Category, status_code=status.HTTP_201_CREATED)
async def create_category(
    category: schemas.CategoryCreate,
    db: Session = Depends(database.get_db),
    current_user: schemas.UserInToken = Depends(security.get_current_active_user_by_roles({"admin"}))
):
    """
    Crea una nueva categoría. Solo accesible para usuarios con rol 'admin'.
    """
    db_category = db.query(models.DBCategory).filter(models.DBCategory.name == category.name).first()
    if db_category:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Category with this name already exists")
    
    db_category = models.DBCategory(name=category.name)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@app.get("/categories/", response_model=List[schemas.Category])
async def read_categories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db)
):
    """
    Obtiene todas las categorías disponibles.
    """
    categories = db.query(models.DBCategory).offset(skip).limit(limit).all()
    return categories

@app.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    db: Session = Depends(database.get_db),
    current_user: schemas.UserInToken = Depends(security.get_current_active_user_by_roles({"admin"}))
):
    """
    Elimina una categoría por su ID. Solo accesible para usuarios con rol 'admin'.
    """
    db_category = db.query(models.DBCategory).filter(models.DBCategory.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    # Verificar si hay servicios asociados a esta categoría
    associated_services_count = db.query(models.DBService).join(models.service_category_association).filter(
        models.service_category_association.c.category_id == category_id
    ).count()

    if associated_services_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete category '{db_category.name}': {associated_services_count} service(s) are still associated with this category. Please reassign or delete them first."
        )

    db.delete(db_category)
    db.commit()
    return {"message": "Category deleted successfully"}

# --- Endpoints para Servicios ---

@app.post("/services/", response_model=schemas.Service, status_code=status.HTTP_201_CREATED)
async def create_service(
    service: schemas.ServiceCreate,
    db: Session = Depends(database.get_db),
    current_user: schemas.UserInToken = Depends(security.get_current_active_user_by_roles({"freelancer", "admin"}))
):
    """
    Crea un nuevo servicio. Solo accesible para usuarios con rol 'freelancer' o 'admin'.
    Ahora permite asignar múltiples categorías por ID.
    """
    # Verificar que todas las category_ids existen
    categories = []
    if service.category_ids:
        for cat_id in service.category_ids:
            category = db.query(models.DBCategory).filter(models.DBCategory.id == cat_id).first()
            if not category:
                raise HTTPException(status_code=404, detail=f"Category with ID {cat_id} not found")
            categories.append(category)

    db_service = models.DBService(
        title=service.title,
        description=service.description,
        price=service.price,
        owner_id=current_user.id # Usar owner_id del usuario actual
    )
    # Asignar las categorías al servicio
    db_service.categories.extend(categories)

    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    # Cargar las categorías para la respuesta
    db_service = db.query(models.DBService).options(joinedload(models.DBService.categories)).filter(models.DBService.id == db_service.id).first()
    return db_service

@app.get("/services/", response_model=List[schemas.Service])
async def get_all_services(
    db: Session = Depends(database.get_db),
    category_id: Optional[int] = Query(None, description="Filtrar servicios por ID de categoría"),
    search_query: Optional[str] = Query(None, description="Buscar servicios por título o descripción")
):
    """
    Obtiene todos los servicios disponibles.
    Ahora permite filtrar por una categoría específica o buscar por texto.
    """
    query = db.query(models.DBService).options(joinedload(models.DBService.categories))

    if category_id:
        # Filtrar servicios que tienen al menos una categoría con el ID especificado
        query = query.join(models.service_category_association).filter(
            models.service_category_association.c.category_id == category_id
        )

    if search_query:
        search_pattern = f"%{search_query}%"
        query = query.filter(
            (models.DBService.title.ilike(search_pattern)) |
            (models.DBService.description.ilike(search_pattern))
        )

    return query.all()

@app.get("/services/my/", response_model=List[schemas.Service])
async def get_my_services(
    db: Session = Depends(database.get_db),
    current_user: schemas.UserInToken = Depends(security.get_current_active_user_by_roles({"freelancer", "admin"}))
):
    """
    Obtiene los servicios creados por el usuario autenticado.
    """
    return db.query(models.DBService).options(joinedload(models.DBService.categories)).filter(
        models.DBService.owner_id == current_user.id
    ).all()

@app.get("/services/{service_id}", response_model=schemas.Service)
async def get_service_by_id(service_id: int, db: Session = Depends(database.get_db)):
    """
    Obtiene un servicio por su ID.
    """
    service = db.query(models.DBService).options(joinedload(models.DBService.categories)).filter(
        models.DBService.id == service_id
    ).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service

@app.put("/services/{service_id}", response_model=schemas.Service)
async def update_service(
    service_id: int,
    service_update: schemas.ServiceUpdate,
    db: Session = Depends(database.get_db),
    current_user: schemas.UserInToken = Depends(security.get_current_active_user_by_roles({"freelancer", "admin"}))
):
    """
    Actualiza un servicio existente. Solo accesible para el propietario del servicio o un 'admin'.
    Ahora permite actualizar las categorías asignadas.
    """
    db_service = db.query(models.DBService).options(joinedload(models.DBService.categories)).filter(
        models.DBService.id == service_id
    ).first()

    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")

    # Verificar si el usuario actual es el propietario del servicio o un administrador
    if db_service.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this service")

    # Actualizar campos básicos
    for key, value in service_update.dict(exclude_unset=True).items():
        if key != "category_ids": # Excluir category_ids para manejarlo por separado
            setattr(db_service, key, value)

    # Actualizar categorías si se proporcionan
    if service_update.category_ids is not None:
        new_categories = []
        for cat_id in service_update.category_ids:
            category = db.query(models.DBCategory).filter(models.DBCategory.id == cat_id).first()
            if not category:
                raise HTTPException(status_code=404, detail=f"Category with ID {cat_id} not found")
            new_categories.append(category)
        db_service.categories = new_categories # Reemplazar todas las categorías existentes

    db.commit()
    db.refresh(db_service)
    return db_service

@app.delete("/services/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(
    service_id: int,
    db: Session = Depends(database.get_db),
    current_user: schemas.UserInToken = Depends(security.get_current_active_user_by_roles({"freelancer", "admin"}))
):
    """
    Elimina un servicio. Solo accesible para el propietario del servicio o un 'admin'.
    """
    db_service = db.query(models.DBService).filter(models.DBService.id == service_id).first()
    if not db_service:
        raise HTTPException(status_code=404, detail="Service not found")

    # Verificar si el usuario actual es el propietario del servicio o un administrador
    if db_service.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this service")

    db.delete(db_service)
    db.commit()
    return

# --- Modified Endpoint: Get categories with sample services for landing page ---
@app.get("/landing-categories/", response_model=List[schemas.CategoryWithServices])
async def get_landing_categories(db: Session = Depends(database.get_db)):
    all_categories = db.query(models.DBCategory).all()
    
    result = []
    for db_category in all_categories:
        category_name = db_category.name
        # Cargar servicios con sus categorías para la respuesta
        sample_services = db.query(models.DBService).options(joinedload(models.DBService.categories)).filter(
            models.DBService.categories.any(models.DBCategory.name == category_name) # Filtrar por servicios que tienen esta categoría
        ).order_by(models.DBService.id.desc()).limit(3).all()
        
        result.append(schemas.CategoryWithServices(category=category_name, sample_services=sample_services))
    
    return result
