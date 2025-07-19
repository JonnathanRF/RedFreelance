# RedFreelance/auth-service/main.py

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Annotated

# Importaciones de nuestros archivos locales
import models, schemas, database, security
from database import engine, get_db

# Crea todas las tablas en la base de datos.
# Esto se ejecutará al inicio de la aplicación y creará el archivo auth.db si no existe.
models.Base.metadata.create_all(bind=engine)

# Crea una instancia de la aplicación FastAPI
app = FastAPI(
    title="Auth Service",
    description="Microservicio encargado de la autenticación y autorización de usuarios (clientes y freelancers).",
    version="0.1.0",
)

# --- Configuración de CORS (Cross-Origin Resource Sharing) ---
origins = [
    "http://localhost",
    "http://localhost:3000", # Por lo general, tu frontend se ejecutará en este puerto
    "http://localhost:8080", # Otro puerto común para frontends
    # Puedes añadir más orígenes aquí cuando tu frontend se despliegue, ej. "https://tudominiofrontend.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Permite todos los métodos (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"], # Permite todos los encabezados, incluyendo Authorization
)

# Endpoint raíz (ya lo teníamos, lo mantenemos para verificar que el servicio está funcionando)
@app.get("/")
async def root():
    """
    Endpoint raíz para verificar que el servicio está funcionando.
    """
    return {"message": "Auth Service está funcionando!"}

# --- ENDPOINTS DE AUTENTICACIÓN ---

@app.post("/register", response_model=schemas.UserInDB, status_code=status.HTTP_201_CREATED)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Registra un nuevo usuario (cliente o freelancer).
    Requiere un email, contraseña y un rol ('client' o 'freelancer').
    """
    # Verificar si el email ya está registrado
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    # Hashear la contraseña
    hashed_password = security.get_password_hash(user.password)

    # Crear el nuevo usuario en la base de datos
    new_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        role=user.role,
        is_active=True # Por defecto, el usuario está activo al registrarse
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user) # Actualiza el objeto new_user con el ID generado por la BD

    return new_user

@app.post("/token", response_model=schemas.Token)
def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db)
):
    """
    Endpoint para que los usuarios se logueen y obtengan un token de acceso JWT.
    Requiere un `username` (que es el email) y `password`.
    """
    user = security.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # Aquí podríamos añadir lógica para definir expiración del token basada en el rol, si es necesario.
    access_token_expires = security.timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email, "role": user.role, "user_id": user.id}, # <--- ¡Añadido user.id aquí!
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me/", response_model=schemas.UserOut) # Agregamos un slash al final para ser consistentes
async def read_users_me(current_user: schemas.UserOut = Depends(security.get_current_user)):
    """
    Obtiene la información del usuario autenticado actualmente.
    Requiere un token JWT válido en el encabezado 'Authorization: Bearer <token>'.
    """
    return current_user

@app.get("/client-dashboard/", response_model=schemas.UserOut)
async def read_client_dashboard(
    current_user: schemas.UserOut = Depends(security.get_current_active_user_by_role(["client"]))
):
    """
    Ruta de ejemplo accesible solo para usuarios con el rol 'client'.
    Devuelve la información del cliente.
    """
    return current_user

@app.get("/freelancer-profile/", response_model=schemas.UserOut)
async def read_freelancer_profile(
    current_user: schemas.UserOut = Depends(security.get_current_active_user_by_role(["freelancer"]))
):
    """
    Ruta de ejemplo accesible solo para usuarios con el rol 'freelancer'.
    Devuelve la información del freelancer.
    """
    return current_user

@app.get("/admin-panel/", response_model=schemas.UserOut)
async def read_admin_panel(
    current_user: schemas.UserOut = Depends(security.get_current_active_user_by_role(["admin"]))
):
    """
    Ruta de ejemplo accesible solo para usuarios con el rol 'admin'.
    (Necesitarías registrar un usuario con rol 'admin' para probarla).
    """
    return current_user
