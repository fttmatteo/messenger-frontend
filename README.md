> **Copyright (C) 2025 Mateo Valencia Ardila. All rights reserved. Confidential and Proprietary.**

<div align="center">

# 📱 Messenger Frontend

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-E2E-orange?style=for-the-badge&logo=playwright&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-Passing-brightgreen?style=for-the-badge&logo=vitest&logoColor=white)

**High-engineering platform for urban logistics and messenger management.**
Robust interface, resilient to network failures, and protected by a comprehensive testing strategy.

[Spanish version](README.es.md) • [Features](#-key-features) • [Quality Strategy](#-quality-strategy--testing) • [Installation](#-installation--deployment) • [Architecture](#-architecture)

</div>

---

## 📋 Overview

**Messenger Frontend** is the critical user interface of the PLAK system. More than just a dashboard, it is a distributed system that orchestrates real-time operations, ensuring business continuity even in adverse connectivity conditions.

The system is divided into two optimized experiences:

1.  **Command Center (Admin Dashboard)**: Control tower for real-time fleet monitoring, dealership management, and service auditing with digital evidence.
2.  **Field App (Messenger PWA)**: Installable progressive web application designed for field operations. Capable of queuing offline transactions and automatically synchronizing them.

### 📸 Screenshots

<!-- TODO: Add project screenshots here -->

| Admin Dashboard | Live Tracking |
|:---:|:---:|
| *[Insert Admin Dashboard Screenshot]* | *[Insert Live Tracking Map Screenshot]* |
| *Overview of system metrics and status* | *Real-time fleet position on Google Maps* |

| Mobile App Interface | Service Details |
|:---:|:---:|
| *[Insert Mobile App Interface Screenshot]* | *[Insert Service Details Screenshot]* |
| *Messenger field view (PWA)* | *Detailed history and status timeline* |

---

## ✨ Key Features

### 🛡️ Robustness & Resilience (Offline-First)
-   **Smart Synchronization**: *Store-and-Forward* pattern implementation. Actions performed without internet are persisted in `IndexedDB` and automatically retried.
-   **Service Workers**: Strategic caching of assets and API responses for instant loading under any network condition (VitePWA).
-   **Bundle Optimization**: Continuous bundle size analysis to ensure performance on mid/low-range devices.

### 🗺️ Geospatial Engineering
-   **Live Tracking (WebSocket)**: Bidirectional communication via STOMP/SockJS for position updates with sub-second latency.
-   **Advanced Markers API**: High-performance rendering on Google Maps, supporting thousands of simultaneous entities without FPS degradation.
-   **Resilient Geocoding**: Queue system for address resolution that respects Google API rate limits.

### 📱 User Experience (UX)
-   **Adaptive Design**: Fluid interface ranging from 4K monitors to 5" mobile devices.
-   **Dark/Light Mode**: Native and persistent support.
-   **Evidence Capture**: Client-side image processing and vector digital signatures.

---

## 🧪 Quality Strategy & Testing

This project adheres to **"The Testing Trophy"** standard, prioritizing deployment confidence over vanity metrics.

| Level | Tools | Focus |
| :--- | :--- | :--- |
| **E2E (End-to-End)** | `Playwright` | Monitoring of critical business flows (Login, Maps, Dealership Creation) in real browsers (Chromium). |
| **Integration** | `Vitest` + `MSW` | Full-page tests simulating the network layer with **Mock Service Worker**. Ensures the frontend handles real API responses (success, error, loading) without backend dependency. |
| **Unit** | `Vitest` | Isolated business logic, utilities, and complex hooks. |
| **Visual** | `Playwright Snapshots` | Automatic detection of design regressions (pixel-perfect diffing). |
| **Static** | `ESLint`, `TypeScript` | Strict rules to prevent errors at development time. |

### Test Execution
```bash
# Run unit and integration suite
npm run test:run

# Run E2E tests (requires local server)
npx playwright test

# Generate bundle analysis report
npm run build # Generates stats.html
```

---

## 🛠 Tech Stack

The architecture is designed to be scalable, maintainable, and performant in the long term.

| Category | Technologies | Purpose |
| :--- | :--- | :--- |
| **Core** | `React 19`, `TypeScript` | Solid foundation and strict typing. |
| **State** | `React Query` (implicit), `Context API` | Asynchronous and global state management. |
| **Forms** | `React Hook Form`, `Zod` | Schema validation and performant forms. |
| **UI Kit** | `Tailwind CSS v4`, `Shadcn/UI` | Consistent and accessible design system. |
| **PWA** | `vite-plugin-pwa`, `idb-keyval` | Offline capabilities and local persistence. |
| **Maps** | `@react-google-maps/api` | Deep integration with Google Maps Platform. |
| **Real-time** | `@stomp/stompjs` | Messaging protocol for live tracking. |

---

## 🏗 Project Architecture

The code follows **Clean Architecture** principles adapted to the frontend:

```
src/
├── components/          # 🧩 UI Building Blocks (Atomic & Molecular)
├── context/             # 🌐 Global State (Auth, Theme, Maps)
├── hooks/               # 🎣 Reusable Business Logic (Custom Hooks)
├── pages/               # 📄 Main Views and Layout Composition
├── services/            # 📡 Infrastructure Layer (API, PWA, Sync)
├── schemas/             # 📝 Validation Definitions (Zod)
├── test/                # 🧪 Test Configuration and Mocks (MSW)
└── types/               # 🏷️ TypeScript Type Definitions
```

---

## 🚀 Installation & Deployment

### Prerequisites
-   Node.js v20.0.0+ (Recommended)
-   NPM v10+

### Local Development
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-organization/plak-frontend.git
    cd plak-frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure environment:**
    Create a `.env` file based on `.env.example`:
    ```env
    VITE_API_URL=http://localhost:8080/api
    VITE_GOOGLE_MAPS_KEY=your_api_key
    ```
4.  **Start server:**
    ```bash
    npm run dev
    ```

### NPM Scripts
| Script | Action |
| :--- | :--- |
| `dev` | Starts development server (HMR). |
| `build` | Compiles for production and generates size report. |
| `lint` | Checks code quality. |
| `test:run` | Runs Vitest tests once. |
| `test:ui` | Graphical interface for unit tests. |
| `preview` | Serves the production build locally. |

---

## 🔒 Security

-   **JWT Handling**: Automatic token rotation via interceptors.
-   **Sanitization**: Prevents XSS by design in React + automatic escaping.
-   **Route Guards**: Role-based route protection (Admin vs Messenger) at the router level.

---

> **Copyright (C) 2025 Mateo Valencia Ardila. All rights reserved. Confidential and Proprietary.**
