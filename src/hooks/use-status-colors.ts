import { useContext } from 'react'
import { StatusColorContext, type StatusColorContextType } from '@/context/StatusColorContextDef'

export function useStatusColors(): StatusColorContextType {
    const context = useContext(StatusColorContext)
    if (context === undefined) {
        throw new Error('useStatusColors must be used within a StatusColorProvider')
    }
    return context
}
