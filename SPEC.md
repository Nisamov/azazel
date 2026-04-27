# SocialMediaHikarune - Documento de Especificacion

## 1. Descripcion del Proyecto

**Nombre del Proyecto:** SocialMediaHikarune  
**Tipo de Proyecto:** Plataforma de Redes Sociales y Chat en Tiempo Real (Aplicacion Web)  
**Funcionalidad Principal:** Una plataforma moderna de chat y redes sociales con servidores, mensajes directos, perfiles de usuario, sistema de amigos y mensajeria en tiempo real usando WebSockets.  
**Usuarios Objetivo:** Usuarios generales que buscan una experiencia social similar a Discord con UI/UX moderna.  
**Plataformas Objetivo:** Navegadores web (escritorio y movil), aplicaciones moviles (PWA), aplicaciones de escritorio (Electron).

---

## 2. Stack Tecnologico

### Frontend
- **Framework:** SolidJS 1.8+
- **Herramienta de Build:** Vite 5.x
- **Estilos:** SCSS + Variables CSS
- **Gestion de Estado:** SolidJS Stores + Context
- **Tiempo Real:** Socket.io Client
- **PWA:** Vite PWA Plugin

### Backend
- **Runtime:** Node.js 20+ (compatible con aarch64)
- **Framework:** Express.js
- **Tiempo Real:** Socket.io Server
- **Base de Datos:** better-sqlite3 (SQLite)
- **Autenticacion:** JWT + bcrypt

### DevOps (aarch64)
- **Contenedor:** Docker con soporte multi-arch
- **Build:** Buildx para aarch64/amd64

---

## 3. Especificacion de UI/UX

### Paleta de Colores
```scss
// Colores Primarios
--primary: #6366f1;          // Indigo
--primary-hover: #4f46e5;
--secondary: #8b5cf6;        // Violeta

// Colores de Fondo
--bg-primary: #0f0f23;       // Azul oscuro
--bg-secondary: #1a1a2e;
--bg-tertiary: #16213e;
--bg-card: #1e1e3f;

// Colores de Texto
--text-primary: #f8fafc;
--text-secondary: #94a3b8;
--text-muted: #64748b;

// Colores de Acento
--accent-success: #10b981;
--accent-warning: #f59e0b;
--accent-error: #ef4444;
--accent-info: #3b82f6;

// Borde y Divisor
--border-color: #2d2d4a;
--divider: #1e1e3f;
```

### Tipografia
- **Fuente Principal:** "Inter", system-ui, sans-serif
- **Monoespaciada:** "JetBrains Mono", monospace
- **Encabezados:** peso 700
- **Cuerpo:** peso 400
- **Tamanos de Fuente:**
  - h1: 2rem (32px)
  - h2: 1.5rem (24px)
  - h3: 1.25rem (20px)
  - body: 0.9375rem (15px)
  - small: 0.8125rem (13px)

### Estructura del Layout

#### Layout Principal (Escritorio)
```
┌─────────────────────────────────────────────────────────┐
│  Sidebar (72px)  │  Lista de Servidores│  Vista de Canal │
│                  │   (240px)           │    (flex)       │
│  - Inicio        │                     │                 │
│  - MDs           │  - Servidores       │  - Encabezado   │
│  - Ajustes       │  - Categorias       │  - Mensajes     │
│                  │                     │  - Area de Input│
└─────────────────────────────────────────────────────────┘
```

#### Layout Movil
```
┌─────────────────────┐
│ Barra Superior (48px) │
├─────────────────────┤
│                     │
│  Contenido Principal│
│    (flex)           │
│                     │
├─────────────────────┤
│Navegacion Inferior (56px) │
└─────────────────────┘
```

### Puntos de Interrupcion (Responsive)
- **Movil:** < 640px
- **Tableta:** 640px - 1024px
- **Escritorio:** > 1024px

### Componentes

#### Botones
- Primario: fondo `--primary`, texto blanco, radio 8px
- Secundario: transparente, borde `--primary`
- Fantasma: transparente, hover: `--bg-tertiary`
- Estados: hover (aclarar 10%), active (oscurecer 5%), disabled (50% opacidad)

#### Campos de Entrada
- Fondo: `--bg-tertiary`
- Borde: 1px solido `--border-color`
- Focus: borde `--primary` brillante
- Padding: 12px 16px
- Radio: 8px

#### Tarjetas
- Fondo: `--bg-card`
- Borde: 1px solido `--border-color`
- Radio: 12px
- Padding: 16px

