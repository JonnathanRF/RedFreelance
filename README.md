# 🔐 RedFreelance - Microservicio de Autenticación

Bienvenido al microservicio de autenticación (`auth-service`) de la plataforma **RedFreelance**. Este servicio es la base de seguridad del sistema, encargado del **registro**, **inicio de sesión** y **autorización** de usuarios mediante **JWT (JSON Web Tokens)**.

---

## 🚧 Estado del Proyecto

✅ Funcionalidades principales completadas:

### ⚙️ Configuración de la Infraestructura
- `Dockerfile` para construir imágenes con FastAPI.
- `docker-compose.yml` para levantar el servicio con persistencia en SQLite (`auth.db`).
- Hot Reload para un desarrollo ágil.

### 👤 Gestión de Usuarios
- `POST /register`: Registro seguro de usuarios con contraseña hasheada y rol (`client`, `freelancer` o `admin`).
- `POST /token`: Login y emisión de JWT.
- `GET /me/`: Información del usuario autenticado desde el token.

### 🔐 Autorización Basada en Roles
- Middleware de autorización (`get_current_active_user_by_role`) para restringir rutas según rol.
- Validaciones exitosas mediante pruebas de roles: acceso a recursos restringido según el tipo de usuario.

---

## 🛠️ Tecnologías Utilizadas

| Tecnología        | Uso                          |
|------------------|------------------------------|
| **Python 3.9**   | Backend                      |
| **FastAPI**      | Framework web principal      |
| **SQLite**       | Base de datos (con SQLAlchemy) |
| **JWT**          | Autenticación con tokens     |
| **bcrypt / Passlib** | Hasheo de contraseñas     |
| **Docker**       | Contenerización              |
| **Git**          | Control de versiones         |

---

## 💻 Cómo Ejecutar el Servicio

1. **Clonar el repositorio:**

```bash
git clone https://github.com/tuusuario/RedFreelance.git
cd RedFreelance
```

2. **Ejecutar con Docker Compose:**

Asegúrate de tener Docker Desktop o Docker Engine instalado.

```bash
docker-compose up
```

📌 El servicio estará disponible en: `http://localhost:8000`

---

## 🧪 Pruebas del Servicio (Postman u otro cliente HTTP)

### 1. 📝 Registro (`POST /register`)

- **URL:** `http://localhost:8000/register`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "email": "ejemplo@correo.com",
  "password": "contraseña_segura",
  "role": "client"
}
```

---

### 2. 🔐 Login (`POST /token`)

- **URL:** `http://localhost:8000/token`
- **Body (x-www-form-urlencoded):**
  - `username`: `ejemplo@correo.com`
  - `password`: `contraseña_segura`
- **Respuesta:** JWT con `access_token`.

---

### 3. 🙋 Obtener Usuario Actual (`GET /me/`)

- **Headers:**
  - `Authorization`: `Bearer <ACCESS_TOKEN>`
- **Respuesta:** Datos del usuario autenticado.

---

### 4. 🧩 Rutas Protegidas por Rol

| Ruta                        | Rol Requerido | Método | Código Esperado |
|-----------------------------|---------------|--------|------------------|
| `/client-dashboard/`        | client        | GET    | 200 OK o 403     |
| `/freelancer-profile/`      | freelancer    | GET    | 200 OK o 403     |
| `/admin-panel/`             | admin         | GET    | 200 OK o 403     |

---

## 📌 Próximos Pasos

1. **Configurar CORS** para permitir interacción con frontend.
2. Crear un frontend simple (HTML/CSS/JS) para probar el flujo completo de autenticación.

---

## 🧠 Contribuciones

¡Sugerencias, issues y PRs son bienvenidos! Este proyecto está en desarrollo y abierto a mejoras.

---

## 📄 Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).