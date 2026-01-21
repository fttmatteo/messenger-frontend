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
    theme?: 'light' | 'dark' | 'auto';
    size?: 'normal' | 'compact';
    className?: string;
}

const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

/**
 * Componente de Cloudflare Turnstile para verificación anti-bot.
 * Renderiza un widget invisible o visible que genera un token de verificación.
 */
export function TurnstileWidget({
    onVerify,
    onError,
    onExpire,
    theme = 'auto',
    size = 'normal',
    className = '',
}: TurnstileWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const scriptLoadedRef = useRef(false);

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
        // Verificar que tenemos la site key
        if (!SITE_KEY) {
            console.error('TurnstileWidget: VITE_TURNSTILE_SITE_KEY no está configurada');
            return;
        }

        const renderWidget = () => {
            if (!containerRef.current || !window.turnstile) return;

            // Renderizar nuevo widget si no existe
            if (!widgetIdRef.current) {
                widgetIdRef.current = window.turnstile.render(containerRef.current, {
                    sitekey: SITE_KEY,
                    callback: handleVerify,
                    'error-callback': handleError,
                    'expired-callback': handleExpire,
                    theme,
                    size,
                    appearance: 'always',
                });
            }
        };

        // Si el script ya está cargado, renderizar directamente
        if (window.turnstile) {
            renderWidget();
        } else {
            // Cargar el script de Turnstile si no existe en el DOM
            const existingScript = document.querySelector(
                `script[src*="challenges.cloudflare.com/turnstile"]`
            );

            if (!existingScript && !scriptLoadedRef.current) {
                scriptLoadedRef.current = true;
                const script = document.createElement('script');
                script.src = `${TURNSTILE_SCRIPT_URL}?onload=onTurnstileLoad`;
                script.async = true;
                script.defer = true;
                window.onTurnstileLoad = renderWidget;
                script.onerror = () => {
                    console.error('TurnstileWidget: Error al cargar el script de Turnstile');
                    handleError();
                };
                document.head.appendChild(script);
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
    }, [theme, size, handleVerify, handleError, handleExpire]);

    // Cleanup al desmontar el componente
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
