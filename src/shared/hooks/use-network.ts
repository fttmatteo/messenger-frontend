import { useContext } from 'react'
import { NetworkContext } from '@/shared/context/NetworkContextDef'

/**
 * Hook de conveniencia para acceder al contexto de red.
 * Proporciona el estado de conexión y utilidades de sincronización offline.
 */
export function useNetwork() {
    const context = useContext(NetworkContext)

    if (!context) {
        throw new Error('useNetwork debe ser usado dentro de un NetworkProvider')
    }

    return context
}
