# 🔐 RedFreelance - Microservicio de Autenticación

[cite_start]Bienvenido al microservicio de autenticación (`auth-service`) de la plataforma **RedFreelance**. [cite: 1] [cite_start]Este servicio es la base de seguridad del sistema, encargado del **registro**, **inicio de sesión** y **autorización** de usuarios mediante **JWT (JSON Web Tokens)**. [cite: 2]

---

## 🚧 Estado del Proyecto

✅ Funcionalidades principales completadas:

### ⚙️ Configuración de la Infraestructura
- `Dockerfile` para construir imágenes con FastAPI.
- [cite_start]`docker-compose.yml` para levantar el servicio con persistencia en SQLite (`auth.db`). [cite: 4]
- Hot Reload para un desarrollo ágil.

### 👤 Gestión de Usuarios
- [cite_start]`POST /register`: Registro seguro de usuarios con contraseña hasheada y rol (`client`, `freelancer` o `admin`). [cite: 5]
- [cite_start]`POST /token`: Login y emisión de JWT. [cite: 6]
- [cite_start]`GET /me/`: Información del usuario autenticado desde el token. [cite: 21]

### 🔐 Autorización Basada en Roles
- [cite_start]Middleware de autorización (`get_current_active_user_by_role`) para restringir rutas según rol. [cite: 7]
- [cite_start]Validaciones exitosas mediante pruebas de roles: acceso a recursos restringido según el tipo de usuario. [cite: 8]
- [cite_start]Rutas protegidas para `client-dashboard/` [cite: 23][cite_start], `freelancer-profile/` [cite: 25] [cite_start]y `admin-panel/` [cite: 27] con validación de roles.

### 📧 Verificación de Email (En Curso)
- **`is_verified` en el modelo de usuario:** Añadido un campo para rastrear el estado de verificación del correo electrónico.
- **Generación de Token de Verificación:** Se crea un JWT específico para la verificación de email con una duración definida.
- **`POST /register` modificado:** Después del registro, se enviará un correo electrónico con un enlace de verificación (implementación en progreso).
- **`GET /verify-email/`:** Nuevo endpoint para procesar el token de verificación y marcar al usuario como verificado.
- **Frontend de Verificación:** Página dedicada para mostrar el estado de la verificación (exitosa o fallida).
- **Pendiente:** Integración completa del envío de emails (configuración de SMTP).

### 🚀 Frontend (Interacción con Auth-Service)
- Interfaz de usuario básica para Registro e Inicio de Sesión.
- **Navegación mejorada:** Separación de las vistas de Login y Registro en `index.html` y `register.html` respectivamente.
- Manejo de respuestas de autenticación (tokens, mensajes de éxito/error).
- Botones para probar el acceso a rutas protegidas por rol.

---

## 🛠️ Tecnologías Utilizadas

| Tecnología        | Uso                          |
|-------------------|------------------------------|
| **Python 3.9** | [cite_start]Backend                      | [cite: 10]
| **FastAPI** | [cite_start]Framework web principal      | [cite: 11]
| **SQLite** | [cite_start]Base de datos (con SQLAlchemy) | [cite: 12]
| **JWT** | [cite_start]Autenticación con tokens     | [cite: 13]
| **bcrypt / Passlib** | [cite_start]Hasheo de contraseñas      | [cite: 14]
| **Docker** | [cite_start]Contenerización              | [cite: 15]
| **Git** | [cite_start]Control de versiones         | 
| **aiosmtplib** | Envío de correos electrónicos (para verificación) |
| **HTML/CSS/JS** | Frontend de demostración     |

---

## 💻 Cómo Ejecutar el Servicio

1.  **Clonar el repositorio:**

    ```bash
    git clone [https://github.com/tuusuario/RedFreelance.git](https://github.com/tuusuario/RedFreelance.git)
    cd RedFreelance
    ```

2.  **Configurar Variables de Entorno para el Envío de Email:**
    Crea un archivo `.env` en la carpeta `auth-service/` y añade tus credenciales SMTP:
    ```dotenv
    # RedFreelance/auth-service/.env
    SMTP_SERVER=tu_servidor_smtp # Ej: smtp.mailtrap.io, smtp.gmail.com
    SMTP_PORT=tu_puerto_smtp     # Ej: 2525, 587
    SMTP_USERNAME=tu_usuario_smtp
    SMTP_PASSWORD=tu_password_smtp
    SENDER_EMAIL=noreply@redfreelance.com
    VERIFICATION_TOKEN_EXPIRE_HOURS=24
    ```

3.  **Ejecutar con Docker Compose:**

    [cite_start]Asegúrate de tener Docker Desktop o Docker Engine instalado. [cite: 19]
    ```bash
    docker-compose up --build
    ```
    📌 El servicio de autenticación estará disponible en: `http://localhost:8000`

4.  **Ejecutar el Frontend:**
    En una nueva terminal, navega a la carpeta `RedFreelance/frontend/` y levanta un servidor HTTP simple:
    ```bash
    cd frontend
    python -m http.server 3000
    ```
    📌 El frontend de demostración estará disponible en: `http://localhost:3000`

---

## 🧪 Pruebas del Servicio (Postman u otro cliente HTTP)

### 1. 📝 Registro (`POST /register`)

-   **URL:** `http://localhost:8000/register`
-   **Headers:** `Content-Type: application/json`
-   **Body (JSON):**
    ```json
    {
      "email": "ejemplo@correo.com",
      "password": "contraseña_segura",
      "role": "client"
    }
    ```
    *Nota: Tras el registro, se enviará un email de verificación a esta dirección.*

---

### 2. 🔐 Login (`POST /token`)

-   **URL:** `http://localhost:8000/token`
-   **Body (x-www-form-urlencoded):**
    -   `username`: `ejemplo@correo.com`
    -   `password`: `contraseña_segura`
-   [cite_start]**Respuesta:** JWT con `access_token`. [cite: 20]

---

### 3. 📧 Verificación de Email (`GET /verify-email/`)

-   **URL:** Enlace recibido por email (ej. `http://localhost:8000/verify-email/?token=eyJ...`)
-   **Comportamiento:** Marca el usuario como verificado y redirige al frontend.

---

### 4. 🙋 Obtener Usuario Actual (`GET /me/`)

-   **Headers:**
    -   `Authorization`: `Bearer <ACCESS_TOKEN>`
-   [cite_start]**Respuesta:** Datos del usuario autenticado. [cite: 21]

---

### 5. 🧩 Rutas Protegidas por Rol

| Ruta                        | Rol Requerido | Método | Código Esperado  |
| :-------------------------- | :------------ | :----- | :--------------- |
| `/client-dashboard/`        | client        | GET    | [cite_start]200 OK o 403     | [cite: 24]
| `/freelancer-profile/`      | freelancer    | GET    | 200 OK o 403     |
| `/admin-panel/`             | admin         | GET    | [cite_start]200 OK o 403     | [cite: 28]

---

## 📌 Próximos Pasos

1.  **Completar la implementación y prueba del envío de correos electrónicos** para la verificación de email.
2.  **Añadir funcionalidad de "Reenviar email de verificación"** en el frontend para usuarios no verificados.

---

## 🧠 Contribuciones

¡Sugerencias, issues y PRs son bienvenidos! [cite_start]Este proyecto está en desarrollo y abierto a mejoras. [cite: 31]

---

## 📄 Licencia

Este proyecto está bajo la licencia [MIT](LICENSE).