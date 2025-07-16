# RedFreelance/auth-service/Dockerfile

# Usamos una imagen base oficial de Python para nuestra aplicación
# Elegimos una versión específica para asegurar consistencia
FROM python:3.9-slim-buster

# Establece el directorio de trabajo dentro del contenedor
# Aquí es donde se copiará y ejecutará tu código
WORKDIR /app

# Copia el archivo requirements.txt al directorio de trabajo
# Esto se hace primero para aprovechar el cacheo de Docker si las dependencias no cambian
COPY requirements.txt .

# Instala las dependencias de Python
# El flag --no-cache-dir reduce el tamaño de la imagen final
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo el código fuente de tu aplicación al directorio de trabajo
# El "." al final indica el directorio actual
COPY . .

# Expone el puerto en el que la aplicación FastAPI va a escuchar
# Por defecto, Uvicorn suele usar el puerto 8000
EXPOSE 8000

# Comando para ejecutar la aplicación cuando el contenedor se inicie
# "uvicorn main:app" inicia la aplicación 'app' dentro del módulo 'main.py'
# "--host 0.0.0.0" permite que el servidor escuche en todas las interfaces de red dentro del contenedor
# "--port 8000" especifica el puerto
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]