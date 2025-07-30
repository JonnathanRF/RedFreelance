# RedFreelance/service-service/app/database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os
from dotenv import load_dotenv

load_dotenv() # Cargar variables de entorno

DATABASE_URL = os.getenv("DATABASE_URL")

# Configuración de la base de datos para PostgreSQL (usando Docker Compose)
# Si usas SQLite directamente, descomenta la línea de SQLite y ajusta el engine
engine = create_engine(DATABASE_URL)

# Crear una sesión de base de datos
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para los modelos declarativos de SQLAlchemy
Base = declarative_base()

# Función de utilidad para obtener una sesión de base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Función para crear todas las tablas (se llamará desde main.py)
def create_db_and_tables():
    Base.metadata.create_all(bind=engine)
