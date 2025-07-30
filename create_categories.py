# RedFreelance/create_categories.py

import requests
import json
import os
from dotenv import load_dotenv

# Cargar variables de entorno (asegúrate de que tu .env esté en la raíz del proyecto o ajusta la ruta)
load_dotenv()

# --- Configuración ---
AUTH_SERVICE_URL = "http://localhost:8000"
SERVICE_SERVICE_URL = "http://localhost:8001"

ADMIN_EMAIL = "admin@gmail.com"  # Reemplaza con el email de tu usuario admin
ADMIN_PASSWORD = "123"      # Reemplaza con la contraseña de tu usuario admin

# Lista de categorías para crear (más concisa y general)
CATEGORIES_TO_CREATE = [
    "Desarrollo Web",
    "Desarrollo Móvil",
    "Diseño Gráfico",
    "Diseño UI/UX",
    "Marketing Digital",
    "SEO y SEM",
    "Redacción y Contenidos",
    "Traducción",
    "Edición de Video",
    "Animación",
    "Consultoría de Negocios",
    "Asistencia Virtual",
    "Análisis de Datos",
    "Ciencia de Datos e IA",
    "Fotografía",
    "Edición de Audio y Música",
    "Coaching y Formación",
    "Gestión de Proyectos",
    "Ciberseguridad",
    "Soporte Técnico IT",
    "Ilustración",
    "Copywriting",
    "Social Media Management",
    "E-commerce",
    "Legal y Asesoría",
    "Finanzas y Contabilidad",
    "Recursos Humanos",
    "Arquitectura e Interiorismo",
    "Modelado 3D",
    "Desarrollo de Juegos",
    "Investigación y Análisis",
    "Servicio al Cliente",
    "Ventas y Telemarketing"
]

def get_admin_token(email, password):
    """
    Obtiene un token de acceso para el usuario administrador.
    """
    url = f"{AUTH_SERVICE_URL}/token"
    data = {"username": email, "password": password}
    headers = {"Content-Type": "application/x-www-form-urlencoded"}

    try:
        response = requests.post(url, data=data, headers=headers)
        response.raise_for_status()  # Lanza una excepción para errores HTTP
        token = response.json().get("access_token")
        if not token:
            raise Exception("No se recibió el token de acceso en la respuesta.")
        print("Token de administrador obtenido con éxito.")
        return token
    except requests.exceptions.RequestException as e:
        print(f"Error al obtener el token de administrador: {e}")
        print(f"Respuesta del servidor: {e.response.text if e.response else 'N/A'}")
        return None

def create_category_in_service(category_name, admin_token):
    """
    Crea una categoría en el service-service.
    """
    url = f"{SERVICE_SERVICE_URL}/categories/"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {admin_token}"
    }
    data = {"name": category_name}

    try:
        response = requests.post(url, headers=headers, data=json.dumps(data))
        response.raise_for_status()
        print(f"Categoría '{category_name}' creada con éxito. ID: {response.json().get('id')}")
        return response.json()
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 409:
            print(f"Categoría '{category_name}' ya existe. Saltando.")
        else:
            print(f"Error al crear categoría '{category_name}': {e}")
            print(f"Respuesta del servidor: {e.response.text}")
        return None
    except requests.exceptions.RequestException as e:
        print(f"Error de conexión al crear categoría '{category_name}': {e}")
        return None

def main():
    print("Iniciando script para crear categorías...")

    # 1. Obtener token de administrador
    admin_token = get_admin_token(ADMIN_EMAIL, ADMIN_PASSWORD)
    if not admin_token:
        print("No se pudo obtener el token de administrador. Saliendo.")
        return

    # 2. Crear categorías
    print("\nCreando categorías...")
    for category_name in CATEGORIES_TO_CREATE:
        create_category_in_service(category_name, admin_token)

    print("\nProceso de creación de categorías finalizado.")

if __name__ == "__main__":
    main()
