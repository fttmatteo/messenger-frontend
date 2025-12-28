import type { ServiceStatus } from "@/types/service.types"

// Default status colors (HEX format)
export const DEFAULT_STATUS_COLORS: Record<string, string> = {
    ASSIGNED: '#3b82f6',   // blue-500
    PENDING: '#6366f1',    // indigo-500
    DELIVERED: '#22c55e',  // green-500
    RETURNED: '#f97316',   // orange-500
    CANCELED: '#ef4444',   // red-500
    RESOLVED: '#a855f7',   // purple-500
    DELETED: '#64748b',    // slate-500
}

// Default fallback color
const DEFAULT_FALLBACK_COLOR = '#6b7280' // gray-500

// LocalStorage key
const STORAGE_KEY = 'status-colors'

/**
 * Load custom colors from localStorage
 */
export function loadCustomColors(): Record<string, string> {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            return JSON.parse(stored)
        }
    } catch (error) {
        console.error('Error loading custom colors:', error)
    }
    return {}
}

/**
 * Save custom colors to localStorage
 */
export function saveCustomColors(colors: Record<string, string>): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(colors))
    } catch (error) {
        console.error('Error saving custom colors:', error)
    }
}

/**
 * Clear custom colors from localStorage (restore defaults)
 */
export function clearCustomColors(): void {
    try {
        localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
        console.error('Error clearing custom colors:', error)
    }
}

/**
 * Get merged colors (defaults + custom overrides)
 */
export function getMergedColors(): Record<string, string> {
    const customColors = loadCustomColors()
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
