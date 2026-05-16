# Guía de Versionamiento - Messenger Frontend

Este proyecto utiliza un sistema de versionamiento centralizado para asegurar que el `package.json` y la documentación (badges en README) estén siempre sincronizados.

## Cómo Subir de Versión

Para actualizar la versión del proyecto tienes varias opciones según tu sistema:

- Windows (PowerShell): usa el script PowerShell provisto (`sync-version.ps1`).
- Linux / macOS (Bash): usa el script Bash equivalente (`sync-version.sh`).
- Contenedor Docker: ejecuta el `sync-version.ps1` dentro de la imagen oficial de PowerShell si no quieres instalar `pwsh` localmente.

### 1) Windows — PowerShell (recomendado si estás en Windows)

Desde una terminal de PowerShell en la raíz del proyecto:
```powershell
.\sync-version.ps1 1.8.5
```

Si recibes un error de Execution Policy:
```powershell
powershell -ExecutionPolicy Bypass -File .\sync-version.ps1 1.8.5
```

### 2) Linux / macOS — Bash

Hemos añadido un script `sync-version.sh` que replica el comportamiento del `.ps1` y es ejecutable en sistemas Unix:
```bash
chmod +x ./sync-version.sh
./sync-version.sh 1.8.5
```

Este script ejecuta `npm version --no-git-tag-version <versión>` y actualiza los badges `Version-...` en `README.md` y `README.en.md`.

### 3) Opción con Docker (si no quieres instalar PowerShell localmente)

```bash
docker run --rm -v "$PWD":/work -w /work mcr.microsoft.com/powershell:latest pwsh -NoProfile -File ./sync-version.ps1 1.8.5
```

## ¿Qué archivos se actualizan?

El script realiza automáticamente las siguientes acciones:
1. **package.json**: Actualiza el campo `"version"`.
2. **README.md**: Actualiza el badge visual de versión (ej. `Version-1.8.5-blue.svg`).
3. **README.en.md**: Actualiza el badge visual en la documentación en inglés.

## Buenas Prácticas (SemVer)

Se recomienda seguir el esquema de **Semantic Versioning**:
- **MAJOR** (X.0.0): Cambios incompatibles en la API o arquitectura.
- **MINOR** (0.X.0): Nuevas funcionalidades compatibles.
- **PATCH** (0.0.X): Corrección de errores y optimizaciones menores.

---

> **Nota**: Después de ejecutar el script, no olvides realizar un commit con los cambios generados:
> `git add .`
> `git commit -m "chore: bump version to 1.8.5"`
