# ====================================
# ShopyMarket Backend — Dockerfile
# ====================================
# Base: Node.js 20 Alpine (ligero ~180MB)
# Función: API Express + inicializador de DB

FROM node:20-alpine

# Crear directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar archivos de dependencias primero (aprovecha cache de Docker)
COPY package.json package-lock.json ./

# Instalar dependencias de producción
RUN npm ci --omit=dev

# Copiar el resto del código fuente
COPY . .

# Crear directorios de uploads si no existen
RUN mkdir -p uploads/product_images \
            uploads/profile_images \
            uploads/service_images \
            uploads/store_images

# Puerto que expone el servidor Express
EXPOSE 3000

# Comando de inicio:
# 1. Ejecuta initializer.js para crear tablas y datos iniciales
# 2. Inicia el servidor Express
CMD ["sh", "-c", "node initializer.js && node index.js"]
