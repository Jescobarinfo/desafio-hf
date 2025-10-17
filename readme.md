# Desafío HF - Sistema de Gestión de Productos

Sistema completo de gestión de productos con Frontend React, Backend Node.js y PostgreSQL.

## ✨ Características

- 🔐 CRUD completo de productos y categorías
- 📊 Carga masiva de productos (bulk upload)
- 🔍 Filtrado avanzado por nombre y categoría
- 🐳 Despliegue con Docker en un solo comando
- 🗄️ Base de datos normalizada PostgreSQL
- 🎨 Interfaz React moderna e intuitiva
- 🏥 Healthchecks configurados en todos los servicios
- 💾 Persistencia de datos con volúmenes Docker

## 🛠️ Tecnologías Utilizadas

### Frontend
- React.js
- Nginx (para servir archivos estáticos)

### Backend
- Node.js
- Express.js
- pg (PostgreSQL client)

### Base de Datos
- PostgreSQL 15

### DevOps
- Docker
- Docker Compose
- Multi-stage builds

---

## 🚀 Inicio Rápido

### Opción 1: Con Docker (Recomendado)

```bash
# 1. Clonar el repositorio
git clone https://github.com/Jescobarinfo/desafio-hf
cd desafio-hf

# 2. Levantar toda la aplicación
docker-compose up -d

# 3. Acceder a la aplicación
# Frontend: http://localhost
# Backend API: http://localhost:3000/api
```

### Opción 2: Sin Docker

```bash
# 1. Clonar el repositorio
git clone https://github.com/Jescobarinfo/desafio-hf
cd desafio-hf

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL locales

# 3. Crear base de datos PostgreSQL
createdb desafio_hf

# 4. Ejecutar script de inicialización
psql -U postgres -d desafio_hf -f database/init/01-init.sql

# 5. Instalar dependencias de backend
cd api-desafio-hf
npm install

# 6. Instalar dependencias de frontend
cd ../frontend-desafio-hf/products-frontend
npm install

# 7. Volver a la raíz del proyecto
cd ../..

# 8. Ejecutar todo con un comando
npm run dev
```

**Nota:** Asegúrate de tener PostgreSQL instalado y corriendo localmente en el puerto 5432.

---

## 📋 Requisitos Previos

- Docker Desktop instalado (versión 20.10 o superior)
- Docker Compose (incluido en Docker Desktop)

**Para ejecución sin Docker:**
- Node.js (versión 14 o superior)
- PostgreSQL 12 o superior
- npm o yarn

---

## 🏗️ Estructura de Contenedores

El proyecto consta de 3 contenedores independientes:

1. **PostgreSQL** - Base de datos (puerto 5432)
2. **Backend Node.js** - API REST (puerto 3000)
3. **Frontend React** - Aplicación web con Nginx (puerto 80)

---

## ⚙️ Configuración Inicial

### 1. Clonar o ubicarse en el directorio del proyecto

```bash
cd desafio-hf
```

### 2. Configurar variables de entorno (opcional)

Puedes modificar el archivo `.env` en la raíz del proyecto para personalizar:

```env
# Configuración de Base de Datos
DB_NAME=desafio_hf
DB_USER=postgres
DB_PASSWORD=8UMi6$e
DB_PORT=5432

# Puertos de los servicios
BACKEND_PORT=3000
FRONTEND_PORT=80
```

> ⚠️ **Nota de Seguridad:** Las credenciales mostradas son para desarrollo. En producción, usa contraseñas seguras y no las subas al repositorio.

**Nota sobre el Frontend:** El frontend se compila durante la construcción de la imagen Docker. La URL del backend (http://localhost:3000) se configura automáticamente en tiempo de build usando el valor de BACKEND_PORT del archivo `.env`.

---

## 🐳 Comandos Docker

### Levantar toda la aplicación

```bash
docker-compose up -d
```

Este comando:
- Construye las imágenes de backend y frontend
- Descarga la imagen de PostgreSQL
- Crea los contenedores
- Inicia todos los servicios
- Inicializa la base de datos con el script SQL

### Ver el estado de los contenedores

```bash
docker-compose ps
```

### Ver logs de todos los servicios

```bash
docker-compose logs -f
```

### Ver logs de un servicio específico

```bash
# Backend
docker-compose logs -f backend

# Frontend
docker-compose logs -f frontend

# Base de datos
docker-compose logs -f postgres
```

### Detener la aplicación

```bash
docker-compose down
```

### Detener y eliminar volúmenes (elimina datos de la BD)

```bash
docker-compose down -v
```

### Reconstruir las imágenes

Si haces cambios en el código, necesitas reconstruir:

```bash
docker-compose up -d --build
```

### Reconstruir un servicio específico

```bash
# Solo backend
docker-compose up -d --build backend

# Solo frontend
docker-compose up -d --build frontend
```

---

## 🌐 Acceso a la Aplicación

Una vez que los contenedores estén corriendo:

- **Frontend:** http://localhost
- **Backend API:** http://localhost:3000/api
- **PostgreSQL:** localhost:5432

---

## 📡 Endpoints de la API

### Productos

- `GET /api/products` - Obtener todos los productos
- `POST /api/products` - Crear un producto
- `PUT /api/products/:id` - Actualizar un producto
- `DELETE /api/products/:id` - Eliminar un producto
- `POST /api/products/bulk` - Carga masiva de productos

### Categorías

- `GET /api/category` - Obtener todas las categorías
- `POST /api/category` - Crear una categoría

---

## 📖 Ejemplos de Uso de la API

### Crear un producto

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop HP",
    "price": 599.99,
    "category_id": 1,
    "stock": 10,
    "description": "Laptop de alta gama"
  }'
