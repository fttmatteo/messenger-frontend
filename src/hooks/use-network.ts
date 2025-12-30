import { useContext } from 'react'
import { NetworkContext } from '@/context/NetworkContextDef'

/**
 * Hook to access network connectivity state and offline functionality.
 * Must be used within a NetworkProvider.
 * 
 * @example
 * const { isOnline, pendingActionsCount, offlineReady } = useNetwork()
 */
export function useNetwork() {
    const context = useContext(NetworkContext)

    if (!context) {
        throw new Error('useNetwork must be used within a NetworkProvider')
    }

    return context
}
