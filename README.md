<div align="center">

# 📱 Messenger Frontend

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-Passing-brightgreen?style=for-the-badge&logo=vitest&logoColor=white)

**Plataforma integral para la gestión de logística y mensajería en tiempo real.**
Interfaz moderna, responsiva y accesible para administradores y mensajeros.

[Características](#-características-principales) • [Tecnología](#-stack-tecnológico) • [Instalación](#-instalación-y-despliegue) • [Arquitectura](#-arquitectura-del-proyecto)

</div>

---

## 📋 Descripción General

**Messenger Frontend** es la interfaz de usuario del sistema PLAK, diseñada para orquestar operaciones de mensajería urbana. La aplicación ofrece dos experiencias distintas según el rol del usuario:
1.  **Dashboard Administrativo**: Para el monitoreo global, gestión de empleados, concesionarios y creación de servicios.
2.  **App de Mensajero (Mobile PWA)**: Optimizada para uso en campo, permite gestionar asignaciones, actualizar estados y capturar evidencias.

El sistema destaca por su capacidad de **tracking en tiempo real** utilizando WebSockets y la API de Google Maps con Advanced Markers.

## ✨ Características Principales

### 📱 Experiencia de Usuario (UX)
-   **Diseño Mobile-First**: Interfaz adaptativa optimizada para dispositivos táctiles (App Mensajero).
-   **Modo Oscuro**: Soporte nativo para temas claro y oscuro.
-   **PWA Ready**: Preparada para instalación en dispositivos móviles.
-   **Accesibilidad (A11y)**: Navegación por teclado, etiquetas ARIA y roles semánticos implementados.

### 🗺️ Geolocalización y Mapas
-   **Tracking en Vivo**: Visualización en tiempo real de la flota de mensajeros sobre Google Maps.
-   **Marcadores Avanzados**: Uso de `AdvancedMarkerElement` para íconos personalizados y mejor rendimiento.
-   **Rutas y Distancias**: Cálculo automático de trayectos optimizados.

### ⚙️ Funcionalidades Operativas
-   **Gestión de Ciclo de Vida**: Flujo completo de servicio (Asignado → En Progreso → Entregado/Devuelto).
-   **Captura de Evidencias**:
    -   📸 Carga de fotografías como prueba de entrega.
    -   ✍️ Firma digital en pantalla táctil (`canvas`).
-   **Seguridad y Roles**: Autenticación JWT con rotación de tokens y protección de rutas por rol (`ADMIN`, `MESSENGER`).

### ⚡ Rendimiento y DX
-   **Lazy Loading**: Carga diferida de rutas y componentes pesados.
-   **Type Safety**: Código base 100% tipado estáticamente con TypeScript y Zod.
-   **Testing Robusto**: Suite de pruebas unitarias e integración con Vitest y React Testing Library.

---

## 🛠 Stack Tecnológico

El proyecto utiliza tecnologías de vanguardia para asegurar escalabilidad y mantenibilidad:

| Categoría | Tecnologías | Propósito |
| :--- | :--- | :--- |
| **Core** | `React 19`, `TypeScript` | Base del framework y seguridad de tipos. |
| **Build & Tooling** | `Vite` | Entorno de desarrollo y bundler optimizado. |
| **Estilos & UI** | `Tailwind CSS v4`, `Shadcn/UI`, `Class Variance Authority` | Sistema de diseño, componentes accesibles y estilos atómicos. |
| **Estado & Lógica** | `Context API`, `React Hooks` | Gestión de estado global y lógica reutilizable. |
| **Formularios** | `React Hook Form`, `Zod` | Manejo de formularios complejos y validación de esquemas. |
| **Mapas** | `@react-google-maps/api` | Integración con Google Maps Javascript API. |
| **Real-time** | `@stomp/stompjs`, `SockJS` | Comunicación WebSocket para actualizaciones en vivo. |
| **Testing** | `Vitest`, `React Testing Library`, `JSDOM` | Pruebas unitarias y de integración. |
| **Animaciones** | `Framer Motion` | Transiciones suaves y micro-interacciones. |

---

## 🏗 Arquitectura del Proyecto

Estructura de directorios organizada por dominio y funcionalidad:

```
src/
├── components/          # 🧩 Componentes UI reutilizables
│   ├── ui/              # Componentes base (Shadcn - botones, inputs, etc.)
│   ├── service/         # Componentes de dominio (ServiceCard, ServiceDetails)
│   ├── tracking/        # Componentes de mapa y rastreo
│   └── ...
├── context/             # 🌐 Proveedores de estado global (Auth, AdminUI)
├── hooks/               # 🎣 Custom Hooks (useService, useAuth, useMap)
├── layouts/             # 📐 Estructuras de página (MessengerLayout, AdminLayout)
├── lib/                 # 🛠 Utilidades puras, formateadores y configuración
├── pages/               # 📄 Vistas de la aplicación
│   ├── admin/           # Rutas protegidas de Administrador
│   └── messenger/       # Rutas protegidas de Mensajero
├── services/            # 📡 Capa de servicio API (Axios, WebSocket)
├── test/                # 🧪 Utilidades de prueba y mocks globales
└── types/               # 📝 Definiciones de tipos TypeScript compartidas
```

---

## 🚀 Instalación y Despliegue

### Prerrequisitos
-   Node.js v18.0.0 o superior
-   npm o pnpm
-   API Key de Google Maps habilitada

### Pasos de Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/plak-frontend.git
    cd plak-frontend
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    # o si usas pnpm
    pnpm install
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo `.env` en la raíz del proyecto basado en `.env.example`:

    ```env
    # URL del Backend API (Spring Boot)
    VITE_API_URL=http://localhost:8080

    # Configuración de Google Maps
    VITE_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
    VITE_GOOGLE_MAPS_MAP_ID=tu_map_id_aqui  # Requerido para Advanced Markers
    ```

4.  **Ejecutar en Desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:5173`.

### Scripts Disponibles

| Script | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia servidor de desarrollo con Hot Module Replacement (HMR). |
| `npm run build` | Compila y optimiza la aplicación para producción en `/dist`. |
| `npm run preview` | Sirve localmente la versión de producción compilada. |
| `npm run lint` | Ejecuta ESLint para analizar calidad de código. |
| `npm run test` | Ejecuta la suite de pruebas completa con Vitest. |
| `npm run test:ui` | Abre interfaz gráfica para visualizar pruebas. |

---

## 🔒 Seguridad y Buenas Prácticas

-   **Autenticación**: El sistema utiliza `Access Tokens` de corta duración y `Refresh Tokens` seguros vía HTTP-only cookies (configuración backend dependiente).
-   **Manejo de Errores**: Sistema centralizado de manejo de errores con tipos `AppError` personalizados.
-   **CI/CD**: Pipeline de GitHub Actions configurado para Linting, Testing y Build automático en cada Push/PR.

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor sigue estos pasos:

1.  Asegúrate de que todas las pruebas pasen: `npm run test:run`
2.  Verifica que no haya errores de linting: `npm run lint`
3.  Usa Conventional Commits para tus mensajes de commit.

---

<div align="center">
  <sub>Desarrollado para Messenger Delivery System © 2024</sub>
</div>