#### Iconos de Servidor
- Tamano: 48px (escritorio), 40px (movil)
- Radio: 50% (circular)
- Indicador activo: punto blanco de 8px

#### Burbujas de Mensaje
- Ancho maximo: 70% del contenedor
- Padding: 8px 12px
- Radio: 12px (con cola en el lado del remitente)

---

## 4. Especificacion de Funcionalidades

### 4.1 Autenticacion
- [ ] Registro de usuario (username, email, password)
- [ ] Inicio de sesion de usuario (tokens JWT)
- [ ] Hash de contrasenas con bcrypt
- [ ] Gestion de sesiones
- [ ] Funcionalidad de cierre de sesion

### 4.2 Gestion de Usuarios
- [ ] Perfil de usuario (avatar, bio, estado)
- [ ] Editar ajustes de perfil
- [ ] Eliminar cuenta
- [ ] Presencia de usuario (online/offline/away/dnd)

### 4.3 Sistema de Amigos
- [ ] Enviar solicitud de amistad
- [ ] Aceptar/rechazar solicitud de amistad
- [ ] Eliminar amigo
- [ ] Bloquear usuario
- [ ] Mostrar lista de amigos

### 4.4 Servidores (Comunidades)
- [ ] Crear servidor
- [ ] Unirse a servidor mediante codigo de invitacion
- [ ] Salir de servidor
- [ ] Ajustes de servidor (nombre, icono)
- [ ] Eliminar servidor (solo propietario)

### 4.5 Canales
- [ ] Canales de texto
- [ ] Canales de voz (futuro)
- [ ] Crear canal
- [ ] Editar canal
- [ ] Eliminar canal
- [ ] Permisos de canal

### 4.6 Mensajeria
- [ ] Enviar mensajes de texto
- [ ] Editar mensajes
- [ ] Eliminar mensajes
- [ ] Soporte de Markdown (negrita, cursiva, codigo, enlaces)
- [ ] Soporte de emojis
- [ ] Archivos adjuntos
- [ ] Marcas de tiempo de mensajes

### 4.7 Mensajes Directos
- [ ] Iniciar MD con usuario
- [ ] Historial de mensajes de MD
- [ ] Indicadores de no leidos

### 4.8 Funcionalidades en Tiempo Real
- [ ] Actualizaciones de mensajes en vivo via WebSocket
- [ ] Indicadores de escritura de usuario
- [ ] Actualizaciones de estado en linea
- [ ] Actualizaciones de miembros del servidor

### 4.9 Explorar
- [ ] Descubrir servidores publicos
- [ ] Categorias de servidores
- [ ] Buscar servidores

### 4.10 Ajustes
- [ ] Ajustes de cuenta
- [ ] Apariencia (cambio de tema)
- [ ] Preferencias de notificaciones
- [ ] Ajustes de privacidad

---

## 5. Especificacion de API

### Endpoints de Autenticacion
```
POST   /api/auth/register     - Crear nuevo usuario
POST   /api/auth/login        - Iniciar sesion de usuario
POST   /api/auth/logout       - Cerrar sesion de usuario
GET    /api/auth/me           - Obtener usuario actual
PUT    /api/auth/profile      - Actualizar perfil
DELETE /api/auth/account      - Eliminar cuenta
```

### Endpoints de Usuario
```
GET    /api/users             - Listar usuarios
GET    /api/users/:id         - Obtener usuario por ID
GET    /api/users/search      - Buscar usuarios
POST   /api/users/friend      - Enviar solicitud de amistad
PUT    /api/users/friend      - Responder a solicitud de amistad
DELETE /api/users/friend/:id  - Eliminar amigo
POST   /api/users/block       - Bloquear usuario
DELETE /api/users/block/:id   - Desbloquear usuario
```

### Endpoints de Servidor
```
GET    /api/servers           - Listar servidores del usuario
POST   /api/servers           - Crear servidor
GET    /api/servers/:id       - Obtener servidor
PUT    /api/servers/:id       - Actualizar servidor
DELETE /api/servers/:id       - Eliminar servidor
POST   /api/servers/:id/join  - Unirse a servidor
POST   /api/servers/:id/leave - Salir de servidor
GET    /api/servers/invite    - Generar invitacion
```

### Endpoints de Canal
```
GET    /api/servers/:id/channels         - Listar canales
POST   /api/servers/:id/channels         - Crear canal
PUT    /api/channels/:id                  - Actualizar canal
DELETE /api/channels/:id                  - Eliminar canal
```

