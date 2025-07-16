# RedFreelance/auth-service/main.py

from fastapi import FastAPI

# Crea una instancia de la aplicación FastAPI
app = FastAPI(
    title="Auth Service",
    description="Microservicio encargado de la autenticación y autorización de usuarios (clientes y freelancers).",
    version="0.1.0",
)

@app.get("/")
async def root():
    """
    Endpoint raíz para verificar que el servicio está funcionando.
    """
    return {"message": "Auth Service está funcionando!"}