\# RedFreelance - Sistema de Autenticación (Auth Service)



Este repositorio contiene la implementación inicial del microservicio de autenticación (`auth-service`) para la plataforma "RedFreelance". Este servicio es el pilar de seguridad de la aplicación, encargado de gestionar el registro, login y la autorización de usuarios (clientes y freelancers) mediante tokens JWT.



---



\## 🚀 Progreso Actual



Hemos completado las funcionalidades principales del `auth-service`, incluyendo:



\* \*\*Configuración de la Infraestructura:\*\*

&nbsp;   \* `Dockerfile` para la creación de imágenes de FastAPI.

&nbsp;   \* `docker-compose.yml` para la orquestación del servicio en un contenedor Docker, incluyendo persistencia de datos SQLite (`auth.db`).

&nbsp;   \* Configuración de "Hot Reload" para desarrollo ágil.



\* \*\*Gestión de Usuarios:\*\*

&nbsp;   \* \*\*Registro (`POST /register`)\*\*: Creación segura de nuevas cuentas con email, contraseña hasheada y rol (`client` o `freelancer`).

&nbsp;   \* \*\*Login (`POST /token`)\*\*: Autenticación de usuarios y emisión de JWTs (JSON Web Tokens) que incluyen el email y el rol del usuario.

&nbsp;   \* \*\*Identificación del Usuario Actual (`GET /me/`)\*\*: Ruta protegida que devuelve la información del usuario autenticado a partir de su JWT.



\* \*\*Autorización Basada en Roles:\*\*

&nbsp;   \* Implementación de una dependencia en FastAPI (`get\_current\_active\_user\_by\_role`) para restringir el acceso a rutas según el rol del usuario (ej. solo `client`, solo `freelancer`, solo `admin`).

&nbsp;   \* Validación de roles exitosa mediante pruebas, asegurando que los usuarios solo accedan a los recursos permitidos para su tipo de rol.



---



\## 🛠️ Tecnologías Utilizadas



\* \*\*Backend:\*\* Python 3.9

\* \*\*Framework Web:\*\* FastAPI

\* \*\*Base de Datos:\*\* SQLite (SQLAlchemy ORM)

\* \*\*Autenticación:\*\* JWT (JSON Web Tokens)

\* \*\*Hashing de Contraseñas:\*\* bcrypt (vía Passlib)

\* \*\*Contenerización:\*\* Docker \& Docker Compose

\* \*\*Control de Versiones:\*\* Git



---



\## 💻 Cómo Ejecutar el Servicio



Para poner en marcha el `auth-service` en tu entorno local:



1\.  \*\*Clona este repositorio:\*\*

&nbsp;   ```bash

&nbsp;   git clone \[https://docs.github.com/es/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility](https://docs.github.com/es/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility)

&nbsp;   cd RedFreelance

&nbsp;   ```

&nbsp;   (Si aún no lo tienes en GitHub, solo asegúrate de estar en la carpeta `RedFreelance`)



2\.  \*\*Inicia Docker Compose:\*\*

&nbsp;   Asegúrate de tener Docker Desktop (o Docker Engine) instalado y ejecutándose.

&nbsp;   Desde la raíz del proyecto (`RedFreelance`), ejecuta:

&nbsp;   ```bash

&nbsp;   docker-compose up

&nbsp;   ```

&nbsp;   Esto construirá la imagen del servicio (si es la primera vez o hay cambios en el `Dockerfile`) y levantará el contenedor. El servicio estará accesible en `http://localhost:8000`.



---



\## 🧪 Cómo Probar el Servicio (Usando Postman)



Una vez que el servicio esté corriendo (`docker-compose up`), puedes usar Postman (o cualquier cliente HTTP) para interactuar con los endpoints:



\### 1. Registrar un Usuario (`POST /register`)



\* \*\*URL:\*\* `http://localhost:8000/register`

\* \*\*Método:\*\* `POST`

\* \*\*Headers:\*\* `Content-Type: application/json`

\* \*\*Body (raw, JSON):\*\*

&nbsp;   ```json

&nbsp;   {

&nbsp;     "email": "tu\_email@example.com",

&nbsp;     "password": "tu\_password\_segura",

&nbsp;     "role": "client" // O "freelancer", o "admin"

&nbsp;   }

&nbsp;   ```

\* \*\*Respuesta:\*\* `201 Created` con los datos del usuario registrado.



\### 2. Iniciar Sesión y Obtener Token (`POST /token`)



\* \*\*URL:\*\* `http://localhost:8000/token`

\* \*\*Método:\*\* `POST`

\* \*\*Body (x-www-form-urlencoded):\*\*

&nbsp;   \* `username`: `tu\_email@example.com`

&nbsp;   \* `password`: `tu\_password\_segura`

\* \*\*Respuesta:\*\* `200 OK` con un `access\_token` y `token\_type: "bearer"`. \*\*Copia este `access\_token`\*\*.



\### 3. Obtener Información del Usuario Actual (`GET /me/`)



\* \*\*URL:\*\* `http://localhost:8000/me/`

\* \*\*Método:\*\* `GET`

\* \*\*Headers:\*\*

&nbsp;   \* `Authorization`: `Bearer TU\_ACCESS\_TOKEN\_AQUÍ` (reemplaza con el token obtenido en el paso anterior).

\* \*\*Respuesta:\*\* `200 OK` con los detalles del usuario asociado al token.



\### 4. Probar Autorización por Roles (Ejemplos)



Para probar estas rutas, necesitarás un token de un usuario con el rol correspondiente.



\* \*\*Acceso a Dashboard de Cliente (`GET /client-dashboard/`)\*\*

&nbsp;   \* \*\*URL:\*\* `http://localhost:8000/client-dashboard/`

&nbsp;   \* \*\*Método:\*\* `GET`

&nbsp;   \* \*\*Headers:\*\* `Authorization: Bearer <TOKEN\_DE\_CLIENTE>`

&nbsp;   \* \*\*Respuesta Esperada:\*\* `200 OK` si el token es de un `client`. `403 Forbidden` si es de otro rol.



\* \*\*Acceso a Perfil de Freelancer (`GET /freelancer-profile/`)\*\*

&nbsp;   \* \*\*URL:\*\* `http://localhost:8000/freelancer-profile/`

&nbsp;   \* \*\*Método:\*\* `GET`

&nbsp;   \* \*\*Headers:\*\* `Authorization: Bearer <TOKEN\_DE\_FREELANCER>`

&nbsp;   \* \*\*Respuesta Esperada:\*\* `200 OK` si el token es de un `freelancer`. `403 Forbidden` si es de otro rol.



\* \*\*Acceso a Panel de Administrador (`GET /admin-panel/`)\*\*

&nbsp;   \* \*\*URL:\*\* `http://localhost:8000/admin-panel/`

&nbsp;   \* \*\*Método:\*\* `GET`

&nbsp;   \* \*\*Headers:\*\* `Authorization: Bearer <TOKEN\_DE\_ADMIN>`

&nbsp;   \* \*\*Respuesta Esperada:\*\* `200 OK` si el token es de un `admin`. `403 Forbidden` si es de otro rol.



---



\## 🚧 Próximos Pasos



El siguiente objetivo es integrar este `auth-service` con un frontend básico, comenzando por:



1\.  \*\*Configurar CORS\*\* (Cross-Origin Resource Sharing) en el `auth-service` para permitir la comunicación segura con la aplicación de frontend.

2\.  Desarrollar un frontend simple (HTML/CSS/JS) para probar el flujo completo de registro y login.



---

