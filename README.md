# 🔐 RedFreelance - Microservicio de Autenticación

¡Bienvenido al microservicio de autenticación (`auth-service`) de la plataforma **RedFreelance**!  
Este servicio es el núcleo de seguridad del sistema: gestiona el registro, inicio de sesión y autorización de usuarios mediante **JWT (JSON Web Tokens)**.

---

## 🚧 Estado del Proyecto

✅ **Funcionalidades principales completadas**

---

## ⚙️ Configuración de la Infraestructura

- `Dockerfile` para construir la imagen de FastAPI.
- `docker-compose.yml` para levantar múltiples servicios con persistencia (`auth.db`, `services.db`).
- Hot Reload para desarrollo ágil.

---

## 👤 Gestión de Usuarios (`auth-service`)

| Endpoint       | Método | Descripción                                               |
|----------------|--------|-----------------------------------------------------------|
| `/register`    | POST   | Registro de usuario con contraseña hasheada y rol.       |
| `/token`       | POST   | Login y generación de JWT.                                |
| `/me/`         | GET    | Devuelve datos del usuario autenticado vía JWT.           |

---

## 🔐 Autorización Basada en Roles

- Middleware personalizado `get_current_active_user_by_role`.
- Validación de accesos según los roles: `client`, `freelancer`, `admin`.
- Rutas protegidas:
  - `/client-dashboard/` (rol: client)
  - `/freelancer-profile/` (rol: freelancer)
  - `/admin-panel/` (rol: admin)

---

## 💼 Gestión de Servicios (`service-service`)

CRUD completo para servicios ofrecidos por freelancers:

| Endpoint                     | Método | Descripción                                      |
|-----------------------------|--------|--------------------------------------------------|
| `/services/`                | POST   | Crear nuevo servicio                             |
| `/services/`                | GET    | Listar todos los servicios                       |
| `/services/{id}`            | GET    | Obtener detalles de un servicio específico       |
| `/services/{id}`            | PUT    | Actualizar un servicio existente                 |
| `/services/{id}`            | DELETE | Eliminar un servicio                             |

---

## 🚀 Frontend

- Interfaz HTML/CSS/JS para Registro e Inicio de Sesión.
- Separación de vistas (`index.html`, `register.html`).
- Manejo de respuestas de autenticación (tokens, errores).
- Botones para probar rutas protegidas según el rol.

---

## 🛠️ Tecnologías Utilizadas

| Tecnología     | Propósito                                         |
|----------------|---------------------------------------------------|
| **Python 3.9** | Backend                                           |
| **FastAPI**    | Framework Web principal                           |
| **SQLite**     | Base de datos (`auth.db`, `services.db`)          |
| **JWT**        | Autenticación basada en tokens                    |
| **bcrypt** / `passlib` | Hasheo de contraseñas                     |
| **Docker**     | Contenerización                                   |
| **Git**        | Control de versiones                              |
| **aiosmtplib** | Envío de correos (verificación - funcionalidad pausada) |
| **HTML/CSS/JS**| Frontend de prueba                                |

---

## 💻 Cómo Ejecutar los Servicios

1. **Clonar el repositorio**
```bash
git clone https://github.com/tuusuario/RedFreelance.git
cd RedFreelance
```

2. **Configurar variables de entorno (auth-service)**  
Crea un archivo `.env` en `auth-service/` con las credenciales SMTP:
```env
SMTP_SERVER=smtp.ejemplo.com
SMTP_PORT=587
SMTP_USERNAME=usuario
SMTP_PASSWORD=clave
SENDER_EMAIL=noreply@redfreelance.com
VERIFICATION_TOKEN_EXPIRE_HOURS=24
```

3. **Levantar servicios con Docker Compose**
```bash
docker-compose up --build
```
- 🔗 Auth-Service: [http://localhost:8000](http://localhost:8000)  
- 🔗 Service-Service: [http://localhost:8001](http://localhost:8001)

4. **Levantar el frontend**
```bash
cd frontend
python -m http.server 3000
```
- 🌐 Frontend: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Pruebas (vía Postman u otro cliente HTTP)

### 📝 Registro de Usuario
- **URL:** `POST http://localhost:8000/register`
- **Body JSON:**
```json
{
  "email": "ejemplo@correo.com",
  "password": "contraseña_segura",
  "role": "client"
}
```

### 🔐 Inicio de Sesión
- **URL:** `POST http://localhost:8000/token`
- **Body x-www-form-urlencoded:**
  - `username`: ejemplo@correo.com
  - `password`: contraseña_segura
- **Respuesta:** JWT con `access_token`

### 🙋 Obtener Usuario Actual
- **URL:** `GET /me/`
- **Headers:** `Authorization: Bearer <ACCESS_TOKEN>`

### 🧩 Acceso según rol

| Ruta                    | Rol Requerido | Método | Código Esperado |
|-------------------------|---------------|--------|-----------------|
| `/client-dashboard/`    | client        | GET    | 200 OK / 403    |
| `/freelancer-profile/`  | freelancer    | GET    | 200 OK / 403    |
| `/admin-panel/`         | admin         | GET    | 200 OK / 403    |

---

### 🛠️ Pruebas de Servicios

#### ➕ Crear Servicio
```json
{
  "title": "Desarrollo Web con React",
  "description": "Aplicaciones modernas con React y Node.js",
  "price": 500.00,
  "category": "Desarrollo Web"
}
```

#### 📄 Listar Servicios
- `GET http://localhost:8001/services/`

#### 🔍 Obtener Servicio por ID
- `GET http://localhost:8001/services/1`

#### ✏️ Actualizar Servicio
```json
{
  "title": "Diseño de Logotipos Avanzado",
  "description": "Logotipos profesionales con revisiones ilimitadas.",
  "price": 180.00,
  "category": "Diseño Gráfico"
}
```

#### 🗑️ Eliminar Servicio
- `DELETE http://localhost:8001/services/1`

---

## 📌 Próximos Pasos

- [ ] Restringir creación/edición de servicios solo a usuarios `freelancer`.
- [ ] Asociar `freelancer_id` a los servicios mediante JWT.
- [ ] Añadir filtros y búsquedas al listado de servicios.
- [ ] Iniciar desarrollo del próximo microservicio (`order-service`, `chat-service`, etc).

---

## 🧠 Contribuciones

¡Pull Requests, Issues y sugerencias son más que bienvenidas!  
Este proyecto está en constante desarrollo y aprendizaje.

---

## 📄 Licencia

Este proyecto está licenciado bajo la **MIT License**.
