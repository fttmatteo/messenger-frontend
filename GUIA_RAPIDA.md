> **Copyright (C) 2026 Mateo Valencia Ardila. Todos los derechos reservados. El código fuente de esta aplicación está protegido por las leyes de derechos de autor. Registro DNDA No. 13-108-139. Queda estrictamente prohibida su copia, distribución o modificación sin autorización expresa.**

# Guía de Inicio Rápido - Frontend (Docker)

Esta guía permite levantar el frontend de **Messenger** de forma profesional utilizando Docker.

## Requisitos Previos

- **Docker Desktop** instalado y en ejecución.
- El **Backend** debe estar configurado (se recomienda usar el `docker-compose.local.yml` de la carpeta raíz).

## Ejecución con Docker

### 1. Como parte del sistema completo (Recomendado)
Para levantar todo el ecosistema (Frontend + Backend + DB), navega a la carpeta raíz del backend y ejecuta:
```bash
docker-compose -f docker-compose.local.yml up --build -d
```
El frontend estará disponible automáticamente en:
- **URL**: [http://localhost](http://localhost) (Puerto 80)

### 1.1. Con Hot Reloading (Desarrollo activo)
Para desarrollo activo con recarga automática al guardar cambios:
```bash
docker-compose -f docker-compose.dev.yml up --build
```
El frontend estará disponible en [http://localhost:5173](http://localhost:5173) con recarga instantánea.

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

---

> **Copyright (C) 2026 Mateo Valencia Ardila. Todos los derechos reservados. El código fuente de esta aplicación está protegido por las leyes de derechos de autor. Registro DNDA No. 13-108-139. Queda estrictamente prohibida su copia, distribución o modificación sin autorización expresa.**