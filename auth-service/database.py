# RedFreelance/auth-service/database.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# URL de la base de datos SQLite
# sqlite:///./auth.db significa que la base de datos se creará en un archivo llamado auth.db
# en el mismo directorio donde se ejecute la aplicación (/app dentro del contenedor).
SQLALCHEMY_DATABASE_URL = "sqlite:///./auth.db"

# create_engine crea una instancia de Engine que permite a SQLAlchemy interactuar con la base de datos.
# connect_args={"check_same_thread": False} es necesario para SQLite cuando se usa con FastAPI,
# ya que SQLite por defecto solo permite que un hilo interactúe con él.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
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