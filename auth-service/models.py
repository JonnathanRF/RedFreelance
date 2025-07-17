# RedFreelance/auth-service/models.py

from sqlalchemy import Column, Integer, String, Boolean
from database import Base # Importa la clase Base que definimos en database.py

class User(Base):
    """
    Modelo de la tabla de usuarios en la base de datos.
    Representa a los usuarios de la plataforma, que pueden ser clientes o freelancers.
    """
    __tablename__ = "users" # Nombre de la tabla en la base de datos

    id = Column(Integer, primary_key=True, index=True) # Clave primaria, autoincremental
    email = Column(String, unique=True, index=True, nullable=False) # Correo electrónico, debe ser único y no nulo
    hashed_password = Column(String, nullable=False) # Contraseña hasheada (nunca guardar contraseñas en texto plano)
    is_active = Column(Boolean, default=True) # Indica si la cuenta está activa
    role = Column(String, nullable=False) # Rol del usuario: 'client' o 'freelancer'