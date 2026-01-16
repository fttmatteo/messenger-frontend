import { createContext } from 'react'

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
