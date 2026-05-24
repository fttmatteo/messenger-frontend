import { useCallback } from 'react';

/**
 * Hook para resetear el widget de Turnstile.
 * Útil cuando se necesita generar un nuevo token después de un error.
 */
export function useTurnstileReset(widgetId: string | null) {
    return useCallback(() => {
        if (widgetId && window.turnstile) {
            window.turnstile.reset(widgetId);
        }
    }, [widgetId]);
}
