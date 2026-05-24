import { createContext } from 'react'

/**
 * Estructura del contexto de red y estado PWA.
 */
export interface NetworkContextType {
    isOnline: boolean
    wasOffline: boolean
    offlineReady: boolean
    needRefresh: boolean
    pendingActionsCount: number
    updateServiceWorker: () => void
    dismissUpdate: () => void
}

export const NetworkContext = createContext<NetworkContextType | null>(null)
