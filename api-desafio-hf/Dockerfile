# Usar imagen oficial de Node.js LTS
FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production

# Copiar el resto del código
COPY . .

# Exponer el puerto del backend
EXPOSE 3000

# Usuario no root por seguridad
USER node

# Comando para iniciar la aplicación
CMD ["npm", "start"]
