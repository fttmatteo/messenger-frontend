# 🚀 Guía de Inicio Rápido - Frontend (Docker)

Esta guía permite levantar el frontend de **Messenger** de forma profesional utilizando Docker.

## 📋 Requisitos Previos

- **Docker Desktop** instalado y en ejecución.
- El **Backend** debe estar configurado (se recomienda usar el `docker-compose.yml` de la carpeta raíz).

## 🛠 Ejecución con Docker

### 1. Como parte del sistema completo (Recomendado)
Para levantar todo el ecosistema (Frontend + Backend + DB), navega a la carpeta raíz del backend y ejecuta:
```bash
docker-compose up --build -d
```
El frontend estará disponible automáticamente en:
- **URL**: [http://localhost](http://localhost) (Puerto 80)

### 2. Ejecución Independiente
Si deseas compilar y probar solo el frontend:
```bash
# Construir la imagen
docker build -t messenger-frontend .

# Ejecutar el contenedor
docker run -d -p 80:80 --name messenger-frontend messenger-frontend
```

---

> [!TIP]
> **Zero-Config**: La imagen de Docker ya viene pre-configurada para conectarse al backend en `localhost:8080` y tiene un bypass automático para **Cloudflare Turnstile**, facilitando las pruebas sin configurar llaves externas.
