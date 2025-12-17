/**
 * Configuración de Variables de Entorno
 * 
 * Este módulo centraliza el acceso a todas las variables de entorno
 * de la aplicación Messenger Frontend. Todas las variables deben
 * ser accedidas a través de este módulo para garantizar tipado
 * seguro y gestión centralizada de la configuración.
 * 
 * Las variables con prefijo VITE_ son expuestas al cliente por Vite.
 */

/**
 * Objeto de configuración con todas las variables de entorno.
 * Los valores por defecto se usan cuando la variable no está definida.
 */
export const env = {
    /**
     * URL base de la API REST del backend.
     * @example "http://localhost:8080"
     */
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080',

    /**
     * URL del WebSocket para tracking en tiempo real.
     * @example "ws://localhost:8080/ws"
     */
    WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws',

    /**
     * Clave de API de Google Maps JavaScript.
     * Requerida para mostrar mapas y tracking en vivo.
     */
    GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',

    /**
     * Modo actual de la aplicación (development, production, etc.)
     */
    MODE: import.meta.env.MODE,

    /**
     * Indica si la aplicación está en modo desarrollo.
     */
    DEV: import.meta.env.DEV,

    /**
     * Indica si la aplicación está en modo producción.
     */
    PROD: import.meta.env.PROD,
} as const

/**
 * Obtiene una variable de entorno requerida de forma segura.
 * Lanza un error si la variable no está definida.
 * 
 * @param key - Nombre de la variable de entorno a obtener.
 * @returns El valor de la variable de entorno.
 * @throws Error si la variable no está definida.
 * 
 * @example
 * const apiKey = getRequiredEnv('GOOGLE_MAPS_API_KEY')
 * // Lanza error si GOOGLE_MAPS_API_KEY no está configurada
 */
export function getRequiredEnv(key: keyof typeof env): string {
    const value = env[key]
    if (!value) {
        throw new Error(`Variable de entorno requerida no encontrada: ${key}`)
    }
    return String(value)
}
