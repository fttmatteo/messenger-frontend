/**
 * Configuración centralizada de la aplicación.
 * Agrupa variables de entorno y valores por defecto en un solo lugar.
 */
export const APP_CONFIG = {
    name: import.meta.env.VITE_APP_NAME || 'PLAK',
    description: import.meta.env.VITE_APP_DESCRIPTION || 'Sistema de gestión de mensajería',
    supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'soporte@plak.digital',
} as const

/**
 * Abre el cliente de correo con un borrador pre-configurado para soporte.
 * @param subject - Asunto del correo (opcional)
 */
export function openSupportEmail(subject?: string): void {
    const email = APP_CONFIG.supportEmail
    const defaultSubject = subject || 'Solicitud de ayuda - PLAK'
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(defaultSubject)}`
}
