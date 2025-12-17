# Messenger Frontend

Aplicación frontend para el sistema de mensajería y tracking de entregas.

## 📁 Estructura del Proyecto

```
src/
├── assets/                 # Imágenes, iconos estáticos
├── config/                 # Variables de entorno y configuración global
│   ├── env.ts              # Mapeo de import.meta.env
│   └── axios-client.ts     # Instancia de Axios con interceptores (JWT)
├── components/             # Componentes UI compartidos (Botones, Inputs, Modales)
│   ├── ui/                 # Componentes base (ej. Button.tsx)
│   └── layout/             # Layouts (Sidebar, Header, MainLayout)
├── hooks/                  # Hooks globales (ej. useOnlineStatus, useGeolocation)
├── context/                # Estado global síncrono (AuthContext, ThemeContext)
├── services/               # Lógica de conexión a bajo nivel (WebSockets base)
├── routes/                 # Definición de rutas (AppRouter)
├── utils/                  # Formateadores de fecha, validadores
├── features/               # LÓGICA DE NEGOCIO (Espejo del Backend)
│   ├── auth/               # Todo lo relacionado con Login/Refresh Token
│   │   ├── api/            # auth.service.ts (llamadas a AuthController)
│   │   ├── components/     # LoginForm.tsx
│   │   ├── hooks/          # useLogin.ts, useAuth.ts
│   │   └── types/          # Interfaces (AuthCredentials, TokenResponse)
│   ├── dealerships/        # Gestión de Concesionarios
│   │   ├── api/            # dealership.service.ts
│   │   ├── components/     # DealershipList.tsx, DealershipCard.tsx
│   │   └── types/          # Interfaces (Dealership, DealershipRequest)
│   ├── tracking/           # Tracking en vivo (WebSocket + Mapas)
│   │   ├── api/            # tracking.service.ts
│   │   ├── components/     # LiveMap.tsx, TrackingStatus.tsx
│   │   └── hooks/          # useLiveTracking.ts (Lógica de WebSocket)
│   └── service-delivery/   # Gestión de entregas
│       ├── api/
│       └── ...
├── pages/                  # Páginas que componen las features
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── LiveTrackingPage.tsx
│   └── NotFoundPage.tsx
├── App.tsx
└── main.tsx
```

## 🏗️ Arquitectura

### Features (Lógica de Negocio)

Cada feature sigue una estructura consistente que refleja el backend:

| Carpeta | Propósito |
|---------|-----------|
| `api/` | Servicios que consumen endpoints del backend |
| `components/` | Componentes React específicos de la feature |
| `hooks/` | Custom hooks para lógica de estado y efectos |
| `types/` | Interfaces y tipos TypeScript |

### Componentes Compartidos

- **`components/ui/`** - Componentes atómicos reutilizables (Button, Input, Modal)
- **`components/layout/`** - Estructuras de página (Sidebar, Header, MainLayout)

### Configuración

- **`config/env.ts`** - Centraliza las variables de entorno
- **`config/axios-client.ts`** - Instancia de Axios con interceptores para JWT

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build
```

## 🔧 Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/ws
```

## 📚 Tecnologías

- **React** + **TypeScript**
- **Vite** - Build tool
- **Axios** - Cliente HTTP
- **React Router** - Enrutamiento
- **WebSockets** - Comunicación en tiempo real

## 📄 Licencia

MIT License - Ver archivo [LICENSE](./LICENSE) para más detalles.
