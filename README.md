# 🔐 RedFreelance - Microservicio de Autenticación

¡Bienvenido al microservicio de autenticación (`auth-service`) de la plataforma **RedFreelance**!  
Este servicio gestiona el **registro**, **inicio de sesión** y **autorización** de usuarios mediante **JWT (JSON Web Tokens)**. Es el núcleo de seguridad de nuestro ecosistema de microservicios.

---

## 🚧 Estado del Proyecto

- ✅ Funcionalidades principales completadas  
- ✅ Autorización integrada en `service-service`  
- ✅ Frontend completamente funcional y estilizado  
- ✅ Filtro de servicios por freelancer implementado  
- ✅ CORS configurado correctamente en ambos microservicios  

---

## ⚙️ Infraestructura

- `Dockerfile`: Construcción de imagen para FastAPI  
- `docker-compose.yml`: Orquestación de servicios con PostgreSQL  
- Hot Reload: Desarrollo ágil y en tiempo real  

---

## 👤 Gestión de Usuarios (`auth-service`)

| Endpoint   | Método | Descripción |
|------------|--------|-------------|
| `/register` | POST   | Registro con contraseña hasheada y asignación de rol |
| `/token`    | POST   | Inicio de sesión y generación de JWT |
| `/me/`      | GET    | Obtener datos del usuario autenticado |

---

## 🔐 Autorización Basada en Roles

Se implementa middleware `get_current_active_user_by_role`, que controla acceso a rutas según el rol:

| Ruta                | Rol Requerido | Descripción                |
|---------------------|----------------|----------------------------|
| `/client-dashboard/`   | client         | Acceso para clientes        |
| `/freelancer-profile/` | freelancer     | Acceso para freelancers     |
| `/admin-panel/`         | admin          | Panel exclusivo de admins   |

---

## 💼 Gestión de Servicios (`service-service`)

| Endpoint              | Método | Acceso                   | Descripción |
|------------------------|--------|---------------------------|-------------|
| `/services/`           | POST   | Freelancers / Admin       | Crear nuevo servicio |
| `/services/`           | GET    | Público                   | Listar todos los servicios |
| `/services/my/`        | GET    | Freelancers / Admin       | Ver servicios del usuario |
| `/services/{id}`       | GET    | Público                   | Ver detalle de servicio |
| `/services/{id}`       | PUT    | Propietario / Admin       | Editar servicio existente |
| `/services/{id}`       | DELETE | Propietario / Admin       | Eliminar servicio |

---

## 🚀 Frontend

Interfaz de usuario construida con **HTML**, **CSS** y **JavaScript puro**, diseñada para consumir los microservicios.

### 🧱 Estructura

- `css/`:  
  - `base.css`: Estilos globales  
  - `auth.css`: Estilos para autenticación  
  - `services.css`: Estilos para gestión de servicios  
- `js/`:  
  - `script.js`: Lógica de login y navegación  
  - `services.js`: CRUD de servicios y filtrado  
- Páginas:  
  - `index.html`: Página principal y login  
  - `register.html`: Registro de nuevos usuarios  
  - `services.html`: Gestión y visualización de servicios  

### ✨ Características

- Manejo completo de tokens JWT y errores
- Alternancia entre "Mis Servicios" y "Todos los Servicios"
- Estilo moderno con tema oscuro

---

## 🛠️ Tecnologías Utilizadas

| Tecnología        | Propósito                           |
|-------------------|-------------------------------------|
| Python 3.9        | Backend principal                   |
| FastAPI           | Framework web                       |
| PostgreSQL        | Base de datos                       |
| psycopg2-binary   | Conector PostgreSQL para Python     |
| JWT               | Autenticación con tokens            |
| bcrypt / passlib  | Hasheo de contraseñas               |
| Docker            | Contenerización                     |
| Git               | Control de versiones                |
| aiosmtplib        | Envío de correos (verificación)     |
| HTML/CSS/JS       | Interfaz de usuario                 |

---

## 💻 Ejecución del Proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/tuusuario/RedFreelance.git
cd RedFreelance
```

### 2. Configurar variables de entorno

#### `auth-service/.env`

```env
SMTP_SERVER=smtp.ejemplo.com
SMTP_PORT=587
SMTP_USERNAME=usuario
SMTP_PASSWORD=clave
SENDER_EMAIL=noreply@redfreelance.com
VERIFICATION_TOKEN_EXPIRE_HOURS=24

DATABASE_URL="postgresql+psycopg2://user:password@db:5432/redfreelance_db"
SECRET_KEY="tu_clave_secreta"
```

#### `service-service/.env`

```env
DATABASE_URL="postgresql+psycopg2://user:password@db:5432/redfreelance_db"
SECRET_KEY="tu_clave_secreta"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 3. Levantar los servicios de backend

```bash
docker-compose up --build
```

- 🔗 Auth-Service: http://localhost:8000  
- 🔗 Service-Service: http://localhost:8001

### 4. Levantar el frontend

```bash
cd frontend
python -m http.server 3000
```

- 🌐 Frontend: http://localhost:3000

---

## 🧪 Pruebas (Postman o similar)

### 📝 Registro

```
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

### 🔐 Inicio de sesión

```
POST http://localhost:8000/token
Content-Type: application/x-www-form-urlencoded
```

```
username=ejemplo@correo.com
password=contraseña_segura
```

### 🙋 Obtener usuario actual

```
GET http://localhost:8000/me/
Authorization: Bearer <ACCESS_TOKEN>
```

### 🧩 Pruebas de roles

| Ruta                | Rol       | Método | Resultado Esperado |
|---------------------|-----------|--------|---------------------|
| /client-dashboard/  | client    | GET    | 200 OK / 403        |
| /freelancer-profile/| freelancer| GET    | 200 OK / 403        |
| /admin-panel/       | admin     | GET    | 200 OK / 403        |

---

## 🛠️ Pruebas de Servicios (`service-service`)

### ➕ Crear servicio

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

### 📄 Otros Endpoints

- **Listar todos**: `GET /services/`
- **Listar propios**: `GET /services/my/` (con token)
- **Obtener por ID**: `GET /services/{id}`
- **Actualizar**: `PUT /services/{id}`
- **Eliminar**: `DELETE /services/{id}`

---

## 📌 Próximos Pasos

- [ ] Búsqueda y filtrado en frontend (título, categoría, precio)  
- [ ] Microservicio `order-service`, `chat-service`, etc.  
- [ ] Mejorar gestión de errores y UX en frontend  

---

## 🤝 Contribuciones

¡Pull requests y sugerencias son siempre bienvenidas!  
Este proyecto está en constante evolución y abierto a la colaboración de la comunidad.

---

## 📄 Licencia

Distribuido bajo la **Licencia MIT**.  
Consulta el archivo `LICENSE` para más detalles.