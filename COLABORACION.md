# 🚀 Guía de Colaboración - Frontend

Esta guía establece los estándares y reglas para contribuir al frontend del proyecto Messenger.

## 🛠️ Stack Tecnológico
* **Framework:** React 19 + Vite 7
* **Lenguaje:** TypeScript
* **Estilos:** Tailwind CSS
* **Estado/Formularios:** React Hook Form + Zod
* **Componentes:** Radix UI / Lucide Icons

## 🔐 Reglas de Contribución (Seguridad)
Al igual que en el backend, el repositorio tiene activadas reglas de protección estrictas:

1. **Prohibido Push a `main`:** Nunca subas código directamente a la rama principal.
2. **Flujo de Ramas:** Crea una rama específica para cada tarea:
   - `git checkout -b feature/nombre-componente`
   - `git checkout -b fix/bug-especifico`
3. **Pull Requests (PR):** Todo cambio debe pasar por un proceso de revisión.
4. **Revisión Obligatoria:** Los PR requieren la aprobación de **@fttmatteo** (Code Owner) para ser integrados.
5. **Conversaciones Resueltas:** Asegúrate de responder y resolver todos los comentarios del revisor antes del merge.
6. **Pruebas Obligatorias:** Todo Pull Request debe pasar la suite de pruebas completa (`npm run test:run` y `npx playwright test`) sin fallos.

## 🚀 Pasos para colaborar
1. Clona el repositorio.
2. Crea tu rama de trabajo desde `main`.
3. **IMPORTANTE**: No subas archivos `.env` al repositorio. Verifica que estén en el `.gitignore`.
4. Realiza tus cambios siguiendo los estándares de ESLint.
5. Sube tu rama y abre el Pull Request en GitHub.
6. Espera la revisión de **@fttmatteo**.
