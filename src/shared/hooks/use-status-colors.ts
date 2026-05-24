import { useContext } from 'react'
import { StatusColorContext, type StatusColorContextType } from '@/shared/context/StatusColorContextDef'

/**
 * Hook de conveniencia para acceder al contexto de colores de estado.
 * Proporciona el mapa de colores actual y funciones para su personalización.
 */
export function useStatusColors(): StatusColorContextType {
    const context = useContext(StatusColorContext)
    if (context === undefined) {
        throw new Error('useStatusColors debe ser usado dentro de un StatusColorProvider')
    }
    return context
}
