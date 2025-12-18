<div align="center">

# 💻 Messenger Frontend

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0+-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-latest-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)

**Cliente web y móvil (PWA) para el sistema de gestión de entregas y mensajería.**

*Modern web and mobile (PWA) client for the delivery and courier management system.*

</div>

---

<details>
<summary><b>🇺🇸 English Version</b> (Click to expand)</summary>

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Features](#-features)
- [Setup & Installation](#️-setup--installation)
- [Scripts](#-scripts)

---

### 🔭 Overview

The **Messenger Frontend** is a modern Single Page Application (SPA) built with **React** and **Vite**, designed to provide two distinct user experiences:
1.  **Admin Dashboard**: A comprehensive web interface for administrators to manage employees, dealerships, and monitor service deliveries.
2.  **Messenger App**: A mobile-first Progressive Web App (PWA) for couriers to view their assigned tasks, update statuses, and track their routes.

---

### 💻 Tech Stack

| Component | Technology |
|-----------|------------|
| **Core** | React 19, TypeScript |
| **Build Tool** | Vite 7 |
| **Styling** | Tailwind CSS 4, CSS Modules |
| **UI Library** | shadcn/ui (Radix UI) |
| **Icons** | Lucide React |
| **Routing** | React Router DOM 7 |
| **Forms** | React Hook Form + Zod |
| **HTTP Client** | Axios |
| **Charts** | Recharts |
| **PWA** | Vite Plugin PWA |

---

### 📁 Project Structure

```
src/
├── components/          # Reusable UI components (shadcn/ui & custom)
├── context/             # Global state (Auth, Theme)
├── hooks/               # Custom React hooks
├── layouts/             # Role-based layouts
│   ├── AdminLayout.tsx      # Sidebar + Header for Admins
│   └── MessengerLayout.tsx  # Bottom Navigation for Mobile
├── lib/                 # Utilities and helpers (cn, formatters)
├── pages/               # Application Views
│   ├── admin/           # Admin-specific pages (Dashboard, Employees, etc.)
│   ├── messenger/       # Messenger-specific pages
│   └── Login.tsx        # Authentication page
├── routes/              # Route definitions and protection
├── services/            # API service integration
└── types/               # TypeScript type definitions
```

---

### ✨ Features

#### 🛡️ Admin Portal (Web)
- **Dashboard**: Real-time overview of system metrics.
- **Employee Management**: Create, edit, and manage courier accounts.
- **Dealership Management**: Manage client dealerships.
- **Service Monitoring**: Track deliveries in real-time.
- **Responsive Tables**: Advanced data tables with filtering and sorting.

#### 📱 Messenger App (Mobile PWA)
- **Mobile First Design**: Optimized for touch interactions.
- **Task List**: View assigned deliveries.
- **Status Updates**: Simple workflow to update delivery status.
- **PWA**: Installable on mobile devices.

---

### ⚙️ Setup & Installation

**Prerequisites:**
- Node.js 18+
- npm or yarn

**Installation:**

```bash
# Clone the repository
git clone <repository-url>
cd messenger-frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your backend API URL
```

**Running Locally:**

```bash
npm run dev
```

</details>

---

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Stack Tecnológico](#-stack-tecnológico-1)
- [Estructura del Proyecto](#-estructura-del-proyecto-1)
- [Funcionalidades](#-funcionalidades)
- [Configuración e Instalación](#️-configuración-e-instalación-1)
- [Scripts](#-scripts-1)

---

## 🔭 Descripción General

**Messenger Frontend** es una Single Page Application (SPA) moderna construida con **React** y **Vite**, diseñada para ofrecer dos experiencias de usuario distintas adaptadas a cada rol:

1.  **Panel de Administración**: Una interfaz web completa para administradores, optimizada para escritorio, que permite la gestión de empleados, concesionarios y monitoreo de entregas.
2.  **App de Mensajería**: Una Progressive Web App (PWA) diseñada para uso móvil, permitiendo a los mensajeros ver rutas, actualizar estados y gestionar sus entregas asignadas.

---

## 💻 Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| **Core** | React 19, TypeScript |
| **Build Tool** | Vite 7 |
| **Estilos** | Tailwind CSS 4, CSS Modules |
| **Librería UI** | shadcn/ui (basado en Radix UI) |
| **Iconos** | Lucide React |
| **Routing** | React Router DOM 7 |
| **Formularios** | React Hook Form + Zod |
| **Cliente HTTP** | Axios |
| **Gráficos** | Recharts |
| **PWA** | Vite Plugin PWA |

---

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes UI reutilizables (shadcn/ui & custom)
├── context/             # Estado global (AuthContext, ThemeContext)
├── hooks/               # Hooks personalizados
├── layouts/             # Layouts por rol
│   ├── AdminLayout.tsx      # Layout con Sidebar fijo (Escritorio)
│   └── MessengerLayout.tsx  # Layout con Navegación Inferior (Móvil)
├── lib/                 # Utilidades y helpers (cn, formatters)
├── pages/               # Vistas de la aplicación
│   ├── admin/           # Vistas de Administrador (Dashboard, Empleados...)
│   ├── messenger/       # Vistas de Mensajero (Dashboard móvil...)
│   └── Login.tsx        # Página de autenticación
├── routes/              # Definición y protección de rutas
├── services/            # Integración con Backend API
└── types/               # Definiciones de tipos TypeScript
```

---

## ✨ Funcionalidades

### 🛡️ Portal Administrativo (Web)
- **Dashboard Integrado**: Visualización métricas clave mediante gráficos interactivos.
- **Gestión de Empleados**: CRUD completo para administradores y mensajeros.
- **Gestión de Concesionarios**: Administración de puntos de recogida/entrega.
- **Gestión de Servicios**: Creación y monitoreo de solicitudes de servicio.
- **Tablas Avanzadas**: Filtrado, ordenamiento y paginación de datos.

### 📱 App de Mensajería (Móvil PWA)
- **Diseño Mobile-First**: Interfaz optimizada para pantallas táctiles y uso en campo.
- **Navegación Intuitiva**: Menú inferior para acceso rápido a secciones clave.
- **Gestión de Entregas**: Visualización clara de tareas asignadas y pendientes.
- **Instalable**: Soporte PWA para instalar en la pantalla de inicio del dispositivo.

---

## ⚙️ Configuración e Instalación

### Prerrequisitos
- Node.js 18+
- npm o yarn

### Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone <repository-url>
   cd messenger-frontend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Crea un archivo `.env` basado en `.env.example`:
   ```bash
   VITE_API_URL=http://localhost:8080/api
   ```

### Ejecución Local

Para iniciar el servidor de desarrollo:
```bash
npm run dev
```
La aplicación estará disponible típicamente en `http://localhost:5173`.

---

## 📜 Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo con Hot Module Replacement (HMR). |
| `npm run build` | Compila la aplicación para producción (TSC + Vite Build). |
| `npm run preview` | Previsualiza localmente la build de producción. |
| `npm run lint` | Ejecuta el linter (ESLint) para verificar la calidad del código. |
