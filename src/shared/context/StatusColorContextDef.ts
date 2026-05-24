import { createContext } from 'react'

/**
 * Estructura del contexto para la gestión de colores de estado.
 */
export interface StatusColorContextType {
    colors: Record<string, string>
    updateColor: (status: string, color: string) => void
    resetToDefaults: () => void
    isModified: boolean
}

export const StatusColorContext = createContext<StatusColorContextType | undefined>(undefined)
