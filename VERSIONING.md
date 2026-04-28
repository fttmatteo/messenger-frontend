# Guía de Versionamiento - Messenger Frontend

Este proyecto utiliza un sistema de versionamiento centralizado para asegurar que el `package.json` y la documentación (badges en README) estén siempre sincronizados.

## Cómo Subir de Versión

Para actualizar la versión del proyecto, utiliza el script de PowerShell proporcionado en la raíz.

### Comando Estándar

Desde una terminal de PowerShell en la raíz del proyecto:
```powershell
.\sync-version.ps1 1.8.5
```

### En caso de Restricciones de Política (Execution Policy)

Si recibes un error indicando que la ejecución de scripts está deshabilitada, utiliza el siguiente comando:
```powershell
powershell -ExecutionPolicy Bypass -File .\sync-version.ps1 1.8.5
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
