// Declaración para el compilador de TS de la variable inyectada por Vite
declare const __APP_VERSION__: string;

/**
 * Configuración centralizada de la aplicación.
 * Agrupa variables de entorno y valores por defecto en un solo lugar.
 */
export const APP_CONFIG = {
    name: 'PLAK',
    version: __APP_VERSION__,
    description: 'Sistema de gestión de entrega de placas',
    supportEmail: 'soporte@plak.digital',
} as const

/**
 * Abre el cliente de correo con un borrador pre-configurado para soporte.
 */
export function openSupportEmail(subject?: string): void {
    const email = APP_CONFIG.supportEmail
    const defaultSubject = subject || 'Soporte - PLAK'
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(defaultSubject)}`
}
