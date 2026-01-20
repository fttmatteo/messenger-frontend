import { createContext } from 'react'

/**
 * Estructura del contexto de red y estado PWA.
 */
export interface NetworkContextType {
    /** Indica si hay conexión a internet. */
    isOnline: boolean
    /** Indica si el usuario estuvo offline anteriormente. */
    wasOffline: boolean
    /** Indica si el contenido offline está listo. */
    offlineReady: boolean
    /** Indica si se requiere actualizar la aplicación (SW). */
    needRefresh: boolean
    /** Cantidad de acciones pendientes de sincronización. */
    pendingActionsCount: number
    /** Ejecuta la actualización del Service Worker. */
    updateServiceWorker: () => void
    /** Descarta el aviso de actualización. */
    dismissUpdate: () => void
}

export const NetworkContext = createContext<NetworkContextType | null>(null)
