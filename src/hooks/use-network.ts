import { useContext } from 'react'
import { NetworkContext } from '@/context/NetworkContextDef'

/**
 * Hook de conveniencia para acceder al contexto de red.
 * Proporciona el estado de conexión y utilidades de sincronización offline.
 */
export function useNetwork() {
    const context = useContext(NetworkContext)

    if (!context) {
        throw new Error('useNetwork must be used within a NetworkProvider')
    }

    return context
}
