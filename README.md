> **Copyright (C) 2026 Mateo Valencia Ardila. Todos los derechos reservados. El código fuente de esta aplicación está protegido por las leyes de derechos de autor. Registro DNDA No. 13-108-139. Queda estrictamente prohibida su copia, distribución o modificación sin autorización expresa.**

<div align="center">

# PLAK - Messenger Frontend

<img src="https://img.shields.io/badge/Version-1.9.1-blue.svg" alt="Version">

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.2-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Unit-brightgreen?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-Propietario-red.svg?style=for-the-badge)](LICENSE)

**Plataforma de alta ingeniería para gestión de mensajería.**

*Interfaz robusta • Arquitectura Offline-First • Rastreo de flota en tiempo real • Estrategia de pruebas integral*

---

[🇺🇸 English Version](README.en.md) • [Características](#-características-principales) • [Capturas](#-capturas-de-pantalla) • [Tecnologías](#-stack-tecnológico) • [Instalación](#-instalación-y-despliegue) • [Arquitectura](#-arquitectura-del-proyecto)

</div>

---

## Descripción General
**PLAK Messenger Frontend** es la interfaz de usuario crítica para operaciones de logística urbana. Construida con arquitectura empresarial, orquesta la gestión de flotas en tiempo real mientras asegura la continuidad del negocio incluso bajo condiciones de red adversas.

### App Nativa (Android)
La experiencia del mensajero está completamente optimizada como una aplicación independiente para Android. Al instalar el APK nativo, los usuarios obtienen:
- **Acceso Instantáneo**: Inicio directo desde la pantalla principal del teléfono.
- **Experiencia Inmersiva**: Interfaz a pantalla completa real, sin barras de navegación del navegador que estorben.
- **Operación Confiable**: Seguimiento en segundo plano persistente y sincronización offline perfectamente adaptada al dispositivo.

---

### Dos Experiencias Optimizadas
| **Centro de Comando** | **App de Campo** |
|:---|:---|
| Dashboard Administrativo para control de operaciones | Aplicación Web Progresiva para mensajeros |
| Monitoreo de flota en tiempo real con Google Maps | Instalable en cualquier dispositivo móvil |
| Gestión de concesionarios y empleados | Capaz de trabajar offline con auto-sincronización |
| Auditoría de servicios con evidencia digital | Firma digital y captura de fotos |

---

## Capturas de Pantalla

### Admin Dashboard
| Login | Monitoreo en Vivo |
|:---:|:---:|
| ![Admin Login](docs/screenshots/admin/1_Admin_Login.png) | ![Live Tracking](docs/screenshots/admin/14_Admin_Monitoreo.png) |
| *Acceso al sistema administrativo* | *Posición de la flota en tiempo real con Google Maps* |

| Gestión de Servicios | Detalles del Servicio |
|:---:|:---:|
| ![Services](docs/screenshots/admin/11_Admin_Servicios.png) | ![Service Details](docs/screenshots/admin/12_Admin_Detalles_Servicio.png) |
| *Listado y filtrado de servicios* | *Timeline detallado con evidencias fotográficas* |

| Empleados | Concesionarios |
|:---:|:---:|
| ![Employees](docs/screenshots/admin/4_Admin_Empleados.png) | ![Dealerships](docs/screenshots/admin/7_Admin_Concesionarios.png) |
| *Gestión del personal* | *Administración de concesionarios* |

---

### Messenger PWA
| Login | Servicios Asignados | Actualización de Estado |
|:---:|:---:|:---:|
| ![Login](docs/screenshots/messenger/1_Messenger_Login.png) | ![Assigned](docs/screenshots/messenger/2_Messenger_Asignados.png) | ![Update Status](docs/screenshots/messenger/5_Messenger_Actualizar_Estado.png) |
| *Acceso mensajeros* | *Lista de entregas asignadas* | *Cambio de estado con evidencia* |

| Detalles del Servicio | Historial | Configuración |
|:---:|:---:|:---:|
| ![Details](docs/screenshots/messenger/3_Messenger_Detalles_Servicio_1.1.png) | ![History](docs/screenshots/messenger/9_Messenger_Historial.png) | ![Settings](docs/screenshots/messenger/11_Messenger_Configuracion.png) |
| *Información completa y navegación* | *Servicios con cambio de estado* | *Preferencias de la app* |

---

## Características Principales

### Robustez y Resiliencia (Offline-First)
| Característica | Descripción |
|:---|:---|
| **Sincronización Inteligente** | Implementación del patrón *Store-and-Forward*. Las acciones offline se persisten en `IndexedDB` y se reintentan automáticamente. |
| **Arquitectura Event-Driven** | Eliminación de *polling* constante mediante eventos `offline-actions-updated`, reduciendo drásticamente latencia y consumo de batería. |
| **Última Ubicación Inteligente** | Estrategia de rastreo optimizada que solo encola la ubicación más reciente cuando está offline, evitando desperdicio de ancho de banda y "teletransportes" al reconectar. |
| **Service Workers** | Caché estratégica de assets y respuestas de API mediante VitePWA para carga instantánea bajo cualquier condición de red. |
| **Optimización de Bundle** | Análisis continuo del tamaño del bundle con `rollup-plugin-visualizer` para asegurar rendimiento en dispositivos de gama media/baja. |

---

### Ingeniería Geoespacial
| Característica | Descripción |
|:---|:---|
| **Rastreo en Vivo** | Comunicación bidireccional WebSocket via STOMP/SockJS para actualizaciones de posición sub-segundo. |
| **Advanced Markers API** | Renderizado de alto rendimiento en Google Maps, soportando miles de entidades simultáneas sin degradación de FPS. |
| **Geocodificación Resiliente** | Sistema de colas para resolución de direcciones que respeta los límites de la API de Google. |

---

### Experiencia de Usuario (UX)
| Característica | Descripción |
|:---|:---|
| **Diseño Responsivo** | Interfaz fluida desde monitores 4K hasta dispositivos móviles de 5", construida con Tailwind CSS v4.2. |
| **Modo Oscuro/Claro** | Soporte nativo de temas con detección de preferencia del sistema y elección persistente del usuario. |
| **Paginación y Búsqueda** | Gestión eficiente de grandes volúmenes de datos mediante paginación del lado del servidor y búsqueda Full-Text. |
| **Captura de Evidencia** | Compresión de imágenes del lado del cliente, firma digital vectorial y **verificación por cámara GIF** para entregas seguras. |
| **Dictado por Voz** | Integración con Google Cloud Speech-to-Text para dictar observaciones de servicio, garantizando alta precisión y compatibilidad en todos los dispositivos. |

---

## Estrategia de Calidad y Pruebas
Este proyecto sigue la metodología **"Testing Trophy"**, priorizando la confianza en el despliegue sobre métricas de cobertura vanidosas.

```
    ╭──────────────────────╮
    │  E2E (Playwright)    │  ← Flujos de usuario completos
    ├──────────────────────┤
    │  Integración (MSW)   │  ← Componente + capa API
    ├──────────────────────┤
    │   Unitarias (Vitest) │  ← Lógica de negocio (~89% cobertura)
    ├──────────────────────┤
    │  Estático (TS/ESLint)│ ← Seguridad en compilación
    ╰──────────────────────╯
```

| **E2E** | `Playwright` | Pruebas de flujos críticos (Login, Entrega, Offline) con bypass de seguridad (Turnstile) |
| **Integración** | `Vitest` + `MSW` | Pruebas de página completa con capa de red mockeada via Mock Service Worker |
| **Unitarias** | `Vitest` | Lógica de negocio (~89% de cobertura en servicios), utilidades y hooks complejos |
| **Estático** | `ESLint`, `TypeScript` | Verificación estricta de tipos y reglas de linting |

---

### Ejecutar Pruebas
```bash
# Pruebas unitarias e integración (Vitest)
npm run test:run

# Reporte de cobertura
npm run test:coverage

# Pruebas E2E (Playwright)
npx playwright test

# Pruebas E2E con UI
npx playwright test --ui
```

---

## Stack Tecnológico
La arquitectura está diseñada para **escalabilidad**, **mantenibilidad** y **rendimiento a largo plazo**.

| Categoría | Tecnologías | Propósito |
|:---|:---|:---|
| **Core** | `React 19.2`, `TypeScript 5.9` | Características concurrentes + tipado estricto |
| **Build** | `Vite 7.3` | HMR ultrarrápido y builds optimizadas |
| **Estilos** | `Tailwind CSS 4.2`, `Shadcn/UI` | CSS utility-first con librería de componentes accesibles |
| **Estado** | `React Query`, `Context API` | Caché de estado del servidor + estado global del cliente |
| **Formularios** | `React Hook Form`, `Zod 4` | Formularios de alto rendimiento con validación de esquemas |
| **PWA** | `vite-plugin-pwa`, `idb-keyval` | Capacidades offline y persistencia local |
| **Mobile** | `Capacitor 6` | Generación de la aplicación nativa para Android y acceso a sus APIs |
| **Mapas** | `@react-google-maps/api` | Integración profunda con Google Maps Platform |
| **Tiempo Real** | `@stomp/stompjs` | Mensajería WebSocket para rastreo en vivo |
| **Animaciones** | `Framer Motion` | Animaciones y transiciones fluidas |
| **Gráficos** | `Recharts` | Componentes de visualización de datos |

---

## Arquitectura del Proyecto
El código sigue principios de **Clean Architecture** adaptados para desarrollo frontend:

```
src/
├── components/          # Bloques de Construcción UI (115+ componentes)
│   ├── ui/              # Componentes base (Shadcn/UI)
│   └── ...              # Componentes específicos por feature
├── config/              # Configuración de la Aplicación
├── context/             # Proveedores de Estado Global (Auth, Theme, Maps)
├── hooks/               # Custom React Hooks (16 hooks)
├── layouts/             # Componentes de Layout de Página
├── lib/                 # Librerías de Utilidades
├── pages/               # Componentes de Página de Ruta (28 páginas)
├── routes/              # Enrutamiento de la Aplicación
├── schemas/             # Esquemas de Validación Zod
├── services/            # Servicios de API e Infraestructura
├── styles/              # Estilos Globales
├── test/                # Configuración de Pruebas y Mocks (MSW)
├── types/               # Definiciones de Tipos TypeScript
└── utils/               # Funciones Utilitarias
```

---

## Instalación y Despliegue

### Prerrequisitos
| Requerimiento | Versión |
|:---|:---|
| Node.js | v20.0.0+ (LTS recomendado) |
| npm | v10+ |
| Google Maps API Key | Requerido para funcionalidad de mapas |

---

### Inicio Rápido (Docker)
Si tienes el repositorio del backend en la misma carpeta raíz, puedes levantar todo el ecosistema (Frontend + Backend + DB) usando Docker:

1. Ve a la carpeta del backend: `cd ../messenger-backend`
2. Ejecuta: `docker-compose -f docker-compose.local.yml up --build`

Esto compilará el frontend y lo servirá en `http://localhost`.

---

### Desarrollo con Hot Reloading (Docker)
Para desarrollo activo con recarga automática de código:

```bash
cd ../messenger-backend
docker-compose -f docker-compose.dev.yml up --build
```

El servidor de desarrollo del frontend (Vite HMR) estará disponible en `http://localhost:5173` — los cambios se reflejan instantáneamente al guardar.

---

### Desarrollo Local (Manual)
```bash
# 1. Clonar el repositorio
git clone https://github.com/fttmatteo/messenger-frontend.git
cd messenger-frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu configuración

# 4. Iniciar servidor de desarrollo
npm run dev
```

---

### Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto:

```env
# Configuración de API
VITE_API_URL=http://localhost:8080/api

# Google Maps
VITE_GOOGLE_MAPS_KEY=tu_api_key_de_google_maps

# WebSocket (opcional - para desarrollo)
VITE_WS_URL=ws://localhost:8080/ws

# Cloudflare Turnstile (Protección contra Bots)
VITE_TURNSTILE_SITE_KEY=tu_turnstile_site_key
```

---

### Scripts Disponibles
| Script | Descripción |
|:---|:---|
| `npm run dev` | Iniciar servidor de desarrollo con HMR |
| `npm run dev:staging` | Iniciar servidor dev con config de staging |
| `npm run build` | Compilar para producción |
| `npm run build:staging` | Compilar para ambiente de staging |
| `npm run preview` | Previsualizar build de producción localmente |
| `npm run lint` | Ejecutar verificación de calidad ESLint |
| `npm run test` | Ejecutar Vitest en modo watch |
| `npm run test:run` | Ejecutar Vitest una vez |
| `npm run test:ui` | Abrir UI de Vitest |
| `npm run test:coverage` | Generar reporte de cobertura |

---

## Seguridad
| Característica | Implementación |
|:---|:---|
| **Autenticación JWT** | Rotación automática de tokens via interceptores de Axios con soporte de refresh token |
| **Prevención XSS** | Escapado integrado de React + Content Security Policy estricto |
| **Guardias de Ruta** | Protección de rutas basada en roles (Admin vs Messenger) a nivel de router |
| **Solo HTTPS** | Conexiones seguras forzadas en producción |
| **Validación de Entrada** | Todas las entradas de usuario validadas con esquemas Zod |
| **Protección contra Bots** | Cloudflare Turnstile integrado en todos los flujos de login |
| **Rate Limiting** | Manejo del lado del cliente de errores 429 desde el backend |
| **UUIDs Públicos** | Uso de UUID v4 para todas las referencias de entidades para prevenir enumeración de IDs y mejorar la sincronización offline |

---

## Contacto
Para consultas sobre este proyecto:
- **Repositorio**: `messenger-frontend`
- **Autor**: [Mateo Valencia Ardila](https://github.com/fttmatteo)
- **Email**: [contacto@plak.digital](mailto:contacto@plak.digital)
- **Sitio Web**: [plak.digital](https://plak.digital)

---

> **Copyright (C) 2026 Mateo Valencia Ardila. Todos los derechos reservados. El código fuente de esta aplicación está protegido por las leyes de derechos de autor. Registro DNDA No. 13-108-139. Queda estrictamente prohibida su copia, distribución o modificación sin autorización expresa.**
