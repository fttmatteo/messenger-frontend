import React, { type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { AdminUIProvider } from '@/shared/context/AdminUIContext';

/**
 * Configuración extendida para el renderizado de componentes en pruebas.
 * Permite inyectar contextos específicos y definir el estado inicial de la navegación.
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    /** Ruta del navegador al iniciar el test. */
    initialRoute?: string;
    /** Determina si se inyecta el contexto de autenticación. */
    withAuth?: boolean;
    /** Determina si se inyecta el contexto de la interfaz de administración. */
    withAdminUI?: boolean;
}

/**
 * Función de renderizado personalizada que envuelve componentes con todos los proveedores necesarios
 * (Router, Auth, AdminUI) para asegurar un entorno de prueba realista.
 * @param ui - El componente React a probar.
 * @param options - Opciones de configuración del entorno.
 */
export function renderWithProviders(
    ui: React.ReactElement,
    {
        initialRoute = '/',
        withAuth = true,
        withAdminUI = true,
        ...renderOptions
    }: CustomRenderOptions = {}
) {
    // Establecer la ruta inicial si se especifica
    if (initialRoute !== '/') {
        window.history.pushState({}, 'Test page', initialRoute);
    }

    function Wrapper({ children }: { children: ReactNode }) {
        let wrappedChildren = <BrowserRouter>{children}</BrowserRouter>;

        if (withAuth) {
            wrappedChildren = <AuthProvider>{wrappedChildren}</AuthProvider>;
        }

        if (withAdminUI) {
            wrappedChildren = <AdminUIProvider>{wrappedChildren}</AdminUIProvider>;
        }

        return wrappedChildren;
    }

    return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-exportar todo desde @testing-library/react
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';
export { renderWithProviders as render };
