# 🔐 RedFreelance - Microservicio de Autenticación

¡Bienvenido al microservicio de autenticación (`auth-service`) de la plataforma **RedFreelance**!  
Este servicio es el núcleo de seguridad del sistema: gestiona el registro, inicio de sesión y autorización de usuarios mediante **JWT (JSON Web Tokens)**.

---

## 🚧 Estado del Proyecto

✅ Funcionalidades principales completadas  
✅ Autorización integrada en `service-service`

---

## ⚙️ Configuración de la Infraestructura

- `Dockerfile` para construir la imagen de FastAPI.
- `docker-compose.yml` para levantar servicios usando **PostgreSQL**.
- Hot Reload para desarrollo ágil.

---

## 👤 Gestión de Usuarios (`auth-service`)

| Endpoint     | Método | Descripción                                               |
|--------------|--------|-----------------------------------------------------------|
| `/register`  | POST   | Registro de usuario con contraseña hasheada y rol.       |
| `/token`     | POST   | Login y generación de JWT.                                |
| `/me/`       | GET    | Devuelve datos del usuario autenticado vía JWT.           |

---

## 🔐 Autorización Basada en Roles

- Middleware `get_current_active_user_by_role`.
- Acceso controlado según el rol del usuario (`client`, `freelancer`, `admin`).
- Rutas protegidas:
  - `/client-dashboard/` → `client`
  - `/freelancer-profile/` → `freelancer`
  - `/admin-panel/` → `admin`

---

## 💼 Gestión de Servicios (`service-service`)

CRUD completo con protección por roles:

| Endpoint             | Método | Acceso                       | Descripción                                  |
|----------------------|--------|------------------------------|----------------------------------------------|
| `/services/`         | POST   | Solo freelancers             | Crear un nuevo servicio                      |
| `/services/`         | GET    | Público                      | Listar todos los servicios                   |
| `/services/{id}`     | GET    | Público                      | Obtener detalles de un servicio específico   |
| `/services/{id}`     | PUT    | Propietario o admin          | Actualizar un servicio existente             |
| `/services/{id}`     | DELETE | Propietario o admin          | Eliminar un servicio                         |

---

## 🚀 Frontend

- Interfaz HTML/CSS/JS para Registro e Inicio de Sesión.
- Vistas separadas: `index.html`, `register.html`.
- Manejo de tokens y errores de autenticación.
- Botones de prueba para rutas protegidas.

---

## 🛠️ Tecnologías Utilizadas

| Tecnología        | Propósito                                                       |
|-------------------|------------------------------------------------------------------|
| Python 3.9        | Backend principal                                                |
| FastAPI           | Framework web                                                    |
| PostgreSQL        | Base de datos robusta y escalable                                |
| psycopg2-binary   | Driver PostgreSQL para Python                                    |
| JWT               | Autenticación basada en tokens                                   |
| bcrypt/passlib    | Hasheo seguro de contraseñas                                     |
| Docker            | Contenerización                                                  |
| Git               | Control de versiones                                             |
| aiosmtplib        | Envío de correos (verificación - pausado)                        |
| HTML/CSS/JS       | Frontend de prueba                                               |

---

## 💻 Cómo Ejecutar los Servicios

### 1. Clonar el repositorio

```bash
git clone https://github.com/tuusuario/RedFreelance.git
cd RedFreelance
```

### 2. Configurar variables de entorno

#### `auth-service/.env`

```env
# SMTP (verificación de correo - opcional)
SMTP_SERVER=smtp.ejemplo.com
SMTP_PORT=587
SMTP_USERNAME=usuario
SMTP_PASSWORD=clave
SENDER_EMAIL=noreply@redfreelance.com
VERIFICATION_TOKEN_EXPIRE_HOURS=24

# Base de datos PostgreSQL
DATABASE_URL="postgresql+psycopg2://user:password@db:5432/redfreelance_db"

# Clave secreta para JWT
SECRET_KEY="9fKK38TLROXvkgZ_BLUweAYe40TXyYm5J55txx21MXc"
```

#### `service-service/.env`

```env
DATABASE_URL="postgresql+psycopg2://user:password@db:5432/redfreelance_db"

# Clave secreta compartida con auth-service
SECRET_KEY="9fKK38TLROXvkgZ_BLUweAYe40TXyYm5J55txx21MXc"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 3. Levantar los servicios

```bash
docker-compose up --build
```

- 🔗 Auth-Service: [http://localhost:8000](http://localhost:8000)  
- 🔗 Service-Service: [http://localhost:8001](http://localhost:8001)

### 4. Levantar el frontend

```bash
cd frontend
python -m http.server 3000
```

- 🌐 Frontend: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Pruebas (Postman u otro cliente HTTP)

### 📝 Registro de Usuario

```http
POST http://localhost:8000/register
Content-Type: application/json

{
  "email": "ejemplo@correo.com",
  "password": "contraseña_segura",
  "role": "client"
}
```

### 🔐 Inicio de Sesión

```http
POST http://localhost:8000/token
Content-Type: application/x-www-form-urlencoded

username=ejemplo@correo.com
password=contraseña_segura
```

### 🙋 Obtener Usuario Actual

```http
GET http://localhost:8000/me/
Authorization: Bearer <ACCESS_TOKEN>
```

### 🧩 Acceso por Rol

| Ruta                    | Rol Requerido | Método | Código Esperado |
|-------------------------|---------------|--------|-----------------|
| `/client-dashboard/`    | client        | GET    | 200 OK / 403    |
| `/freelancer-profile/`  | freelancer    | GET    | 200 OK / 403    |
| `/admin-panel/`         | admin         | GET    | 200 OK / 403    |

---

## 🛠️ Pruebas de Servicios (`service-service`)

### ➕ Crear Servicio

```http
POST http://localhost:8001/services/
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "title": "Desarrollo Web con React",
  "description": "Aplicaciones modernas con React y Node.js",
  "price": 500.00,
  "category": "Desarrollo Web"
}
```

### 📄 Listar Servicios

```http
GET http://localhost:8001/services/
```

### 🔍 Obtener Servicio por ID

```http
GET http://localhost:8001/services/1
```

### ✏️ Actualizar Servicio

```http
PUT http://localhost:8001/services/1
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "title": "Diseño de Logotipos Avanzado",
  "description": "Logotipos profesionales con revisiones ilimitadas.",
  "price": 180.00,
  "category": "Diseño Gráfico"
}
```

### 🗑️ Eliminar Servicio

```http
DELETE http://localhost:8001/services/1
Authorization: Bearer <ACCESS_TOKEN>
```

---

## 📌 Próximos Pasos

- [ ] Implementar búsqueda y filtrado por título, categoría y rango de precios.
- [ ] Desarrollar el siguiente microservicio (`order-service`, `chat-service`, etc).

---

## 🧠 Contribuciones

¡Pull Requests, Issues y sugerencias son bienvenidas!  
Este proyecto está en constante mejora y abierto a colaboración.

---

## 📄 Licencia

Distribuido bajo licencia **MIT**.
