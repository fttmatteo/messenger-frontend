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
/// <reference types="vite-plugin-pwa/client" />

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

/**
 * Declaración del módulo virtual de vite-plugin-pwa
 * Permite importar el hook useRegisterSW para React
 */
declare module 'virtual:pwa-register/react' {
    import type { Dispatch, SetStateAction } from 'react'

    export interface RegisterSWOptions {
        immediate?: boolean
        onNeedRefresh?: () => void
        onOfflineReady?: () => void
        onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void
        onRegisterError?: (error: Error) => void
    }

    export function useRegisterSW(options?: RegisterSWOptions): {
        needRefresh: [boolean, Dispatch<SetStateAction<boolean>>]
        offlineReady: [boolean, Dispatch<SetStateAction<boolean>>]
        updateServiceWorker: (reloadPage?: boolean) => Promise<void>
    }
}
