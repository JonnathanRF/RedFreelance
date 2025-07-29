# 🔐 RedFreelance - Microservicio de Autenticación

Bienvenido al microservicio de autenticación (`auth-service`) de la plataforma **RedFreelance**.

Este servicio gestiona el **registro, inicio de sesión y autorización de usuarios mediante JWT**. Es el **núcleo de seguridad** del ecosistema de microservicios.

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
- ✅ Dropdowns dinámicos para categorías  
- ✅ Filtrado por categoría desde `landing.html`  
- ✅ Redirección al login si no autenticado  
- ✅ Corregido `AttributeError` de `bcrypt` en logs  
- ✅ Navegación fluida entre login y registro  
- ✅ Notificaciones personalizadas y animadas  
- ✅ Persistencia de notificaciones tras redirecciones  
- ✅ Eliminación del warning de `bcrypt` en logs  

---

## ⚙️ Infraestructura

- `Dockerfile`: Imagen para FastAPI  
- `docker-compose.yml`: Orquestación con PostgreSQL (sin `version:` obsoleto)  
- 🔁 **Hot Reload** para desarrollo ágil  

---

## 👤 Gestión de Usuarios (`auth-service`)

| Endpoint   | Método | Descripción                          |
|------------|--------|--------------------------------------|
| `/register`| POST   | Registro con contraseña y rol        |
| `/token`   | POST   | Login y generación de JWT            |
| `/me/`     | GET    | Obtener datos del usuario autenticado|

---

## 🔐 Autorización Basada en Roles

Middleware: `get_current_active_user_by_role`

| Ruta                 | Rol Requerido | Descripción                 |
|----------------------|---------------|-----------------------------|
| `/client-dashboard/` | `client`      | Acceso para clientes        |
| `/freelancer-profile/`| `freelancer` | Acceso para freelancers     |
| `/admin-panel/`      | `admin`       | Panel exclusivo de admins   |

---

## 💼 Gestión de Servicios (`service-service`)

| Endpoint              | Método | Acceso            | Descripción                   |
|-----------------------|--------|-------------------|-------------------------------|
| `/services/`          | POST   | Freelancer/Admin  | Crear servicio                |
| `/services/`          | GET    | Público           | Listar servicios              |
| `/services/my/`       | GET    | Freelancer/Admin  | Ver servicios del usuario     |
| `/services/{id}`      | GET    | Público           | Detalle del servicio          |
| `/services/{id}`      | PUT    | Propietario/Admin | Editar servicio               |
| `/services/{id}`      | DELETE | Propietario/Admin | Eliminar servicio             |
| `/landing-categories/`| GET    | Público           | Categorías destacadas         |
| `/categories/`        | POST   | Admin             | Crear categoría               |
| `/categories/`        | GET    | Público           | Listar categorías             |
| `/categories/{id}`    | DELETE | Admin             | Eliminar categoría            |

---

## 🚀 Frontend

Frontend desarrollado con **HTML, JavaScript y Tailwind CSS**.

### 🧱 Estructura

```
frontend/
├── js/
│   ├── script.js          # Login y redirección
│   ├── services.js        # CRUD y filtros
│   ├── landing.js         # Lógica landing
│   └── notification.js    # Notificaciones animadas
├── landing.html           # Página de bienvenida
├── index.html             # Login
├── register.html          # Registro
└── services.html          # Gestión de servicios
```

---

## ✨ Características Destacadas

- Manejo completo de tokens JWT  
- Estilo moderno y responsive  
- Navbar global fijo  
- Alternancia entre "Mis Servicios" y "Todos los Servicios"  
- Landing con “Top Freelancers” por categoría  
- Dropdowns dinámicos para selección de categorías  
- Filtrado de servicios desde landing y gestión  
- Notificaciones animadas persistentes entre páginas  
- Navegación fluida entre login y registro  

---

## 🛠️ Tecnologías Utilizadas

| Tecnología         | Propósito             |
|--------------------|------------------------|
| Python 3.9         | Backend                |
| FastAPI            | API REST               |
| PostgreSQL         | Base de datos          |
| psycopg2-binary    | Conector PostgreSQL    |
| JWT                | Autenticación          |
| bcrypt, passlib    | Hasheo de contraseñas  |
| Docker             | Contenerización        |
| Git                | Control de versiones   |
| aiosmtplib         | Envío de correos       |
| HTML + JS          | Interfaz de usuario    |
| Tailwind CSS       | Estilos CSS            |

---

## 💻 Ejecución del Proyecto

### 1. Clonar Repositorio

```bash
git clone https://github.com/tuusuario/RedFreelance.git
cd RedFreelance
```

### 2. Configurar Variables de Entorno

#### `auth-service/.env`

```env
SMTP_SERVER=smtp.ejemplo.com
SMTP_PORT=587
SMTP_USERNAME=usuario
SMTP_PASSWORD=clave
SENDER_EMAIL=noreply@redfreelance.com
VERIFICATION_TOKEN_EXPIRE_HOURS=24
DATABASE_URL=postgresql+psycopg2://user:password@db:5432/redfreelance_db
SECRET_KEY=tu_clave_secreta
```

#### `service-service/.env`

```env
DATABASE_URL=postgresql+psycopg2://user:password@db:5432/redfreelance_db
SECRET_KEY=tu_clave_secreta
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 3. Levantar Backend

```bash
docker-compose up --build
```

- Auth-Service: http://localhost:8000  
- Service-Service: http://localhost:8001

### 4. Levantar Frontend

```bash
cd frontend
python -m http.server 3000
```

- Frontend: http://localhost:3000

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

username=ejemplo@correo.com
password=contraseña_segura
```

### Obtener Usuario Actual

```http
GET http://localhost:8000/me/
Authorization: Bearer <ACCESS_TOKEN>
```

### Pruebas por Rol

| Ruta                | Rol       | Método | Resultado Esperado |
|---------------------|-----------|--------|---------------------|
| `/client-dashboard/`| `client`  | GET    | 200 / 403           |
| `/freelancer-profile/`| `freelancer` | GET | 200 / 403           |
| `/admin-panel/`     | `admin`   | GET    | 200 / 403           |

---

## 🔧 Pruebas de Servicios

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

- `GET /services/` – Listar todos  
- `GET /services/my/` – Servicios propios  
- `GET /services/{id}` – Detalle del servicio  
- `PUT /services/{id}` – Editar servicio  
- `DELETE /services/{id}` – Eliminar servicio  
- `GET /landing-categories/` – Categorías destacadas  

---

## 📌 Próximos Pasos

### Fase 1: Backend

- Crear modelo `DBCategory`
- Validar categoría en creación/edición
- Endpoints:
  - `POST /categories/`
  - `GET /categories/`
  - `DELETE /categories/{id}`

### Fase 2: Frontend

- Usar `<select>` dinámico en lugar de `<input>`
- Obtener categorías dinámicamente
- Filtrado desde `landing.html`
- Implementar **modal de confirmación personalizado** para acciones críticas

---

## 🤝 Contribuciones

¡Pull requests y sugerencias son bienvenidas!  
Este proyecto está en constante evolución y abierto a la comunidad.

---

## 📄 Licencia

Distribuido bajo la **Licencia MIT**.  
Consulta el archivo `LICENSE` para más información.