### Endpoints de Mensaje
```
GET    /api/channels/:id/messages        - Obtener mensajes
POST   /api/channels/:id/messages        - Enviar mensaje
PUT    /api/messages/:id                 - Editar mensaje
DELETE /api/messages/:id                 - Eliminar mensaje
```

### Eventos WebSocket
```
// Cliente -> Servidor
join_channel
leave_channel
send_message
typing_start
typing_stop
update_presence

// Servidor -> Cliente
new_message
message_updated
message_deleted
user_joined
user_left
typing
presence_update
```

---

## 6. Esquema de Base de Datos

### Tabla de Usuarios
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  avatar TEXT,
  bio TEXT,
  status TEXT DEFAULT 'offline',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla de Servidores
```sql
CREATE TABLE servers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  owner_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);
```

### Tabla de Canales
```sql
CREATE TABLE channels (
  id TEXT PRIMARY KEY,
  server_id TEXT,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'text',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (server_id) REFERENCES servers(id)
);
```

### Tabla de Mensajes
```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  edited_at DATETIME,
  FOREIGN KEY (channel_id) REFERENCES channels(id),
  FOREIGN KEY (author_id) REFERENCES users(id)
);
```

### Tabla de Amigos
```sql
CREATE TABLE friends (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  friend_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (friend_id) REFERENCES users(id)
);
```

### Tabla de Miembros de Servidor
```sql
CREATE TABLE server_members (
  id TEXT PRIMARY KEY,
  server_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  nickname TEXT,
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (server_id) REFERENCES servers(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 7. Configuracion de Servidor aarch64

### Configuracion de Docker
- Imagen base: node:20-alpine (multi-arch)
- Compilar para: linux/arm64, linux/amd64
- Usuario de produccion: node (no root)

### Variables de Entorno
```env
# Servidor
PORT=3001
NODE_ENV=production

# Base de Datos
DATABASE_PATH=./data/hikarune.db

# JWT
JWT_SECRET=tu-clave-secreta-cambiar-en-produccion
JWT_EXPIRES_IN=7d

# URL del Frontend
CLIENT_URL=http://localhost:5173

# URL de WS (para produccion)
WS_URL=ws://localhost:3001
```

### Scripts de Build
- Desarrollo: `pnpm dev`
- Build: `pnpm build`
- Iniciar produccion: `pnpm start`
- Build Docker: `docker buildx build --platform linux/arm64,linux/amd64`

---

## 8. Configuracion PWA

### Manifiesto de la Aplicacion Web
- Nombre: Hikarune
- Nombre corto: Hikarune
- Color de tema: #6366f1
- Color de fondo: #0f0f23
- Display: standalone
- Iconos: 192x192, 512x512

### Service Worker
- Cache: activos estaticos, respuestas de API
- Soporte sin conexion: cache basico
- Notificaciones push: caracteristica futura

---

## 9. Estructura de Archivos

```
azazel/ # Nombre del proyecto / el nombre de la red es diferente
├── client/                    # Frontend (SolidJS)
│   ├── public/
│   │   ├── icons/
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── stores/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── server/                    # Backend (Express + Socket.io)
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── db/
│   │   ├── socket/
│   │   ├── utils/
│   │   └── index.ts
│   ├── data/
│   └── package.json
│
├── docker/
│   ├── Dockerfile.client
│   ├── Dockerfile.server
│   └── docker-compose.yml
│
├── SPEC.md
└── README.md
```

---

## 10. Criterios de Aceptacion

### Funcionalidad Principal
- [ ] Los usuarios pueden registrarse e iniciar sesion
- [ ] Los usuarios pueden crear y unirse a servidores
- [ ] Los usuarios pueden crear y usar canales de texto
- [ ] Los mensajes se envian y reciben en tiempo real
- [ ] La presencia del usuario se actualiza en vivo

### UI/UX
- [ ] El tema oscuro coincide con la paleta de colores
- [ ] El diseño responsivo funciona en movil/escritorio
- [ ] Animaciones y transiciones suaves
- [ ] Estados de carga para operaciones asincronas

### Rendimiento
- [ ] Carga inicial < 3 segundos
- [ ] Entrega de mensajes < 100ms
- [ ] Desplazamiento suave en listas de mensajes

### Soporte aarch64
- [ ] Las imagenes Docker se compilan para arm64
- [ ] Node.js se ejecuta en servidores aarch64
- [ ] SQLite funciona en aarch64

### PWA
- [ ] Instalable en dispositivos moviles
- [ ] Funciona sin conexion (basico)
- [ ] Iconos de aplicacion apropiados