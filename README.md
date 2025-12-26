<div align="center">

# 📱 PLAK Frontend

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](./LICENSE)

**Interfaz de usuario moderna y responsiva para el sistema de gestión de entregas PLAK.**

*Modern and responsive user interface for the PLAK delivery management system.*

</div>

---

<details>
<summary><b>🇺🇸 English Version</b> (Click to expand)</summary>

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Setup & Installation](#-setup--installation)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)

---

### ✨ Features

- **Mobile-First Design**: Optimized for messengers on the go.
- **Real-Time Tracking**: Live visualization of active messengers using Google Maps.
- **Digital Signatures**: Capture customer signatures directly on screen.
- **Evidence Management**: Upload multiple photos for delivery verification.
- **Role-Based Access**: Specialized interfaces for Admins and Messengers.
- **Authentication**: Secure JWT login with auto-refresh mechanism.
- **Dark Mode**: Built-in theme switching.

---

### 💻 Tech Stack

| Component | Technology |
|-----------|------------|
| **Core** | React 19, TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS v4, shadcn/ui |
| **Icons** | Lucide React |
| **Forms** | React Hook Form + Zod |
| **Maps** | @react-google-maps/api |
| **Animations** | Framer Motion |
| **HTTP Client** | Axios |

</details>

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación](#-instalación)
- [Variables de Entorno](#-variables-de-entorno)
- [Roles y Vistas](#-roles-y-vistas)

---

## ✨ Características

### 📱 Experiencia Móvil Optimizada
Diseñado pensando primero en los mensajeros. La interfaz se adapta perfectamente a dispositivos móviles, facilitando la gestión de entregas en terreno.

### 🗺️ Tracking y Mapas
- **Visualización en Vivo:** Los administradores pueden ver la ubicación de todos los mensajeros activos.
- **Geocodificación:** Los concesionarios se ubican automáticamente en el mapa.

### ✍️ Gestión de Evidencias
- **Firma Digital:** Componente integrado para capturar firmas táctiles.
- **Fotos:** Carga múltiple de imágenes (evidencia de entrega, fallos, etc.).
- **Validación:** Reglas estrictas para asegurar que cada entrega tenga su soporte.

### 🔒 Seguridad y Acceso
- **JWT Persistente:** Manejo automático de tokens de acceso y refresco.
- **Rutas Protegidas:** Redirección inteligente basada en roles (Admin vs Mensajero).

---

## 💻 Stack Tecnológico

| Componente | Tecnología | Descripción |
|------------|------------|-------------|
| **Core** | React 19 + TypeScript | Rendimiento y seguridad de tipos |
| **Build** | Vite | Entorno de desarrollo ultrarrápido |
| **Estilos** | Tailwind CSS v4 | Motor de estilos utility-first moderno |
| **UI Kit** | shadcn/ui | Componentes accesibles y personalizables |
| **Formularios** | React Hook Form + Zod | Validación robusta de datos |
| **Mapas** | Google Maps API | Integración nativa de mapas |
| **Animaciones** | Framer Motion | Transiciones fluidas y micro-interacciones |

---

## 📁 Estructura del Proyecto

```
src/
├── assets/              # Imágenes y recursos estáticos
├── components/          # Componentes reutilizables
│   ├── ui/              # Componentes base (shadcn/ui)
│   ├── Map.tsx          # Componente de Google Maps
│   ├── SignaturePad.tsx # Captura de firmas
│   └── ...
├── context/             # Estado global (Auth, Theme)
├── hooks/               # Custom hooks (useMobile, etc.)
├── layouts/             # Plantillas de estructuras (Admin, Messenger)
├── lib/                 # Utilidades y configuración (utils, axios)
├── pages/               # Vistas principales
│   ├── admin/           # Panel de control administrativo
│   ├── messenger/       # Vistas para mensajeros
│   └── Login.tsx        # Página de autenticación
├── services/            # Comunicación con API (Axios services)
└── types/               # Definiciones de tipos TypeScript
```

---

## 🚀 Instalación

### Prerrequisitos
- Node.js 18+
- npm o pnpm

### Pasos

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd messenger-frontend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar entorno**
   Crea un archivo `.env` en la raíz copiando `.env.example`:
   ```bash
   cp .env.example .env
   ```
   
   Luego edita `.env` y configura tus valores (ver siguiente sección).

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

---

## 🔐 Configuración de Seguridad

### Google Maps API Key

Esta aplicación requiere una Google Maps API Key para funcionalidades de mapas y geolocalización.

#### Pasos para configurar:

1. **Crear API Key**
   - Ir a [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Crear un nuevo proyecto o seleccionar uno existente
   - Click en "Create Credentials" → "API Key"

2. **Habilitar APIs necesarias**
   - [Maps JavaScript API](https://console.cloud.google.com/apis/library/maps-backend.googleapis.com)
   - [Geocoding API](https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com)

3. **Configurar restricciones de seguridad** (⚠️ CRÍTICO)
   - En la API Key creada, click en "Edit API key"
   - **Application restrictions:**
     - Seleccionar "HTTP referrers (websites)"
   - **Website restrictions:**
     - Agregar: `localhost:*` (para desarrollo local)
     - Agregar: `*.vercel.app/*` (para despliegues en Vercel)
     - Agregar tu dominio de producción si aplica
   - **API restrictions:**
     - Seleccionar "Restrict key"
     - Marcar solo: Maps JavaScript API y Geocoding API
   - Click en "Save"

4. **Configurar en el proyecto**
   - Copiar la API Key
   - Abrir el archivo `.env`
   - Reemplazar `your_google_maps_api_key_here` con tu key real

#### ⚠️ Advertencias de seguridad:

- **NUNCA** subir el archivo `.env` al repositorio (ya está en `.gitignore`)
- **SIEMPRE** configurar restricciones en la API Key
- **Si expones** accidentalmente la key, regenerarla inmediatamente en Google Cloud Console
- Monitorear el uso en [Google Cloud Console](https://console.cloud.google.com/apis/dashboard) regularmente

---

## 📜 Scripts Disponibles

En el directorio del proyecto, puedes ejecutar:

### `npm run dev`
Inicia la aplicación en modo de desarrollo.\
Abre [http://localhost:5173](http://localhost:5173) para verla en el navegador.

### `npm run build`
Construye la aplicación para producción en la carpeta `dist`.\
Optimiza React y minifica el código para el mejor rendimiento.

### `npm run lint`
Ejecuta el linter (ESLint) para encontrar y arreglar problemas en el código.

### `npm run preview`
Sirve localmente la versión de producción construida para probarla antes de desplegar.

---

## 📸 Capturas de Pantalla

| Dashboard Admin | Tracking en Vivo |
|:---:|:---:|
| ![Dashboard](../assets/dashboard-placeholder.png) | ![Tracking](../assets/tracking-placeholder.png) |
| *Vista general del sistema* | *Monitoreo en tiempo real* |

---

## 🚀 Despliegue

### Vercel (Recomendado)
La forma más fácil de desplegar es usando [Vercel](https://vercel.com).
1. Importa tu repositorio en Vercel.
2. Vercel detectará automáticamente que es un proyecto **Vite**.
3. Agrega las variables de entorno (`VITE_API_URL`, etc.).
4. ¡Despliega!

### Docker
También puedes crear una imagen Docker para servir los archivos estáticos con Nginx.

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 🔧 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# URL del Backend
VITE_API_URL=http://localhost:8080

# Google Maps API Key (con permisos de Maps JS API y Geocoding)
VITE_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
```

---

## 👥 Roles y Vistas

### 🛡️ Administrador (PLAK Admin)
Acceso total al sistema a través de un dashboard completo de escritorio (responsive).
- **Dashboard:** Estadísticas generales.
- **Empleados:** Gestión de usuarios (Admin/Messenger).
- **Concesionarios:** Gestión de puntos de entrega.
- **Servicios:** Vista detallada de todas las entregas.
- **Mapa:** Tracking en tiempo real.

### 🛵 Mensajero (PLAK Messenger)
Interfaz simplificada enfocada en la operatividad diaria.
- **Inicio:** Resumen de tareas pendientes.
- **Entregas:** Lista de servicios asignados.
- **Perfil:** Información personal y estado.

---

<div align="center">

**Made with ❤️ using React 19 & Tailwind**

</div>
