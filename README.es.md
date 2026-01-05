> **Copyright (C) 2025 Mateo Valencia Ardila. All rights reserved. Confidential and Proprietary.**

<div align="center">

# 📱 Messenger Frontend

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-E2E-orange?style=for-the-badge&logo=playwright&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-Passing-brightgreen?style=for-the-badge&logo=vitest&logoColor=white)

**Plataforma de alta ingeniería para la gestión logística y mensajería urbana.**
Interfaz robusta, resiliente a fallos de red y protegida por una estrategia de pruebas integral.

[English version](README.md) • [Características](#-características-principales) • [Estrategia de Calidad](#-estrategia-de-calidad-y-pruebas) • [Instalación](#-instalación-y-despliegue) • [Arquitectura](#-arquitectura-y-mantenimiento)

</div>

---

## 📋 Descripción General

**Messenger Frontend** es la interfaz de usuario crítica del sistema PLAK. Más que un simple dashboard, es un sistema distribuido que orquesta operaciones en tiempo real, garantizando la continuidad del negocio incluso en condiciones de conectividad adversas.

El sistema se divide en dos experiencias optimizadas:

1.  **Centro de Comando (Admin Dashboard)**: Torre de control para monitoreo de flota en tiempo real, gestión de concesionarios y auditoría de servicios con evidencia digital.
2.  **Field App (Messenger PWA)**: Aplicación progresiva instalable diseñada para operar en campo. Capaz de encolar transacciones offline y sincronizarlas automáticamente.

---

## ✨ Características Principales

### 🛡️ Robustez y Resiliencia (Offline-First)
-   **Sincronización Inteligente**: Implementación de patrón *Store-and-Forward*. Las acciones realizadas sin internet se persisten en `IndexedDB` y se reintentan automáticamente.
-   **Service Workers**: Caché estratégica de assets y API responses para carga instantánea bajo cualquier condición de red (VitePWA).
-   **Optimización de Bundle**: Análisis continuo del tamaño del bundle para asegurar performance en dispositivos de gama media/baja.

### 🗺️ Ingeniería Geoespacial
-   **Live Tracking (WebSocket)**: Comunicación bidireccional vía STOMP/SockJS para actualizaciones de posición con latencia sub-segundo.
-   **Advanced Markers API**: Renderizado de alto rendimiento en Google Maps, soportando miles de entidades simultáneas sin degradación de FPS.
-   **Geocodificación Resiliente**: Sistema de colas para resolución de direcciones que respeta los rate-limits de la API de Google.

### 📱 Experiencia de Usuario (UX)
-   **Diseño Adaptativo**: Interfaz fluida desde monitores 4K hasta móviles de 5".
-   **Modo Oscuro/Claro**: Soporte nativo y persistente.
-   **Captura de Evidencia**: Procesamiento de imágenes en cliente y firmas digitales vectoriales.

---

## 🧪 Estrategia de Calidad y Pruebas

Este proyecto se adhiere al estándar de **"The Testing Trophy"**, priorizando la confianza en el despliegue sobre la cobertura vanidosa.

| Nivel | Herramientas | Enfoque |
| :--- | :--- | :--- |
| **E2E (Punta a Punta)** | `Playwright` | Monitoreo de flujos críticos del negocio (Login, Mapas, Creación de Concesionarios) en navegadores reales (Chromium). |
| **Integración** | `Vitest` + `MSW` | Pruebas de páginas completas simulando la capa de red con **Mock Service Worker**. Garantiza que el frontend maneja respuestas de API reales (éxito, error, carga) sin depender del backend. |
| **Unitarias** | `Vitest` | Lógica de negocio aislada, utilidades y hooks complejos. |
| **Visuales** | `Playwright Snapshots` | Detección automática de regresiones en el diseño (pixel-perfect diffing). |
| **Estáticos** | `ESLint`, `TypeScript` | Reglas estrictas para prevenir errores en tiempo de desarrollo. |

### Ejecución de Pruebas
```bash
# Ejecutar suite unitaria y de integración
npm run test:run

# Ejecutar pruebas E2E (requiere servidor local)
npx playwright test

# Generar reporte de análisis de bundle
npm run build # Genera stats.html
```

### 📸 Capturas de Pantalla

<!-- TODO: Agregar capturas de pantalla reales del proyecto aquí -->

| Panel Administrativo | Mapa en Vivo |
|:---:|:---:|
| *[Insertar Captura del Panel Administrativo]* | *[Insertar Captura del Mapa de Tracking]* |
| *Vista general de métricas y estado del sistema* | *Posición de la flota en tiempo real sobre Google Maps* |

| Interfaz Móvil | Detalles del Servicio |
|:---:|:---:|
| *[Insertar Captura de la App Móvil]* | *[Insertar Captura de Detalles del Servicio]* |
| *Vista de campo para mensajeros (PWA)* | *Historial detallado y línea de tiempo de estados* |

---

---

## 🛠 Stack Tecnológico

La arquitectura está diseñada para ser escalable, mantenible y performante a largo plazo.

| Categoría | Tecnologías | Propósito |
| :--- | :--- | :--- |
| **Core** | `React 19`, `TypeScript` | Base sólida y tipado estricto. |
| **State** | `React Query` (implícito), `Context API` | Gestión de estado asíncrono y global. |
| **Forms** | `React Hook Form`, `Zod` | Validación de esquemas y formularios performantes. |
| **UI Kit** | `Tailwind CSS v4`, `Shadcn/UI` | Sistema de diseño consistente y accesible. |
| **PWA** | `vite-plugin-pwa`, `idb-keyval` | Capacidades offline y persistencia local. |
| **Maps** | `@react-google-maps/api` | Integración profunda con Google Maps Platform. |
| **Real-time** | `@stomp/stompjs` | Protocolo de mensajería para tracking en vivo. |

---

## 🏗 Arquitectura del Proyecto

El código sigue principios de **Clean Architecture** adaptados al frontend:

```
src/
├── components/          # 🧩 Bloques de construcción UI (Atómicos y Moleculares)
├── context/             # 🌐 Estado Global (Auth, Theme, Maps)
├── hooks/               # 🎣 Lógica de negocio reutilizable (Custom Hooks)
├── pages/               # 📄 Vistas principales y composición de layouts
├── services/            # 📡 Capa de Infraestructura (API, PWA, Sync)
├── schemas/             # 📝 Definiciones de validación (Zod)
├── test/                # 🧪 Configuración de pruebas y Mocks (MSW)
└── types/               # 🏷️ Definiciones de tipos TypeScript
```

---

## 🚀 Instalación y Despliegue

### Prerrequisitos
-   Node.js v20.0.0+ (Recomendado)
-   NPM v10+

### Desarrollo Local
1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/tu-organizacion/plak-frontend.git
    cd plak-frontend
    ```
2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
3.  **Configurar entorno:**
    Crea un archivo `.env` basado en `.env.example`:
    ```env
    VITE_API_URL=http://localhost:8080/api
    VITE_GOOGLE_MAPS_KEY=tu_api_key
    ```
4.  **Iniciar servidor:**
    ```bash
    npm run dev
    ```

### Scripts de NPM
| Script | Acción |
| :--- | :--- |
| `dev` | Inicia servidor de desarrollo (HMR). |
| `build` | Compila para producción y genera reporte de tamaño. |
| `lint` | Verifica calidad de código. |
| `test:run` | Corre pruebas Vitest una vez. |
| `test:ui` | Interfaz gráfica para pruebas unitarias. |
| `preview` | Sirve la build de producción localmente. |

---

## 🔒 Seguridad

-   **JWT Handling**: Rotación automática de tokens mediante interceptores.
-   **Sanitización**: Previene XSS por diseño en React + escapado automático.
-   **Route Guards**: Protección de rutas basada en roles (Admin vs Messenger) a nivel de router.

---

> **Copyright (C) 2025 Mateo Valencia Ardila. All rights reserved. Confidential and Proprietary.**
