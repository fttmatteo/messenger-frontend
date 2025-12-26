import React, { type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { AdminUIProvider } from '@/context/AdminUIContext';

/**
 * Custom render function that wraps components with all necessary providers
 * for integration testing (Router, Auth, AdminUI).
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    /** Initial route for the Router */
    initialRoute?: string;
    /** Whether to include AuthProvider (default: true) */
    withAuth?: boolean;
    /** Whether to include AdminUIProvider (default: true) */
    withAdminUI?: boolean;
}

export function renderWithProviders(
    ui: React.ReactElement,
    {
        initialRoute = '/',
        withAuth = true,
        withAdminUI = true,
        ...renderOptions
    }: CustomRenderOptions = {}
) {
    // Set initial route if specified
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

// Re-export everything from @testing-library/react
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';
export { renderWithProviders as render };
