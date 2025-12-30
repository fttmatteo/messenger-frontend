<div align="center">

# 📱 Messenger Frontend

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-Passing-brightgreen?style=for-the-badge&logo=vitest&logoColor=white)

**Comprehensive platform for real-time logistics and messenger management.**
Modern, responsive, and accessible interface for administrators and messengers.

[Versión en español](README.md) • [Features](#-key-features) • [Technology](#-tech-stack) • [Installation](#-installation--deployment) • [Architecture](#-architecture--maintenance)

</div>

---

## 📋 General Description

**Messenger Frontend** is the user interface of the PLAK system, designed to orchestrate urban messenger operations. The application offers two distinct experiences based on user roles:
1.  **Administrative Dashboard**: For global monitoring, employee/dealership management, and service visualization.
2.  **Messenger App (Mobile PWA)**: Optimized for field use, allowing management of assignments, status updates, evidence capture, and service creation.

The system stands out for its **real-time tracking** capabilities using WebSockets and the Google Maps API with Advanced Markers.

## ✨ Key Features

### 📱 User Experience (UX)
-   **Mobile-First Design**: Adaptive interface optimized for touch devices (Messenger App).
-   **Dark Mode**: Native support for light and dark themes using `next-themes`.
-   **Full PWA**: Installable on mobile devices with update notifications and offline support.
-   **Accessibility (A11y)**: Keyboard navigation, ARIA labels, and semantic roles implemented.

### 📶 Offline Capabilities (PWA)
-   **Background Sync**: Actions performed while offline are queued and automatically synchronized when internet is restored.
-   **Critical Data Caching**: Uses `IndexedDB` (via `idb-keyval`) to persist essential data like dealerships and service statuses.
-   **Connectivity Indicators**: Real-time visual notifications about network status and pending synchronization.

### 🗺️ Geolocation and Maps
-   **Live Tracking**: Real-time visualization of the messenger fleet on Google Maps via WebSockets (STOMP).
-   **Advanced Markers**: Uses `AdvancedMarkerElement` with visual effects (pulse) for active messengers.
-   **Reverse Geocoding**: Optimized caching and queuing system to convert coordinates into readable addresses.

### ⚙️ Operational Features
-   **Lifecycle Management**: Full service workflow (Assigned → In Progress → Delivered/Returned).
-   **Trash & Archive**: Soft-delete system with a deleted items viewer and restoration capabilities.
-   **Evidence Capture**:
    -   📸 **Native Camera**: Direct license plate capture with local image processing.
    -   ✍️ **Digital Signature**: Support for signatures on touch screens (`canvas`).

---

## 🛠 Tech Stack

The project uses cutting-edge technologies to ensure scalability and maintainability:

| Category | Technologies | Purpose |
| :--- | :--- | :--- |
| **Core** | `React 19`, `TypeScript` | Framework base and total type safety. |
| **PWA** | `vite-plugin-pwa`, `idb-keyval` | Offline-first, caching, and service workers. |
| **Styles & UI** | `Tailwind CSS v4`, `Shadcn/UI`, `Framer Motion` | Premium design, accessible components, and animations. |
| **State** | `Context API`, `Custom Hooks` | Reactive and decoupled state management. |
| **Maps** | `@react-google-maps/api` | Advanced integration with Google Maps. |
| **Real-time** | `@stomp/stompjs`, `SockJS` | Instant location updates. |
| **Testing** | `Vitest`, `React Testing Library` | Unit and integration test coverage. |

---

## 🏗 Architecture & Maintenance

The project follows a rigorous quality standard after an intensive refactoring phase:

-   **Modularization**: Large components like camera, map, and service management have been extracted into specialized modules (`camera`, `tracking`, `admin`).
-   **Context Pattern**: Separation of definitions (`ContextDef.ts`) and implementations (`ContextProvider.tsx`) to avoid circular dependencies.
-   **Clean Code**: Custom hooks renamed to `kebab-case`, standardized imports with `@/` alias, and barrel exports for types and components.

```
src/
├── components/          # 🧩 Modular components (camera, tracking, admin)
├── context/             # 🌐 Providers following the Context/Def pattern
├── hooks/               # 🎣 Custom Hooks in kebab-case
├── services/            # 📡 API layer and offline synchronization
├── types/               # 📝 Centralized typing
└── ...
```

---

## 🚀 Installation & Deployment

### Prerequisites
-   Node.js v18.0.0 or higher
-   Google Maps API Key enabled (with Map ID for Advanced Markers)

### Quick Steps
1. `git clone https://github.com/your-user/plak-frontend.git`
2. `npm install`
3. Configure `.env` with `VITE_API_URL` and Maps keys.
4. `npm run dev` for development or `npm run build` for production.

### 📜 Available Scripts

| Script | Description |
| :--- | :--- |
| `npm run dev` | Starts the development server with HMR. |
| `npm run build` | Compiles and optimizes the app for production. |
| `npm run preview` | Locally previews the production build. |
| `npm run lint` | Runs static code analysis (ESLint). |
| `npm run test:run` | Runs the unit test suite once. |
| `npm run test:ui` | Opens the interactive Vitest UI for testing. |

---

## 🔒 Security & Best Practices

-   **Robust Authentication**: Session management via JWT with Axios interceptors for automatic token renewal.
-   **Type Safety**: Runtime schema validation with `Zod` for API responses and forms.
-   **CI/CD Ready**: Configuration ready for continuous deployment with automatic linting and test validations.
-   **Performance**: Native Code Splitting using `React.lazy` and `Suspense`.

## 🤝 Contribution

Contributions are welcome! To maintain project quality:
1.  Ensure `npm run lint` returns no errors.
2.  Verify that all tests pass with `npm run test:run`.
3.  Follow the established file naming conventions and modular structure.

---

<div align="center">
  <sub>Messenger Delivery System © 2024-2025</sub>
</div>
