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
        const serviceId = path.match(/^\/messenger\/servicio\/([^/]+)\/actualizar$/)?.[1];
        return {
            matched: '/messenger/servicio/:id/actualizar',
            parent: serviceId ? `/messenger/servicio/${serviceId}` : '/messenger'
        };
    }

    if (/^\/messenger\/servicio\/[^/]+$/.test(path)) {
        return { matched: '/messenger/servicio/:id', parent: '/messenger' };
    }

    return { matched: null, parent: null };
}

/**
 * Obtiene la ruta padre de una ruta dada basándose en la jerarquía definida.
 */
export function getParentRoute(path: string): string | null {
    const { parent } = matchRoute(path);
    return parent;
}

/**
 * Indica si la ruta actual es la raíz de la aplicación de mensajería.
 */
export function isRootRoute(path: string): boolean {
    return path === '/messenger';
}

/**
 * Indica si el usuario se encuentra dentro del flujo de mensajería.
 */
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
            navigate('/messenger', { replace: true });
            return;
        }

        if (isRootRoute(path)) {
            return;
        }

        const parentRoute = getParentRoute(path);

        if (parentRoute) {
            navigate(parentRoute, { replace: true });
        } else {
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
 * Redirige al usuario al dashboard de mensajería después de un login exitoso,
 * reemplazando el historial para evitar retrocesos al login.
 */
export function navigateAfterLogin(navigate: ReturnType<typeof useNavigate>) {
    window.history.replaceState(null, '', '/messenger');
    navigate('/messenger', { replace: true });
}
