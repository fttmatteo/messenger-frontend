import { createContext } from 'react'

/**
 * Estructura del contexto para la gestión de colores de estado.
 */
export interface StatusColorContextType {
    /** Mapa de estados y sus colores hexadecimales asociados. */
    colors: Record<string, string>
    /** Actualiza el color de un estado específico. */
    updateColor: (status: string, color: string) => void
    /** Restablece todos los colores a sus valores por defecto. */
    resetToDefaults: () => void
    /** Indica si se han realizado modificaciones sobre los colores por defecto. */
    isModified: boolean
}

export const StatusColorContext = createContext<StatusColorContextType | undefined>(undefined)
