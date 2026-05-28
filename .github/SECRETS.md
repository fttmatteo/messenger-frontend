<details>
<summary><b>🇺🇸 English Version: Secrets Management</b></summary>

---

# Frontend Secrets Management

This document describes the secrets and environment variables required for the **Messenger Frontend** repository.

Since this is a Vite (React/TypeScript) application, environment variables starting with `VITE_` are injected into the build at compile time.

## CI/CD Secrets (GitHub Actions)

The CI pipeline (`ci.yml`) builds the application. You must configure the following secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

| Secret | Description | Required in CI |
|--------|-------------|----------------|
| `VITE_API_URL` | The URL of your backend API (e.g. `https://api.yourdomain.com`) | ✅ **YES** |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API Key for the frontend | ✅ **YES** |
| `VITE_GOOGLE_MAPS_MAP_ID` | Map ID for advanced Google Maps styling/features | ✅ **YES** |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile Site Key for the visual anti-bot widget | ✅ **YES** |

> [!WARNING]  
> If these variables are not configured in GitHub Secrets, the production build will not have the correct configuration and the app will fail to connect to the backend, load maps, or verify Turnstile. *(Note: Make sure `VITE_TURNSTILE_SITE_KEY` is also passed in your `ci.yml` build step if missing).*

## Local Development

For local development, copy the [../.env.example](../.env.example) file to `.env` and fill in your local or test values. The `.env` file is ignored by Git and should **never** be committed.

</details>

---

# Gestión de Secretos del Frontend

Este documento describe los secretos y variables de entorno requeridos para el repositorio **Messenger Frontend**.

Dado que es una aplicación Vite (React/TypeScript), las variables de entorno que comienzan con `VITE_` se inyectan en el bundle durante el proceso de compilación (build).

## Secretos de CI/CD (GitHub Actions)

El pipeline de CI (`ci.yml`) compila la aplicación. Debes configurar los siguientes secretos en la configuración de tu repositorio en GitHub (`Settings > Secrets and variables > Actions`):

| Secreto | Descripción | Requerido en CI |
|---------|-------------|-----------------|
| `VITE_API_URL` | URL de tu API backend (ej. `https://api.tudominio.com`) | ✅ **SÍ** |
| `VITE_GOOGLE_MAPS_API_KEY` | Key de la API de Google Maps para el frontend | ✅ **SÍ** |
| `VITE_GOOGLE_MAPS_MAP_ID` | Map ID para estilos/características avanzadas de Google Maps | ✅ **SÍ** |
| `VITE_TURNSTILE_SITE_KEY` | Site Key de Cloudflare Turnstile para el widget visual anti-bots | ✅ **SÍ** |

> [!WARNING]  
> Si estas variables no están configuradas en los GitHub Secrets, la compilación de producción no tendrá la configuración correcta y la aplicación fallará al intentar conectarse al backend, cargar los mapas o el widget de Turnstile. *(Nota: Asegúrate de que `VITE_TURNSTILE_SITE_KEY` también se esté pasando en el paso de build de tu `ci.yml` en caso de que falte).*

## Desarrollo Local

Para el desarrollo local, copia el archivo [../.env.example](../.env.example) a `.env` y completa con tus valores locales o de prueba. El archivo `.env` es ignorado por Git y **nunca** debe subirse al repositorio.
