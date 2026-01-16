import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Route hierarchy for the messenger PWA.
 * Each route maps to its parent route (null means it's a root route).
 * This enables proper back navigation behavior on mobile devices.
 */
const ROUTE_HIERARCHY: Record<string, string | null> = {
    '/messenger': null, // Root - no parent
    '/messenger/crear': '/messenger',
    '/messenger/servicios': '/messenger',
    '/messenger/configuracion': '/messenger',
    '/messenger/configuracion/apariencia': '/messenger/configuracion',
};

/**
 * Matches a path against the route hierarchy, handling dynamic segments.
 * For example, '/messenger/servicio/123' matches '/messenger/servicio/:id'
 */
function matchRoute(path: string): { matched: string | null; parent: string | null } {
    // First, try exact match
    if (path in ROUTE_HIERARCHY) {
        return { matched: path, parent: ROUTE_HIERARCHY[path] };
    }

    // Check for dynamic route patterns
    // /messenger/servicio/:id/actualizar
    if (/^\/messenger\/servicio\/[^/]+\/actualizar$/.test(path)) {
        const serviceId = path.match(/^\/messenger\/servicio\/([^/]+)\/actualizar$/)?.[1];
        return {
            matched: '/messenger/servicio/:id/actualizar',
            parent: serviceId ? `/messenger/servicio/${serviceId}` : '/messenger'
        };
    }

    // /messenger/servicio/:id
    if (/^\/messenger\/servicio\/[^/]+$/.test(path)) {
        return { matched: '/messenger/servicio/:id', parent: '/messenger' };
    }

    // No match found
    return { matched: null, parent: null };
}

/**
 * Gets the parent route for a given path.
 * Returns null if the path is a root route or not found in hierarchy.
 */
export function getParentRoute(path: string): string | null {
    const { parent } = matchRoute(path);
    return parent;
}

/**
 * Checks if a path is the root route of the messenger app.
 */
export function isRootRoute(path: string): boolean {
    return path === '/messenger';
}

/**
 * Checks if a path is within the messenger authenticated area.
 */
export function isMessengerRoute(path: string): boolean {
    return path.startsWith('/messenger');
}

/**
 * Hook that provides navigation guard functionality for PWA back gesture handling.
 * 
 * This hook:
 * - Listens to browser popstate events (back gesture/button)
 * - Navigates to the correct parent route based on hierarchy
 * - Prevents navigation back to login when authenticated
 * - Uses replace to avoid polluting browser history
 */
export function useNavigationGuard() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleBackNavigation = useCallback(() => {
        const path = window.location.pathname;

        // Prevent navigation outside authenticated area
        if (path === '/login' || path === '/') {
            navigate('/messenger', { replace: true });
            return;
        }

        // If already at root, let default behavior happen (minimize/close app)
        if (isRootRoute(path)) {
            return;
        }

        // Get parent route from hierarchy
        const parentRoute = getParentRoute(path);

        if (parentRoute) {
            navigate(parentRoute, { replace: true });
        } else {
            // Fallback: if no parent defined, go to messenger home
            navigate('/messenger', { replace: true });
        }
    }, [navigate]);

    useEffect(() => {
        const handlePopState = () => {
            handleBackNavigation();
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [handleBackNavigation]);

    return {
        handleBackNavigation,
        getParentRoute,
        isRootRoute,
        currentPath: location.pathname,
    };
}

/**
 * Clears browser history and navigates to the messenger home.
 * Call this after successful login to prevent back navigation to login.
 */
export function navigateAfterLogin(navigate: ReturnType<typeof useNavigate>) {
    // Replace current history entry with messenger home
    window.history.replaceState(null, '', '/messenger');
    navigate('/messenger', { replace: true });
}
