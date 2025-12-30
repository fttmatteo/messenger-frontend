<div align="center">

# 📱 Messenger Frontend

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-Passing-brightgreen?style=for-the-badge&logo=vitest&logoColor=white)

**Plataforma integral para la gestión de logística y mensajería en tiempo real.**
Interfaz moderna, responsiva y accesible para administradores y mensajeros.

[English version](README.en.md) • [Características](#-características-principales) • [Tecnología](#-stack-tecnológico) • [Instalación](#-instalación-y-despliegue) • [Arquitectura](#-arquitectura-del-proyecto)

</div>

---

## 📋 Descripción General

**Messenger Frontend** es la interfaz de usuario del sistema PLAK, diseñada para orquestar operaciones de mensajería urbana. La aplicación ofrece dos experiencias distintas según el rol del usuario:
1.  **Dashboard Administrativo**: Para el monitoreo global, gestión de empleados, concesionarios y visualización de servicios.
2.  **App de Mensajero (Mobile PWA)**: Optimizada para uso en campo, permite gestionar asignaciones, actualizar estados, capturar evidencias y creación de servicios.

El sistema destaca por su capacidad de **tracking en tiempo real** utilizando WebSockets y la API de Google Maps con Advanced Markers.

## ✨ Características Principales

### 📱 Experiencia de Usuario (UX)
-   **Diseño Mobile-First**: Interfaz adaptativa optimizada para dispositivos táctiles (App Mensajero).
-   **Modo Oscuro**: Soporte nativo para temas claro y oscuro con `next-themes`.
-   **PWA Completo**: Instalable en dispositivos móviles con notificaciones de actualización y soporte offline.
-   **Accesibilidad (A11y)**: Navegación por teclado, etiquetas ARIA y roles semánticos implementados.

### 📶 Capacidades Offline (PWA)
-   **Sincronización en Segundo Plano**: Las acciones realizadas sin conexión se encolan y sincronizan automáticamente al recuperar internet.
-   **Caché de Datos Críticos**: Uso de `IndexedDB` (vía `idb-keyval`) para persistir datos esenciales como concesionarios y estados de servicio.
-   **Indicadores de Conectividad**: Notificaciones visuales en tiempo real sobre el estado de la red y sincronización pendiente.

### 🗺️ Geolocalización y Mapas
-   **Tracking en Vivo**: Visualización en tiempo real de la flota de mensajeros sobre Google Maps mediante WebSockets (STOMP).
-   **Marcadores Avanzados**: Uso de `AdvancedMarkerElement` con efectos visuales (pulso) para mensajeros activos.
-   **Geocodificación Inversa**: Sistema optimizado de caché y encolamiento para convertir coordenadas en direcciones legibles.

### ⚙️ Funcionalidades Operativas
-   **Gestión de Ciclo de Vida**: Flujo completo de servicio (Asignado → En Progreso → Entregado/Devuelto).
-   **Papelera y Archivo**: Sistema de eliminación suave con visor de elementos eliminados y restauración.
-   **Captura de Evidencias**:
    -   📸 **Cámara Nativa**: Captura directa de placas con procesamiento local de imágenes.
    -   ✍️ **Firma Digital**: Soporte para firmas en pantalla táctil (`canvas`).

---

## 🛠 Stack Tecnológico

El proyecto utiliza tecnologías de vanguardia para asegurar escalabilidad y mantenibilidad:

| Categoría | Tecnologías | Propósito |
| :--- | :--- | :--- |
| **Core** | `React 19`, `TypeScript` | Base del framework y seguridad de tipos total. |
| **PWA** | `vite-plugin-pwa`, `idb-keyval` | Offline-first, caching y service workers. |
| **Estilos & UI** | `Tailwind CSS v4`, `Shadcn/UI`, `Framer Motion` | Diseño premium, componentes accesibles y animaciones. |
| **Estado** | `Context API`, `Custom Hooks` | Gestión de estado reactiva y desacoplada. |
| **Mapas** | `@react-google-maps/api` | Integración avanzada con Google Maps. |
| **Real-time** | `@stomp/stompjs`, `SockJS` | Actualizaciones instantáneas de ubicación. |
| **Testing** | `Vitest`, `React Testing Library` | Cobertura de tests unitarios y de integración. |

---

## 🏗 Arquitectura y Mantenimiento

El proyecto sigue un riguroso estándar de calidad tras una fase intensiva de refactorización:

-   **Modularización**: Componentes grandes como la cámara, el mapa y la gestión de servicios se han extraído en módulos especializados (`camera`, `tracking`, `admin`).
-   **Patrón de Contextos**: Separación de definiciones (`ContextDef.ts`) e implementaciones (`ContextProvider.tsx`) para evitar dependencia circular.
-   **Clean Code**: Hooks personalizados renombrados a `kebab-case`, imports estandarizados con el alias `@/` y barrel exports para tipos y componentes.

```
src/
├── components/          # 🧩 Componentes modulares (camera, tracking, admin)
├── context/             # 🌐 Proveedores siguiendo el patrón Context/Def
├── hooks/               # 🎣 Custom Hooks en kebab-case
├── services/            # 📡 Capa API y sincronización offline
├── types/               # 📝 Tipado centralizado
└── ...
```

---

## 🚀 Instalación y Despliegue

### Prerrequisitos
-   Node.js v18.0.0 o superior
-   API Key de Google Maps habilitada (con Map ID para Advanced Markers)

### Pasos Rápidos
1. `git clone https://github.com/tu-usuario/plak-frontend.git`
2. `npm install`
3. Configura el `.env` con `VITE_API_URL` y las llaves de Maps.
4. `npm run dev` para desarrollo o `npm run build` para producción.

### 📜 Scripts Disponibles

| Script | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo con HMR. |
| `npm run build` | Compila y optimiza la aplicación para producción. |
| `npm run preview` | Previsualiza localmente el build de producción. |
| `npm run lint` | Ejecuta el análisis estático de código (ESLint). |
| `npm run test:run` | Ejecuta la suite de pruebas unitarias una sola vez. |
| `npm run test:ui` | Abre la interfaz interactiva de Vitest para pruebas. |

---

## 🔒 Seguridad y Buenas Prácticas

-   **Autenticación Robusta**: Gestión de sesiones mediante JWT con interceptores de Axios para renovación automática de tokens.
-   **Seguridad de Tipos**: Validación de esquemas en tiempo de ejecución con `Zod` para respuestas de API y formularios.
-   **CI/CD Ready**: Configuración preparada para despliegue continuo con validaciones automáticas de linting y tests.
-   **Rendimiento**: División de código (Code Splitting) nativo mediante `React.lazy` y `Suspense`.

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Para mantener la calidad del proyecto:
1.  Asegúrate de que `npm run lint` no devuelva errores.
2.  Verifica que todos los tests pasen con `npm run test:run`.
3.  Sigue las convenciones de nombres de archivos y estructura modular establecida.

---

<div align="center">
  <sub>Messenger Delivery System © 2024-2025</sub>
</div>
