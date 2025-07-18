# RedFreelance/auth-service/database.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os # Importar el módulo os para acceder a variables de entorno
from dotenv import load_dotenv # Importar load_dotenv para cargar variables de entorno

# Cargar variables de entorno desde el archivo .env
load_dotenv()

# Obtener la URL de la base de datos desde las variables de entorno
# Ahora apuntará a PostgreSQL según la configuración en .env
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# create_engine crea una instancia de Engine que permite a SQLAlchemy interactuar con la base de datos.
# Eliminamos connect_args={"check_same_thread": False} porque es específico de SQLite y no es válido para PostgreSQL.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL
)

# sessionmaker crea una clase Session local. Cada instancia de Session será una sesión de base de datos.
# autoflush=False significa que los objetos no se sincronizarán inmediatamente con la BD después de cada cambio.
# autocommit=False significa que no se guardarán los cambios automáticamente. Necesitamos un commit explícito.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# declarative_base devuelve una clase base para modelos de datos declarativos.
# Cada modelo de SQLAlchemy que creemos heredará de esta clase.
Base = declarative_base()

# Función de utilidad para obtener una sesión de base de datos (dependencia para FastAPI)
# Usaremos esto en nuestros endpoints para abrir y cerrar sesiones de manera segura.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
