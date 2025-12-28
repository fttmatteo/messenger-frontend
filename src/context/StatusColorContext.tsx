import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import {
    DEFAULT_STATUS_COLORS,
    loadCustomColors,
    saveCustomColors,
    clearCustomColors,
} from '@/lib/status-colors'

interface StatusColorContextType {
    colors: Record<string, string>
    updateColor: (status: string, color: string) => void
    resetToDefaults: () => void
    isModified: boolean
}

const StatusColorContext = createContext<StatusColorContextType | undefined>(undefined)

export function StatusColorProvider({ children }: { children: ReactNode }) {
    const [colors, setColors] = useState<Record<string, string>>(() => {
        // Initialize with merged colors (defaults + custom)
        const customColors = loadCustomColors()
        return { ...DEFAULT_STATUS_COLORS, ...customColors }
    })

    const [isModified, setIsModified] = useState(false)

    // Check if colors are modified from defaults
    useEffect(() => {
        const hasModifications = Object.keys(DEFAULT_STATUS_COLORS).some(
            status => colors[status] !== DEFAULT_STATUS_COLORS[status]
        )
        setIsModified(hasModifications)
    }, [colors])

    const updateColor = useCallback((status: string, color: string) => {
        setColors(prev => {
            const newColors = { ...prev, [status]: color }

            // Save only the differences from defaults
            const customColors: Record<string, string> = {}
            Object.keys(newColors).forEach(key => {
                if (newColors[key] !== DEFAULT_STATUS_COLORS[key]) {
                    customColors[key] = newColors[key]
                }
            })
            saveCustomColors(customColors)

            return newColors
        })
    }, [])

    const resetToDefaults = useCallback(() => {
        clearCustomColors()
        setColors({ ...DEFAULT_STATUS_COLORS })
    }, [])

    return (
        <StatusColorContext.Provider value={{ colors, updateColor, resetToDefaults, isModified }}>
            {children}
        </StatusColorContext.Provider>
    )
}

export function useStatusColors() {
    const context = useContext(StatusColorContext)
    if (context === undefined) {
        throw new Error('useStatusColors must be used within a StatusColorProvider')
    }
    return context
}
