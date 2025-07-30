# RedFreelance/service-service/app/models.py

from sqlalchemy import Column, Integer, String, Float, ForeignKey, Table
from sqlalchemy.orm import relationship
from .database import Base # Importar Base desde database.py

# Tabla de asociación para la relación muchos a muchos entre Service y Category
service_category_association = Table(
    'service_category_association', Base.metadata,
    Column('service_id', Integer, ForeignKey('services.id'), primary_key=True),
    Column('category_id', Integer, ForeignKey('categories.id'), primary_key=True)
)

# Modelo User (solo para referencia y relación con Service, no se gestiona aquí)
# Asume que esta tabla 'users' existe en la base de datos (creada por auth-service)
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    role = Column(String) # 'client', 'freelancer', 'admin'

    services = relationship("DBService", back_populates="owner")

class DBCategory(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)

    # Relación de muchos a muchos con DBService
    services = relationship(
        "DBService",
        secondary=service_category_association,
        back_populates="categories"
    )

class DBService(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    owner_id = Column(Integer, ForeignKey('users.id'), index=True) # ID del usuario (freelancer/admin) que posee el servicio

    owner = relationship("User", back_populates="services")
    # Relación de muchos a muchos con DBCategory
    categories = relationship(
        "DBCategory",
        secondary=service_category_association,
        back_populates="services"
    )
