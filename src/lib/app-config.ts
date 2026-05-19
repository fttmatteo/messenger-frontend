declare const __APP_VERSION__: string;

/**
 * Configuración centralizada de la aplicación.
 * Agrupa variables de entorno y valores por defecto en un solo lugar.
 */
export const APP_CONFIG = {
    name: 'PLAK',
    version: __APP_VERSION__,
    description: 'Sistema de gestión de entrega de placas',
    supportEmail: 'contacto@plak.digital',
} as const

/**
 * Abre el cliente de correo con un borrador pre-configurado para contacto/soporte.
 */
export function openSupportEmail(subject?: string): void {
    const email = APP_CONFIG.supportEmail
    const defaultSubject = subject || 'Contacto - PLAK'
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(defaultSubject)}`
}
