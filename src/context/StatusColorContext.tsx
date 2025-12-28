import { useState, useMemo, useCallback, type ReactNode } from 'react'
import { StatusColorContext } from '@/context/StatusColorContextDef'
import {
    DEFAULT_STATUS_COLORS,
    loadCustomColors,
    saveCustomColors,
    clearCustomColors,
} from '@/lib/status-colors'

export function StatusColorProvider({ children }: { children: ReactNode }) {
    const [colors, setColors] = useState<Record<string, string>>(() => {
        // Initialize with merged colors (defaults + custom)
        const customColors = loadCustomColors()
        return { ...DEFAULT_STATUS_COLORS, ...customColors }
    })

    // Calculate isModified using useMemo instead of useEffect + setState
    const isModified = useMemo(() => {
        return Object.keys(DEFAULT_STATUS_COLORS).some(
            status => colors[status] !== DEFAULT_STATUS_COLORS[status]
        )
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
