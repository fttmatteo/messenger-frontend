import { useState, useMemo, useCallback, useEffect, type ReactNode } from 'react'
import { StatusColorContext } from '@/context/StatusColorContextDef'
import {
    DEFAULT_STATUS_COLORS,
    loadCustomColors,
    saveCustomColors,
    clearCustomColors,
} from '@/lib/status-colors'
import { configService } from '@/services/config.service'
import { authService } from '@/services/auth.service'
import { logger } from '@/utils/logger'

interface StatusColorProviderProps {
    children: ReactNode
    userId?: number | string
}

export function StatusColorProvider({ children, userId }: StatusColorProviderProps) {
    const [colors, setColors] = useState<Record<string, string>>(() => {
        const customColors = loadCustomColors(userId)
        return { ...DEFAULT_STATUS_COLORS, ...customColors }
    })

    useEffect(() => {
        const fetchColors = async () => {
            try {
                const backendColors = await configService.getStatusColors()
                if (backendColors && Object.keys(backendColors).length > 0) {
                    const merged = { ...DEFAULT_STATUS_COLORS, ...backendColors }
                    setColors(merged)
                    const differences: Record<string, string> = {}
                    Object.keys(merged).forEach(key => {
                        if (merged[key] !== DEFAULT_STATUS_COLORS[key]) {
                            differences[key] = merged[key]
                        }
                    })
                    saveCustomColors(differences, userId)
                }
            } catch (error) {
                logger.error('Error fetching status colors from backend:', error)
            }
        }

        fetchColors()
    }, [userId])

    const isModified = useMemo(() => {
        return Object.keys(DEFAULT_STATUS_COLORS).some(
            status => colors[status] !== DEFAULT_STATUS_COLORS[status]
        )
    }, [colors])

    const updateColor = useCallback(async (status: string, color: string) => {
        setColors(prev => {
            const newColors = { ...prev, [status]: color }

            const customColors: Record<string, string> = {}
            Object.keys(newColors).forEach(key => {
                if (newColors[key] !== DEFAULT_STATUS_COLORS[key]) {
                    customColors[key] = newColors[key]
                }
            })
            saveCustomColors(customColors, userId)

            const role = authService.getRole()
            if (role === 'ADMIN') {
                configService.updateStatusColors(newColors).catch(err => {
                    logger.error('Error syncing colors to backend:', err)
                })
            }

            return newColors
        })
    }, [userId])

    const resetToDefaults = useCallback(async () => {
        clearCustomColors(userId)
        setColors({ ...DEFAULT_STATUS_COLORS })

        const role = authService.getRole()
        if (role === 'ADMIN') {
            configService.updateStatusColors(DEFAULT_STATUS_COLORS).catch(err => {
                logger.error('Error resetting colors on backend:', err)
            })
        }
    }, [userId])

    return (
        <StatusColorContext.Provider value={{ colors, updateColor, resetToDefaults, isModified }}>
            {children}
        </StatusColorContext.Provider>
    )
}
