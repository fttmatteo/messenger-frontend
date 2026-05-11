import { useEffect, useRef, useCallback } from 'react';

declare global {
    interface Window {
        turnstile?: {
            render: (
                container: string | HTMLElement,
                options: TurnstileOptions
            ) => string;
            reset: (widgetId: string) => void;
            remove: (widgetId: string) => void;
        };
        onTurnstileLoad?: () => void;
    }
}

interface TurnstileOptions {
    sitekey: string;
    callback: (token: string) => void;
    'error-callback'?: () => void;
    'expired-callback'?: () => void;
    theme?: 'light' | 'dark' | 'auto';
    size?: 'normal' | 'compact';
    appearance?: 'always' | 'execute' | 'interaction-only';
}

interface TurnstileWidgetProps {
    onVerify: (token: string) => void;
    onError?: () => void;
    onExpire?: () => void;
    onWidgetId?: (widgetId: string) => void;
    theme?: 'light' | 'dark' | 'auto';
    size?: 'normal' | 'compact';
    className?: string;
}

const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

import { createLogger } from '@/utils/logger';
const logger = createLogger('TurnstileWidget');

/**
 * Componente de Cloudflare Turnstile para verificación anti-bot.
 * Renderiza un widget invisible o visible que genera un token de verificación.
 */
export function TurnstileWidget({
    onVerify,
    onError,
    onExpire,
    onWidgetId,
    theme = 'auto',
    size = 'normal',
    className = '',
}: TurnstileWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const scriptLoadedRef = useRef(false);
    const retryCountRef = useRef(0);
    const maxRetries = 3;

    // Usar refs para los callbacks para evitar recrear el widget si cambian
    const onVerifyRef = useRef(onVerify);
    const onErrorRef = useRef(onError);
    const onExpireRef = useRef(onExpire);

    useEffect(() => {
        onVerifyRef.current = onVerify;
        onErrorRef.current = onError;
        onExpireRef.current = onExpire;
    }, [onVerify, onError, onExpire]);

    const handleVerify = useCallback((token: string) => {
        onVerifyRef.current(token);
    }, []);

    const handleError = useCallback(() => {
        onErrorRef.current?.();
    }, []);

    const handleExpire = useCallback(() => {
        onExpireRef.current?.();
    }, []);

    useEffect(() => {
        // Bypass para desarrollo si se usa la clave de prueba de Cloudflare
        // Site key: 1x00000000000000000000AA
        const isTestKey = SITE_KEY?.trim().startsWith('1x00000000');
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

        if (isTestKey || (isLocalhost && !SITE_KEY)) {
            logger.info('Bypass de Turnstile activado (entorno de desarrollo/local)');
            onVerifyRef.current('dummy-dev-token');
            return;
        }

        // Verificar que tenemos la site key
        if (!SITE_KEY) {
            logger.error('VITE_TURNSTILE_SITE_KEY no está configurada');
            return;
        }

        const renderWidget = () => {
            if (!containerRef.current || !window.turnstile) return;

            // Renderizar nuevo widget si no existe
            if (!widgetIdRef.current) {
                const id = window.turnstile.render(containerRef.current, {
                    sitekey: SITE_KEY,
                    callback: handleVerify,
                    'error-callback': handleError,
                    'expired-callback': handleExpire,
                    theme,
                    size,
                    appearance: 'execute',
                });
                widgetIdRef.current = id;
                if (onWidgetId) {
                    onWidgetId(id);
                }
            }
        };

        if (window.turnstile) {
            renderWidget();
        } else {
            const existingScript = document.querySelector(
                `script[src*="challenges.cloudflare.com/turnstile"]`
            );

            if (!existingScript && !scriptLoadedRef.current) {
                scriptLoadedRef.current = true;

                const loadScript = () => {
                    const script = document.createElement('script');
                    script.src = `${TURNSTILE_SCRIPT_URL}?onload=onTurnstileLoad`;
                    script.async = true;
                    script.defer = true;
                    window.onTurnstileLoad = renderWidget;

                    script.onerror = () => {
                        logger.error(`Error al cargar el script de Turnstile (Intento ${retryCountRef.current + 1}/${maxRetries})`);
                        script.remove();

                        if (retryCountRef.current < maxRetries) {
                            retryCountRef.current++;
                            setTimeout(() => {
                                loadScript();
                            }, 1000 * retryCountRef.current);
                        } else {
                            handleError();
                        }
                    };
                    document.head.appendChild(script);
                };

                loadScript();
            } else if (existingScript) {
                const checkAndRender = () => {
                    if (window.turnstile) {
                        renderWidget();
                    } else {
                        setTimeout(checkAndRender, 100);
                    }
                };
                checkAndRender();
            }
        }
        // Cleanup: Solo remover si el componente se desmonta DE VERDAD
        return () => {
            // No removemos el widget aquí para evitar parpadeos en re-renders
            // El script se queda cargado y el contenedor se mantiene si el componente no cambia
        };
    }, [theme, size, handleVerify, handleError, handleExpire, onWidgetId]);

    useEffect(() => {
        return () => {
            if (widgetIdRef.current && window.turnstile) {
                try {
                    window.turnstile.remove(widgetIdRef.current);
                    widgetIdRef.current = null;
                } catch {
                    // Ignorar errores de limpieza
                }
            }
        };
    }, []);

    if (!SITE_KEY) {
        return (
            <div className="text-xs text-destructive">
                Error: Turnstile no configurado
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`turnstile-container flex justify-center ${className}`}
        />
    );
}
