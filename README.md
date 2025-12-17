# Messenger Frontend

Aplicación frontend para el sistema de mensajería y tracking de entregas.

## 📁 Estructura del Proyecto

```
src/
├── api/                    # Servicios de API (auth, employees, etc.) y Barrel File (index.ts)
├── assets/                 # Imágenes, iconos estáticos
├── components/             # Componentes de UI (globales y de dominio)
│   ├── ui/                 # Componentes base (Button, Input, etc.)
│   ├── layout/             # Layouts (AdminLayout, MessengerLayout)
│   ├── DeliveryCard.tsx    # Componentes específicos
│   └── ...
├── config/                 # Configuración de entorno y clientes (Axios)
├── context/                # Estado global (AuthContext)
├── hooks/                  # Custom Hooks (React Query, lógica de UI)
├── pages/                  # Páginas principales (Rutas)
├── routes/                 # Configuración de React Router
├── types/                  # Definiciones de tipos TypeScript globales
├── utils/                  # Funciones de utilidad
├── App.tsx                 # Componente raíz
└── main.tsx                # Punto de entrada
```

## 🏗️ Arquitectura

### Estructura Plana y Simple

El proyecto utiliza una estructura organizada por **tipo de archivo** en lugar de por funcionalidad, facilitando la navegación y reduciendo la complejidad de anidamiento.

| Carpeta       | Propósito                                                                           |
| ------------- | ----------------------------------------------------------------------------------- |
| `api/`        | Contiene funciones de servicio que consumen el backend (`.service.ts`).             |
| `components/` | Todos los componentes de React, desde botones pequeños hasta formularios complejos. |
| `hooks/`      | Hooks personalizados para lógica reutilizable y manejo de estado de servidor.       |
| `types/`      | Interfaces y tipos TypeScript centralizados para toda la aplicación.                |

### Componentes Clave

-   **`api/index.ts`** - Barrel file que centraliza las exportaciones de la API para imports más limpios.
-   **`context/AuthContext.tsx`** - Manejo de sesión de usuario y tokens JWT.
-   **`components/ui/`** - Biblioteca de componentes base estilizados con Tailwind.

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build
```

## 🔧 Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/ws
```

## 📚 Tecnologías

-   **React** + **TypeScript**
-   **Vite** - Build tool
-   **Axios** - Cliente HTTP
-   **React Router** - Enrutamiento
-   **WebSockets** - Comunicación en tiempo real

## 📄 Licencia

MIT License - Ver archivo [LICENSE](./LICENSE) para más detalles.
