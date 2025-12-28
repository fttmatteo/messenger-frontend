import { createContext } from 'react'

export interface StatusColorContextType {
    colors: Record<string, string>
    updateColor: (status: string, color: string) => void
    resetToDefaults: () => void
    isModified: boolean
}

export const StatusColorContext = createContext<StatusColorContextType | undefined>(undefined)
