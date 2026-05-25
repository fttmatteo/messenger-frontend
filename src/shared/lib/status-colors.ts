import type { ServiceStatus } from "@/features/delivery/types/service.types"

export const DEFAULT_STATUS_COLORS: Record<string, string> = {
    ASSIGNED: '#00eeffe1',   // blue-500
    PENDING: '#ff6f00e8',    // indigo-500
    DELIVERED: '#04ff60dd',  // green-500
    RETURNED: '#fbff00d1',   // orange-500
    CANCELED: '#ff00b7d6',   // red-500
    RESOLVED: '#1900ffdb',   // purple-500
    DELETED: '#ff0000dd',    // slate-500
}

const DEFAULT_FALLBACK_COLOR = '#6b7280'

/**
 * Obtiene el color HEX para un estado
 */
export function getStatusHexColor(status?: ServiceStatus | string): string {
    return DEFAULT_STATUS_COLORS[status || ''] || DEFAULT_FALLBACK_COLOR
}

/**
 * Obtiene estilo inline para punto de estado (color de fondo)
 */
export function getStatusDotStyle(status: ServiceStatus | string): React.CSSProperties {
    return {
        backgroundColor: getStatusHexColor(status)
    }
}

/**
 * Obtiene estilo inline para texto de estado
 */
export function getStatusTextStyle(status: ServiceStatus | string): React.CSSProperties {
    return {
        color: getStatusHexColor(status)
    }
}

/**
 * Convierte un color hex (con o sin alpha) a rgba con opacidad especificada
 * Maneja colores hex de 6 caracteres (#RRGGBB) y 8 caracteres (#RRGGBBAA)
 */
export function hexToRgba(hex: string, opacity: number): string {
    const cleanHex = hex.replace('#', '')

    const r = parseInt(cleanHex.substring(0, 2), 16)
    const g = parseInt(cleanHex.substring(2, 4), 16)
    const b = parseInt(cleanHex.substring(4, 6), 16)

    const clampedOpacity = Math.min(1, Math.max(0, opacity))

    return `rgba(${r}, ${g}, ${b}, ${clampedOpacity})`
}

/**
 * Obtiene el color de fondo de la pastilla (color de estado con opacidad baja)
 */
export function getStatusPillBackground(status: ServiceStatus | string, opacity: number = 0.15): string {
    const hexColor = getStatusHexColor(status)
    return hexToRgba(hexColor, opacity)
}

/**
 * Obtiene estilo inline para insignia de estado (fondo + texto blanco)
 */
export function getStatusBadgeStyle(status: ServiceStatus | string): React.CSSProperties {
    return {
        backgroundColor: getStatusHexColor(status),
        color: 'white'
    }
}

/**
 * Etiquetas de estado en español
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
 * Obtiene etiqueta de estado
 */
export function getStatusLabel(status: ServiceStatus | string): string {
    return STATUS_LABELS[status] || status
}
