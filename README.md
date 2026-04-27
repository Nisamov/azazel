# SocialMediaHikarune

Una plataforma moderna de redes sociales y chat en tiempo real construida con SolidJS y Node.js, similar a Nerimity.

- **Mensajeria en Tiempo Real** - Mensajeria instantanea alimentada por WebSocket
- **Servidores y Canales** - Crear y gestionar comunidades con canales de texto
- **Mensajes Directos** - Conversaciones privadas con amigos
- **Perfiles de Usuario** - Perfiles personalizables con avatares y biografias
- **Sistema de Amigos** - Agregar amigos, enviar solicitudes, bloquear usuarios
- **Soporte PWA** - Instalable en movil y escritorio
- **Preparado para aarch64** - Construido para servidores ARM64

### Frontend
- **SolidJS** - Framework de UI reactivo
- **Vite** - Herramienta de construccion con soporte PWA
- **Socket.io Client** - Comunicacion en tiempo real
- **SCSS** - Estilos

### Backend
- **Node.js** - Entorno de JavaScript
- **Express** - Framework web
- **Socket.io** - Servidor WebSocket
- **better-sqlite3** - Base de datos SQLite
- **JWT** - Autenticacion
- **bcryptjs** - Hash de contrasenas

## Requisitos Previos

- Node.js 20+
- pnpm 8+ (recomendado) o npm

## Inicio Rapido

### Desarrollo

```bash
# Instalar dependencias
pnpm install

# Iniciar servidores de desarrollo
pnpm dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

### Produccion

```bash
# Compilar para produccion
pnpm build

# Iniciar servidor de produccion
pnpm start
```

## Despliegue con Docker

### Compilar para aarch64 (ARM64)

```bash
# Compilar imagenes Docker
docker buildx build --platform linux/arm64,linux/amd64 -f docker/Dockerfile.server .
docker buildx build --platform linux/arm64,linux/amd64 -f docker/Dockerfile.client .
```

### Ejecutar con Docker Compose

```bash
# Copiar archivo de entorno
cp server/.env.example server/.env

# Iniciar contenedores
docker-compose -f docker/docker-compose.yml up
```

## Estructura del Proyecto

```
SocialMediaHikarune/
├── client/                 # Frontend (SolidJS)
│   ├── src/
│   │   ├── components/    # Componentes UI
│   │   ├── pages/         # Componentes de pagina
│   │   ├── stores/        # Gestion de estado
│   │   ├── styles/       # Estilos globales
│   │   └── utils/        # Utilidades
│   ├── public/           # Activos estaticos
│   └── vite.config.ts   # Configuracion de Vite
│
├── server/                # Backend (Express)
│   ├── src/
│   │   ├── controllers/  # Controladores de rutas
│   │   ├── db/          # Configuracion de base de datos
│   │   ├── middleware/   # Middleware de Express
│   │   ├── routes/      # Rutas API
│   │   ├── socket/      # Manejadores de Socket.io
│   │   └── index.ts     # Punto de entrada del servidor
│   └── data/            # Base de datos SQLite
│
├── docker/               # Configuracion de Docker
│   ├── Dockerfile.client
│   ├── Dockerfile.server
│   └── docker-compose.yml
│
├── SPEC.md              # Especificacion del proyecto
└── README.md
```

## Endpoints de API

### Autenticacion
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesion de usuario
- `POST /api/auth/logout` - Cerrar sesion de usuario
- `GET /api/auth/me` - Obtener usuario actual
- `PUT /api/auth/profile` - Actualizar perfil
- `DELETE /api/auth/account` - Eliminar cuenta

### Servidores
- `GET /api/servers` - Listar servidores del usuario
- `POST /api/servers` - Crear servidor
- `GET /api/servers/:id` - Obtener servidor
- `PUT /api/servers/:id` - Actualizar servidor
- `DELETE /api/servers/:id` - Eliminar servidor
- `POST /api/servers/:id/join` - Unirse a servidor
- `POST /api/servers/:id/leave` - Salir de servidor

### Canales
- `GET /api/servers/:id/channels` - Listar canales
- `POST /api/servers/:id/channels` - Crear canal

### Mensajes
- `GET /api/channels/:id/messages` - Obtener mensajes
- `POST /api/channels/:id/messages` - Enviar mensaje
- `PUT /api/messages/:id` - Editar mensaje
- `DELETE /api/messages/:id` - Eliminar mensaje

### Usuarios
- `GET /api/users` - Listar usuarios
- `GET /api/users/search` - Buscar usuarios
- `POST /api/users/friend` - Agregar amigo
- `POST /api/users/block` - Bloquear usuario

## Eventos WebSocket

### Cliente a Servidor
- `join_channel` - Unirse a un canal
- `leave_channel` - Salir de un canal
- `send_message` - Enviar un mensaje
- `typing_start` - Iniciar escritura
- `typing_stop` - Detener escritura
- `update_presence` - Actualizar estado

### Servidor a Cliente
- `new_message` - Nuevo mensaje recibido
- `message_updated` - Mensaje editado
- `message_deleted` - Mensaje eliminado
- `typing` - Indicador de escritura del usuario
- `presence_update` - Estado del usuario cambiado
- `user_online` - Usuario se conecto
- `user_offline` - Usuario se desconecto

## Configuracion PWA

La aplicacion esta configurada como Progressive Web App:
- Instalable en movil y escritorio
- Soporte sin conexion para contenido en cache
- Notificaciones push listas (futuro)

## Variables de Entorno

```env
# Servidor
PORT=3001
NODE_ENV=production

# Base de datos
DATABASE_PATH=./data/hikarune.db

# JWT
JWT_SECRET=tu-clave-secreta
JWT_EXPIRES_IN=7d

# URL del Frontend
CLIENT_URL=http://localhost:5173
```

## Licencia

GPL-3.0 - Ver archivo LICENSE para detalles.

## Agradecimientos

- Inspirado por [Nerimity](https://github.com/Nerimity/nerimity-web)
- Construido con [SolidJS](https://www.solidjs.com/)
- Tiempo real alimentado por [Socket.io](https://socket.io/)