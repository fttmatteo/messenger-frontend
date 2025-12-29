import { useContext } from 'react'
import { StatusColorContext, type StatusColorContextType } from '@/context/StatusColorContextDef'

/**
 * Hook to access the StatusColor context.
 * Must be used within a StatusColorProvider.
 */
export function useStatusColors(): StatusColorContextType {
    const context = useContext(StatusColorContext)
    if (context === undefined) {
        throw new Error('useStatusColors must be used within a StatusColorProvider')
    }
    return context
}
