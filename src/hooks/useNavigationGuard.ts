import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ROUTE_HIERARCHY: Record<string, string | null> = {
    '/messenger': null,
    '/messenger/crear': '/messenger',
    '/messenger/servicios': '/messenger',
    '/messenger/configuracion': '/messenger',
    '/messenger/configuracion/apariencia': '/messenger/configuracion',
};

function matchRoute(path: string): { matched: string | null; parent: string | null } {
    if (path in ROUTE_HIERARCHY) {
        return { matched: path, parent: ROUTE_HIERARCHY[path] };
    }

    if (/^\/messenger\/servicio\/[^/]+\/actualizar$/.test(path)) {
        return {
            matched: '/messenger/servicio/:id/actualizar',
            parent: '/messenger'
        };
    }

    return { matched: null, parent: null };
}

export function getParentRoute(path: string): string | null {
    const { parent } = matchRoute(path);
    return parent;
}

export function isRootRoute(path: string): boolean {
    return path === '/messenger';
}

export function isMessengerRoute(path: string): boolean {
    return path.startsWith('/messenger');
}

/**
 * Hook para gestionar la lógica de navegación "hacia atrás" basada en jerarquías.
 * Asegura que el usuario regrese a la pantalla lógica superior en lugar de simplemente a la página anterior en el historial.
 */
export function useNavigationGuard() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleBackNavigation = useCallback(() => {
        const path = window.location.pathname;

        if (path === '/login' || path === '/') {
            navigate('/', { replace: true });
            return;
        }

        if (isRootRoute(path)) {
            window.history.pushState(null, '', path);
            return;
        }

        const parentRoute = getParentRoute(path);

        if (parentRoute) {
            navigate(parentRoute, { replace: true });
        } else {
            navigate('/', { replace: true });
        }
    }, [navigate]);

    useEffect(() => {
        const path = location.pathname;

        if (isRootRoute(path)) {
            window.history.pushState(null, '', path);
        }

        const handlePopState = () => {
            handleBackNavigation();
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [handleBackNavigation, location.pathname]);

    return {
        handleBackNavigation,
        getParentRoute,
        isRootRoute,
        currentPath: location.pathname,
    };
}


/**
 * Redirige al usuario al dashboard de mensajería después de un login exitoso,
 * reemplazando el historial para evitar retrocesos al login.
 */
export function navigateAfterLogin(navigate: ReturnType<typeof useNavigate>) {
    window.history.replaceState(null, '', '/');
    navigate('/', { replace: true });
}
