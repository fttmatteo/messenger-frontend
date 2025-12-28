import type { ServiceStatus } from "@/types/service.types"

// Default status colors (HEX format)
export const DEFAULT_STATUS_COLORS: Record<string, string> = {
    ASSIGNED: '#00eeffe1',   // blue-500
    PENDING: '#ff6f00e8',    // indigo-500
    DELIVERED: '#04ff60dd',  // green-500
    RETURNED: '#fbff00d1',   // orange-500
    CANCELED: '#ff00b7d6',   // red-500
    RESOLVED: '#1900ffdb',   // purple-500
    DELETED: '#ff0000dd',    // slate-500
}

// Default fallback color
const DEFAULT_FALLBACK_COLOR = '#6b7280' // gray-500

// LocalStorage key prefix - userId will be appended
const STORAGE_KEY_PREFIX = 'status-colors-'

/**
 * Get the storage key for a specific user
 */
function getStorageKey(userId?: number | string): string {
    if (!userId) {
        return 'status-colors-default'
    }
    return `${STORAGE_KEY_PREFIX}${userId}`
}

/**
 * Load custom colors from localStorage for a specific user
 */
export function loadCustomColors(userId?: number | string): Record<string, string> {
    try {
        const stored = localStorage.getItem(getStorageKey(userId))
        if (stored) {
            return JSON.parse(stored)
        }
    } catch (error) {
        console.error('Error loading custom colors:', error)
    }
    return {}
}

/**
 * Save custom colors to localStorage for a specific user
 */
export function saveCustomColors(colors: Record<string, string>, userId?: number | string): void {
    try {
        localStorage.setItem(getStorageKey(userId), JSON.stringify(colors))
    } catch (error) {
        console.error('Error saving custom colors:', error)
    }
}

/**
 * Clear custom colors from localStorage for a specific user (restore defaults)
 */
export function clearCustomColors(userId?: number | string): void {
    try {
        localStorage.removeItem(getStorageKey(userId))
    } catch (error) {
        console.error('Error clearing custom colors:', error)
    }
}

/**
 * Get merged colors (defaults + custom overrides) for a specific user
 */
export function getMergedColors(userId?: number | string): Record<string, string> {
    const customColors = loadCustomColors(userId)
    return { ...DEFAULT_STATUS_COLORS, ...customColors }
}

/**
 * Get the HEX color for a status
 */
export function getStatusHexColor(status?: ServiceStatus | string, customColors?: Record<string, string>): string {
    const colors = customColors || getMergedColors()
    return colors[status || ''] || DEFAULT_FALLBACK_COLOR
}

/**
 * Get inline style for status dot (background color)
 */
export function getStatusDotStyle(status: ServiceStatus | string, customColors?: Record<string, string>): React.CSSProperties {
    return {
        backgroundColor: getStatusHexColor(status, customColors)
    }
}

/**
 * Get inline style for status text
 */
export function getStatusTextStyle(status: ServiceStatus | string, customColors?: Record<string, string>): React.CSSProperties {
    return {
        color: getStatusHexColor(status, customColors)
    }
}

/**
 * Get inline style for status badge (background + white text)
 */
export function getStatusBadgeStyle(status: ServiceStatus | string, customColors?: Record<string, string>): React.CSSProperties {
    return {
        backgroundColor: getStatusHexColor(status, customColors),
        color: 'white'
    }
}

/**
 * Status labels in Spanish
 */
export const STATUS_LABELS: Record<string, string> = {
    ASSIGNED: 'Asignado',
    PENDING: 'Pendiente',
    DELIVERED: 'Entregado',
    RETURNED: 'Devuelto',
    CANCELED: 'Cancelado',
    RESOLVED: 'Revisado',
    DELETED: 'Eliminado',
}

/**
 * Get status label
 */
export function getStatusLabel(status: ServiceStatus | string): string {
    return STATUS_LABELS[status] || status
}
