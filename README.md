
# 🔐 RedFreelance - Microservicio de Autenticación

Bienvenido al **microservicio de autenticación** (`auth-service`) de la plataforma **RedFreelance**.  
Este servicio gestiona el **registro, inicio de sesión y autorización de usuarios** mediante **JWT**. Es el núcleo de seguridad de nuestro ecosistema de microservicios.

---

## 🚧 Estado del Proyecto

- ✅ Funcionalidades principales completadas  
- ✅ Autorización integrada en `service-service`  
- ✅ Frontend estilizado con Tailwind CSS  
- ✅ Filtro de servicios por freelancer  
- ✅ CORS correctamente configurado  
- ✅ Página de bienvenida (`landing.html`)  
- ✅ Interfaz dinámica con animaciones  
- ✅ Navbar global con enlace a landing  
- ✅ Redirección inteligente (`index.html`, `script.js`)

---

## ⚙️ Infraestructura

- `Dockerfile`: Imagen para FastAPI  
- `docker-compose.yml`: Orquestación con PostgreSQL  
- Hot Reload para desarrollo ágil  

---

## 👤 Gestión de Usuarios (`auth-service`)

| Endpoint | Método | Descripción |
|---------|--------|-------------|
| `/register` | POST | Registro con contraseña hasheada y rol |
| `/token` | POST | Login y generación de JWT |
| `/me/` | GET | Datos del usuario autenticado |

---

## 🔐 Autorización Basada en Roles

Middleware: `get_current_active_user_by_role`

| Ruta | Rol Requerido | Descripción |
|------|---------------|-------------|
| `/client-dashboard/` | `client` | Acceso para clientes |
| `/freelancer-profile/` | `freelancer` | Acceso para freelancers |
| `/admin-panel/` | `admin` | Panel exclusivo de admins |

---

## 💼 Gestión de Servicios (`service-service`)

| Endpoint | Método | Acceso | Descripción |
|----------|--------|--------|-------------|
| `/services/` | POST | Freelancer/Admin | Crear servicio |
| `/services/` | GET | Público | Listar servicios |
| `/services/my/` | GET | Freelancer/Admin | Servicios del usuario |
| `/services/{id}` | GET | Público | Detalle de servicio |
| `/services/{id}` | PUT | Propietario/Admin | Editar servicio |
| `/services/{id}` | DELETE | Propietario/Admin | Eliminar servicio |
| `/landing-categories/` | GET | Público | Categorías con servicios de ejemplo |

---

## 🚀 Frontend

Frontend construido con **HTML**, **JavaScript** y **Tailwind CSS**.

### 🧱 Estructura

- **`js/`**
  - `script.js`: Lógica de login/redirección
  - `services.js`: CRUD y filtros de servicios
  - `landing.js`: Carga dinámica para landing

- **Páginas HTML**
  - `landing.html`: Página de bienvenida
  - `index.html`: Login/Inicio de sesión
  - `register.html`: Registro
  - `services.html`: Gestión de servicios

### ✨ Características Destacadas

- Manejo completo de tokens JWT y errores  
- Estilo moderno y responsive  
- Navbar fijo  
- Alternancia entre "Mis Servicios" y "Todos los Servicios"  
- Landing con "Top Freelancers" por categoría  

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Propósito |
|------------|-----------|
| Python 3.9 | Backend |
| FastAPI | API REST |
| PostgreSQL | Base de datos |
| `psycopg2-binary` | Conector PostgreSQL |
| JWT | Autenticación |
| `bcrypt`, `passlib` | Hasheo |
| Docker | Contenerización |
| Git | Control de versiones |
| `aiosmtplib` | Envío de correos |
| HTML, JS | Interfaz de usuario |
| Tailwind CSS | Estilos CSS |

---

## 💻 Ejecución del Proyecto

1. **Clonar repositorio**
   ```bash
   git clone https://github.com/tuusuario/RedFreelance.git
   cd RedFreelance
   ```

2. **Configurar variables de entorno**

   - `auth-service/.env`  
     ```
     SMTP_SERVER=smtp.ejemplo.com
     SMTP_PORT=587
     SMTP_USERNAME=usuario
     SMTP_PASSWORD=clave
     SENDER_EMAIL=noreply@redfreelance.com
     VERIFICATION_TOKEN_EXPIRE_HOURS=24
     DATABASE_URL=postgresql+psycopg2://user:password@db:5432/redfreelance_db
     SECRET_KEY=tu_clave_secreta
     ```

   - `service-service/.env`  
     ```
     DATABASE_URL=postgresql+psycopg2://user:password@db:5432/redfreelance_db
     SECRET_KEY=tu_clave_secreta
     ALGORITHM=HS256
     ACCESS_TOKEN_EXPIRE_MINUTES=30
     ```

3. **Levantar servicios backend**
   ```bash
   docker-compose up --build
   ```

   - Auth-Service: [http://localhost:8000](http://localhost:8000)  
   - Service-Service: [http://localhost:8001](http://localhost:8001)

4. **Levantar frontend**
   ```bash
   cd frontend
   python -m http.server 3000
   ```

   - Frontend: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Pruebas con Postman

### Registro

```http
POST http://localhost:8000/register
Content-Type: application/json
```
```json
{
  "email": "ejemplo@correo.com",
  "password": "contraseña_segura",
  "role": "client"
}
```

### Login

```http
POST http://localhost:8000/token
Content-Type: application/x-www-form-urlencoded
```
```
username=ejemplo@correo.com
password=contraseña_segura
```

### Obtener usuario actual

```http
GET http://localhost:8000/me/
Authorization: Bearer <ACCESS_TOKEN>
```

### Pruebas de Roles

| Ruta | Rol | Método | Esperado |
|------|-----|--------|----------|
| `/client-dashboard/` | `client` | GET | 200 / 403 |
| `/freelancer-profile/` | `freelancer` | GET | 200 / 403 |
| `/admin-panel/` | `admin` | GET | 200 / 403 |

---

## 🔧 Pruebas de Servicios (`service-service`)

### Crear Servicio

```http
POST http://localhost:8001/services/
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
```
```json
{
  "title": "Desarrollo Web con React",
  "description": "Aplicaciones modernas con React y Node.js",
  "price": 500.00,
  "category": "Desarrollo Web"
}
```

### Otros Endpoints

- Listar todos: `GET /services/`  
- Listar propios: `GET /services/my/`  
- Detalle por ID: `GET /services/{id}`  
- Editar servicio: `PUT /services/{id}`  
- Eliminar servicio: `DELETE /services/{id}`  
- Categorías landing: `GET /landing-categories/`

---

## 📌 Próximos Pasos

### Fase 1: Backend

- Crear tabla `categories` y modelo `DBCategory`
- Validar categorías en creación/edición de servicios
- Endpoints:
  - `POST /categories/` (Admin)
  - `GET /categories/`
  - `DELETE /categories/{id}`

### Fase 2: Frontend

- Reemplazar `input` por `<select>` para categorías
- Obtener categorías dinámicamente
- Filtrar servicios por categoría desde `landing.html`

---

## 🤝 Contribuciones

¡Pull requests y sugerencias son **bienvenidas**!  
Este proyecto está en constante evolución y abierto a la comunidad.

---

## 📄 Licencia

Distribuido bajo la **Licencia MIT**.  
Consulta el archivo [LICENSE](./LICENSE) para más información.
