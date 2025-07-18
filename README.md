🔐 RedFreelance - Microservicio de Autenticación
¡Bienvenido al microservicio de autenticación (auth-service) de la plataforma RedFreelance! Este servicio es el núcleo de seguridad del sistema: gestiona el registro, inicio de sesión y autorización de usuarios mediante JWT (JSON Web Tokens).

🚧 Estado del Proyecto
✅ Funcionalidades principales completadas

⚙️ Configuración de la Infraestructura
Dockerfile para construir la imagen de FastAPI.

docker-compose.yml para levantar múltiples servicios con persistencia, ahora utilizando PostgreSQL.

Hot Reload para desarrollo ágil.

👤 Gestión de Usuarios (auth-service)
Endpoint       

Método

Descripción                                               

/register   

POST   

Registro de usuario con contraseña hasheada y rol.       

/token       

POST   

Login y generación de JWT.                               

/me/         

GET   

Devuelve datos del usuario autenticado vía JWT.           

🔐 Autorización Basada en Roles
Middleware personalizado get_current_active_user_by_role.

Validación de accesos según los roles: client, freelancer, admin.

Rutas protegidas:
  - /client-dashboard/ (rol: client)
  - /freelancer-profile/ (rol: freelancer)
  - /admin-panel/ (rol: admin)

💼 Gestión de Servicios (service-service)
CRUD completo para servicios ofrecidos por freelancers:

Endpoint                     

Método

Descripción                                     

/services/               

POST   

Crear nuevo servicio                             

/services/               

GET   

Listar todos los servicios                       

/services/{id}           

GET   

Obtener detalles de un servicio específico       

/services/{id}           

PUT   

Actualizar un servicio existente                 

/services/{id}           

DELETE

Eliminar un servicio                             

🚀 Frontend
Interfaz HTML/CSS/JS para Registro e Inicio de Sesión.

Separación de vistas (index.html, register.html).

Manejo de respuestas de autenticación (tokens, errores).

Botones para probar rutas protegidas según el rol.

🛠️ Tecnologías Utilizadas
Tecnología     

Propósito                                         

Python 3.9

Backend                                           

FastAPI   

Framework Web principal                           

PostgreSQL

Base de datos relacional robusta y escalable   

psycopg2-binary

Driver de PostgreSQL para Python           

JWT       

Autenticación basada en tokens                   

bcrypt / passlib

Hasheo de contraseñas (ahora sin advertencias)

Docker     

Contenerización                                   

Git       

Control de versiones                             

aiosmtplib

Envío de correos (verificación - funcionalidad pausada)

HTML/CSS/JS

Frontend de prueba                               

💻 Cómo Ejecutar los Servicios
Clonar el repositorio

git clone https://github.com/tuusuario/RedFreelance.git
cd RedFreelance

Configurar variables de entorno
Crea un archivo .env en auth-service/ y otro en service-service/ con las siguientes configuraciones:

RedFreelance/auth-service/.env

# Configuración para el Envío de Correos (funcionalidad pausada)
SMTP_SERVER=smtp.ejemplo.com
SMTP_PORT=587
SMTP_USERNAME=usuario
SMTP_PASSWORD=clave
SENDER_EMAIL=noreply@redfreelance.com
VERIFICATION_TOKEN_EXPIRE_HOURS=24

# Configuración de la Base de Datos PostgreSQL para Auth Service
DATABASE_URL="postgresql+psycopg2://user:password@db:5432/redfreelance_db"

RedFreelance/service-service/.env

# Configuración de la Base de Datos PostgreSQL para Service Service
DATABASE_URL="postgresql+psycopg2://user:password@db:5432/redfreelance_db"

Levantar servicios con Docker Compose

docker-compose up --build

🔗 Auth-Service: http://localhost:8000  

🔗 Service-Service: http://localhost:8001

Levantar el frontend

cd frontend
python -m http.server 3000

🌐 Frontend: http://localhost:3000

🧪 Pruebas (vía Postman u otro cliente HTTP)
📝 Registro de Usuario (auth-service)
URL: POST http://localhost:8000/register

Body JSON:

{
  "email": "ejemplo@correo.com",
  "password": "contraseña_segura",
  "role": "client"
}

🔐 Inicio de Sesión (auth-service)
URL: POST http://localhost:8000/token

Body x-www-form-urlencoded:
  - username: ejemplo@correo.com
  - password: contraseña_segura

Respuesta: JWT con access_token

🙋 Obtener Usuario Actual (auth-service)
URL: GET http://localhost:8000/me/

Headers: Authorization: Bearer <ACCESS_TOKEN>

🧩 Acceso según rol (auth-service)
Ruta                   

Rol Requerido

Método

Código Esperado

/client-dashboard/   

client       

GET   

200 OK / 403   

/freelancer-profile/ 

freelancer   

GET   

200 OK / 403   

/admin-panel/         

admin         

GET   

200 OK / 403   

🛠️ Pruebas de Servicios (service-service)
➕ Crear Servicio
URL: POST http://localhost:8001/services/

Headers: Content-Type: application/json (Opcional: Authorization: Bearer <ACCESS_TOKEN>)

Body JSON:

{
  "title": "Desarrollo Web con React",
  "description": "Aplicaciones modernas con React y Node.js",
  "price": 500.00,
  "category": "Desarrollo Web"
}

📄 Listar Servicios
URL: GET http://localhost:8001/services/

🔍 Obtener Servicio por ID
URL: GET http://localhost:8001/services/1

✏️ Actualizar Servicio
URL: PUT http://localhost:8001/services/1

Headers: Content-Type: application/json (Opcional: Authorization: Bearer <ACCESS_TOKEN>)

Body JSON:

{
  "title": "Diseño de Logotipos Avanzado",
  "description": "Logotipos profesionales con revisiones ilimitadas.",
  "price": 180.00,
  "category": "Diseño Gráfico"
}

🗑️ Eliminar Servicio
URL: DELETE http://localhost:8001/services/1

Headers: (Opcional: Authorization: Bearer <ACCESS_TOKEN>)

📌 Próximos Pasos
[ ] Integrar autorización en service-service:

Proteger los endpoints de creación, actualización y eliminación de servicios para que solo los usuarios autenticados con el rol freelancer puedan crear sus propios servicios.

Obtener el freelancer_id real del usuario autenticado (desde el JWT del auth-service) y asignarlo a los servicios creados.

[ ] Añadir filtros y búsquedas al listado de servicios.

[ ] Iniciar desarrollo del próximo microservicio (order-service, chat-service, etc).

🧠 Contribuciones
¡Pull Requests, Issues y sugerencias son más que bienvenidas! Este proyecto está en constante desarrollo y aprendizaje.

📄 Licencia
Este proyecto está licenciado bajo la MIT License.