```

### Listar productos

```bash
curl http://localhost:3000/api/products
```

### Obtener un producto específico

```bash
curl http://localhost:3000/api/products/1
```

### Actualizar un producto

```bash
curl -X PUT http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop HP Actualizada",
    "price": 549.99,
    "stock": 15
  }'
```

### Eliminar un producto

```bash
curl -X DELETE http://localhost:3000/api/products/1
```

### Crear una categoría

```bash
curl -X POST http://localhost:3000/api/category \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Electrónica",
    "description": "Productos electrónicos"
  }'
```

### Listar categorías

```bash
curl http://localhost:3000/api/category
```

---

## 🏥 Healthchecks

Los contenedores incluyen healthchecks:

- **PostgreSQL:** Verifica conexión cada 10 segundos
- **Backend:** Verifica endpoint `/api/products` cada 30 segundos
- **Frontend:** Verifica servidor nginx cada 30 segundos

---

## 💾 Persistencia de Datos

Los datos de PostgreSQL se almacenan en un volumen Docker llamado `postgres_data`, por lo que los datos persisten incluso si detienes los contenedores.

Para eliminar completamente los datos:

```bash
docker-compose down -v
```

---

## 🗄️ Conectarse a la Base de Datos

### Desde el host

```bash
psql -h localhost -U postgres -d desafio_hf
# Password: 8UMi6$e
```

### Desde el contenedor

```bash
docker-compose exec postgres psql -U postgres -d desafio_hf
```

---

## 🔄 Inicializar/Reinicializar la Base de Datos

Si necesitas recargar el script de inicialización (funciones y datos), ejecuta:

```bash
# Opción 1: Usar el script helper
./scripts/init-db.sh

# Opción 2: Manualmente
docker-compose exec -T postgres psql -U postgres -d desafio_hf < database/init/01-init.sql
```

**Nota importante:** El script de inicialización en `database/init/` solo se ejecuta automáticamente cuando se crea el volumen de PostgreSQL por primera vez. Si el contenedor se reinicia pero el volumen persiste, necesitas ejecutar el script manualmente.

Para empezar completamente desde cero:

```bash
docker-compose down -v  # Elimina volúmenes
docker-compose up -d    # Crea todo de nuevo
```

---

## 🔧 Solución de Problemas

### Error: "function sp_get_all_categories() does not exist"

Esto significa que necesitas ejecutar el script de inicialización:

```bash
./scripts/init-db.sh
```

### Los contenedores no inician

```bash
# Ver logs detallados
docker-compose logs

# Verificar que no haya conflictos de puertos
docker-compose ps
```

### El backend no se conecta a la base de datos

El backend espera a que PostgreSQL esté saludable gracias a `depends_on: condition: service_healthy`.

```bash
# Verificar salud de postgres
docker-compose ps postgres

# Ver logs del backend
docker-compose logs backend
```

### Cambios en el código no se reflejan

Reconstruye las imágenes:

```bash
docker-compose up -d --build
```

### Limpiar todo y empezar de cero

```bash
# Detener y eliminar contenedores, redes y volúmenes
docker-compose down -v

# Eliminar imágenes construidas
docker rmi desafio-hf-backend desafio-hf-frontend

# Levantar todo de nuevo
docker-compose up -d --build
```

---

## 🌐 Arquitectura de Red

Todos los contenedores están en la misma red Docker (`desafio-network`), lo que permite:

- El backend se conecta a PostgreSQL usando el hostname `postgres`
- El frontend puede comunicarse con el backend
- Aislamiento de la red del host

---

## ⚡ Optimizaciones de Producción

### Backend
- Usa imagen Alpine (ligera)
- Solo instala dependencias de producción
- Ejecuta como usuario no-root

### Frontend
- Build multi-stage (optimiza tamaño)
- Sirve archivos estáticos con Nginx
- Cache configurado para assets
- Headers de seguridad configurados

### Base de Datos
- Volumen persistente
- Healthcheck configurado
- Índices optimizados

---

## 📁 Estructura de Archivos Docker

```
desafio-hf/
├── docker-compose.yml          # Orquestación de contenedores
├── .env                        # Variables de entorno
├── .env.example               # Plantilla de variables
├── database/
│   └── init/
│       └── 01-init.sql        # Script de inicialización de BD
├── api-desafio-hf/
│   ├── Dockerfile             # Imagen del backend
│   └── .dockerignore          # Archivos a excluir
└── frontend-desafio-hf/
    └── products-frontend/
        ├── Dockerfile         # Imagen del frontend
        ├── nginx.conf         # Configuración de Nginx
        └── .dockerignore      # Archivos a excluir
```

---

## 🛠️ Comandos Útiles

### Ejecutar comandos dentro de un contenedor

```bash
# Shell en el backend
docker-compose exec backend sh

# Shell en la base de datos
docker-compose exec postgres bash

# Comando único en el backend
docker-compose exec backend npm list
```

### Inspeccionar volúmenes

```bash
# Listar volúmenes
docker volume ls

# Inspeccionar volumen de postgres
docker volume inspect desafio-hf_postgres_data
```

### Limpiar recursos de Docker

```bash
# Eliminar contenedores detenidos
docker container prune

# Eliminar imágenes sin usar
docker image prune

# Eliminar todo lo no usado
docker system prune -a
```

---

**Desarrollado como parte del Desafío HF - Octubre 2025**