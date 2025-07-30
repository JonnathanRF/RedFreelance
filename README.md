# 🌐 RedFreelance - Microservicio de Servicios + Frontend

Este repositorio forma parte de la plataforma **RedFreelance** y combina el **microservicio de servicios (`service-service`)** y el **frontend**.

---

## 🚧 Estado del Proyecto

- ✅ Gestión completa de servicios (crear, listar, editar, eliminar)  
- ✅ Filtro de servicios por freelancer y por categoría  
- ✅ Autenticación y autorización basada en roles integrada con `auth-service`  
- ✅ Dropdowns dinámicos de categorías  
- ✅ Página de bienvenida (`landing.html`) funcional  
- ✅ Redirección y autenticación inteligente en frontend  
- ✅ Interfaz moderna y responsive con **Tailwind CSS**  
- ✅ Navbar global  
- ✅ Notificaciones animadas persistentes  
- ✅ Modal de confirmación personalizado  
- ✅ Corrección de errores con módulos ES6 (`import/export`)  

---

## 💼 Microservicio de Servicios (`service-service`)

| Endpoint               | Método | Acceso            | Descripción                   |
|------------------------|--------|-------------------|-------------------------------|
| `/services/`           | POST   | Freelancer/Admin  | Crear nuevo servicio          |
| `/services/`           | GET    | Público           | Listar todos los servicios    |
| `/services/my/`        | GET    | Freelancer/Admin  | Ver servicios propios         |
| `/services/{id}`       | GET    | Público           | Detalle de un servicio        |
| `/services/{id}`       | PUT    | Propietario/Admin | Editar servicio               |
| `/services/{id}`       | DELETE | Propietario/Admin | Eliminar servicio             |
| `/landing-categories/` | GET    | Público           | Categorías destacadas         |
| `/categories/`         | POST   | Admin             | Crear categoría               |
| `/categories/`         | GET    | Público           | Listar categorías             |
| `/categories/{id}`     | DELETE | Admin             | Eliminar categoría            |

---

## 🚀 Frontend

Frontend desarrollado con **HTML**, **JavaScript (ES6)** y **Tailwind CSS**.

### 🧱 Estructura del Proyecto

```
frontend/
├── js/
│   ├── script.js          # Lógica de login y redirección
│   ├── services.js        # CRUD y filtrado de servicios
│   ├── landing.js         # Lógica de página de bienvenida
│   ├── notification.js    # Sistema de notificaciones visuales
│   └── confirmModal.js    # Modal de confirmación para acciones críticas
├── index.html             # Login
├── register.html          # Registro
├── landing.html           # Página de bienvenida
└── services.html          # Panel de gestión de servicios
```

---

## ✨ Mejoras y Funcionalidades Destacadas

- Autenticación JWT y protección de rutas  
- Navbar fijo con navegación global  
- Dropdown interactivo para selección de categorías  
- Filtro en tiempo real al escribir en el selector  
- Categorías ordenadas alfabéticamente  
- Visualización de categorías seleccionadas como **tags eliminables**  
- Mensajes de notificación personalizados (éxito/error)  
- Modal para confirmar eliminación de servicios  
- Mostrar botones de "Gestionar" solo para propietarios y admins  

---

## 🛠️ Tecnologías Utilizadas

| Tecnología       | Propósito                  |
|------------------|-----------------------------|
| Python 3.9       | Backend                     |
| FastAPI          | API REST                    |
| PostgreSQL       | Base de datos relacional    |
| bcrypt, passlib  | Hasheo de contraseñas       |
| JWT              | Autenticación               |
| Docker           | Contenerización             |
| HTML, JS (ES6)   | Interfaz de usuario         |
| Tailwind CSS     | Estilos modernos y rápidos  |
| Git              | Control de versiones        |

---

## 💻 Ejecución del Proyecto

### 1. Clonar el Repositorio

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

- Frontend disponible en: http://localhost:3000

---

## 🧪 Pruebas con Postman

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

### Endpoints adicionales

- `GET /services/` – Listar servicios  
- `GET /services/my/` – Ver servicios propios  
- `GET /services/{id}` – Ver detalle  
- `PUT /services/{id}` – Editar  
- `DELETE /services/{id}` – Eliminar  
- `GET /landing-categories/` – Categorías destacadas  

---

## 📌 Próximos Pasos

### Backend

- Validación estricta de categoría al crear/editar servicio  
- Mejoras en control de acceso por roles  
- Modularización de servicios

### Frontend

- Completar interfaz para editar y eliminar servicios  
- Mejorar experiencia de usuario con feedback visual  
- Validaciones de formularios más intuitivas  
- Confirmación visual de acciones exitosas

---

## 🤝 Contribuciones

Pull requests, sugerencias y aportes son bienvenidos.  
Este proyecto está en constante desarrollo y agradecemos el apoyo de la comunidad.

---

## 📄 Licencia

Distribuido bajo la **Licencia MIT**.  
Consulta el archivo `LICENSE` para más detalles.