import { createContext } from 'react'

export interface NetworkContextType {
    /** Current network connectivity status */
    isOnline: boolean
    /** Whether the app was recently offline (useful for showing reconnection messages) */
    wasOffline: boolean
    /** Whether the PWA is ready to work offline */
    offlineReady: boolean
    /** Whether a new version of the app is available */
    needRefresh: boolean
    /** Number of pending offline actions to sync */
    pendingActionsCount: number
    /** Update the service worker to the new version */
    updateServiceWorker: () => void
    /** Dismiss the update notification */
    dismissUpdate: () => void
}

export const NetworkContext = createContext<NetworkContextType | null>(null)
