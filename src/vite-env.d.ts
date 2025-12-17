/**
 * Definiciones de Tipos para Variables de Entorno de Vite
 * 
 * Este archivo declara los tipos para las variables de entorno
 * accesibles a través de import.meta.env en la aplicación.
 * 
 * Las variables con prefijo VITE_ son expuestas al código cliente
 * por Vite durante el proceso de build.
 */

/// <reference types="vite/client" />

/**
 * Interface que define las variables de entorno disponibles.
 * Todas las variables retornan string ya que provienen del archivo .env
 */
interface ImportMetaEnv {
    /**
     * URL base de la API REST del backend.
     * @example "http://localhost:8080"
     */
    readonly VITE_API_URL: string

    /**
     * URL del WebSocket para tracking en tiempo real.
     * @example "ws://localhost:8080/ws"
     */
    readonly VITE_WS_URL: string

    /**
     * Clave de API de Google Maps JavaScript.
     * Requerida para el componente de mapas.
     */
    readonly VITE_GOOGLE_MAPS_API_KEY: string
}

/**
 * Extensión de ImportMeta para incluir las variables de entorno tipadas.
 */
interface ImportMeta {
    readonly env: ImportMetaEnv
}
