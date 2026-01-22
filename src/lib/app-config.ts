/**
 * Configuración centralizada de la aplicación.
 * Agrupa variables de entorno y valores por defecto en un solo lugar.
 */
export const APP_CONFIG = {
    name: 'PLAK',
    version: '1.4.10',
    description: 'Sistema de gestión de entrega de placas',
    supportEmail: 'soporte@plak.digital',
} as const

/**
 * Abre el cliente de correo con un borrador pre-configurado para soporte.
 * @param subject - Asunto del correo (opcional)
 */
export function openSupportEmail(subject?: string): void {
    const email = APP_CONFIG.supportEmail
    const defaultSubject = subject || 'Soporte - PLAK'
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(defaultSubject)}`
}
