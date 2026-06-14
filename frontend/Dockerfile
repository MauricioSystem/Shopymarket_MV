# ====================================
# ShopyMarket Frontend — Dockerfile
# ====================================
# Multi-stage build:
#   Stage 1: Build de Vite (genera archivos estáticos)
#   Stage 2: Nginx sirve los archivos estáticos

# ---- Stage 1: BUILD ----
FROM node:20-alpine AS build

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json ./

# Instalar TODAS las dependencias (incluyendo devDependencies para el build)
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# Variables de entorno que Vite necesita durante el BUILD
# Se pueden sobreescribir con --build-arg en docker-compose
ARG VITE_API_URL=http://localhost:3000
ARG VITE_AUTH_LOGIN_PATHS=/auth/login,/api/auth/login,/login
ARG VITE_AUTH_REGISTER_PATHS=/auth/register,/api/auth/register,/register

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AUTH_LOGIN_PATHS=$VITE_AUTH_LOGIN_PATHS
ENV VITE_AUTH_REGISTER_PATHS=$VITE_AUTH_REGISTER_PATHS

# Generar el build de producción
RUN npm run build

# ---- Stage 2: SERVE ----
FROM nginx:alpine

# Copiar la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos estáticos del build de Vite
COPY --from=build /app/dist /usr/share/nginx/html

# Puerto que expone Nginx
EXPOSE 80

# Nginx se ejecuta en foreground
CMD ["nginx", "-g", "daemon off;"]
