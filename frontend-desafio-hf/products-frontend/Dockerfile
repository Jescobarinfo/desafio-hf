# Multi-stage build para optimizar el tamaño de la imagen

# Etapa 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Argumento para la URL del API (puede ser sobrescrito en docker-compose)
ARG VITE_API_URL=http://localhost:3000

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código
COPY . .

# Crear archivo .env.production con la URL del API
RUN echo "VITE_API_URL=${VITE_API_URL}" > .env.production

# Construir la aplicación para producción
RUN npm run build

# Etapa 2: Producción con nginx
FROM nginx:alpine

# Copiar archivos build desde la etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
