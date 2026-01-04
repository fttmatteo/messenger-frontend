import type { ServiceStatus } from "@/types/service.types"
import { Car, Bike, Truck } from "lucide-react"
import { getStatusHexColor, getStatusLabel, getMergedColors, getStatusPillBackground } from "@/lib/status-colors"

interface StatusBadgeConfig {
    label: string
    className: string
    style?: React.CSSProperties
}

/**
 * Get the badge configuration for a service status.
 * Uses dynamic colors from the centralized color system.
 */
export function getStatusBadge(status: ServiceStatus | string, customColors?: Record<string, string>): StatusBadgeConfig {
    const colors = customColors || getMergedColors()
    return {
        label: getStatusLabel(status),
        className: 'text-white', // className only for text color
        style: { backgroundColor: colors[status] || getStatusHexColor(status, colors), color: 'white' }
    }
}

interface StatusIconConfig {
    label: string
    dotColor: string // Kept for legacy support but prefer dotStyle
    textColor: string // Kept for legacy support but prefer textStyle
    dotStyle: React.CSSProperties
    textStyle: React.CSSProperties
    pillBackground: string // Background color for pill container (low opacity)
}

/**
 * Get the icon configuration for a service status (circular dot + text).
 * Uses dynamic colors from the centralized color system.
 */
export function getStatusIconConfig(status: ServiceStatus | string, customColors?: Record<string, string>): StatusIconConfig {
    const hexColor = getStatusHexColor(status, customColors)
    return {
        label: getStatusLabel(status),
        // Legacy class names - kept empty for backward compatibility with components that don't use styles
        dotColor: '',
        textColor: '',
        // New inline styles with dynamic colors
        dotStyle: { backgroundColor: hexColor },
        textStyle: { color: hexColor },
        // Pill background with 15% opacity
        pillBackground: getStatusPillBackground(status, customColors, 0.15)
    }
}

/**
 * Get the display label for a plate type.
 */
export function getPlateTypeLabel(plateType: string): string {
    const types: Record<string, string> = {
        CAR: 'Carro',
        MOTORCYCLE: 'Moto',
        MOTORCAR: 'Motocarro',
    }
    return types[plateType] || plateType
}

/**
 * Get the icon component for a plate type.
 */
export function getPlateTypeIcon(plateType: string): typeof Car | typeof Bike | typeof Truck {
    const icons: Record<string, typeof Car | typeof Bike | typeof Truck> = {
        CAR: Car,
        MOTORCYCLE: Bike,
        MOTORCAR: Truck,
    }
    return icons[plateType] || Car
}

// ============================================
// Business Rules for Status Transitions
// ============================================

type UserRole = 'ADMIN' | 'MESSENGER'

interface AvailableStatus {
    value: ServiceStatus
    label: string
}

/**
 * Get available statuses for a user based on their role.
 * 
 * Business Rules:
 * - MESSENGER can only use: PENDING, DELIVERED, RETURNED
 * - ADMIN can only use: CANCELED, RESOLVED
 */
export function getAvailableStatusesForUser(
    role: UserRole
): AvailableStatus[] {
    const MESSENGER_STATUSES: AvailableStatus[] = [
        { value: 'PENDING', label: 'Pendiente' },
        { value: 'DELIVERED', label: 'Entregado' },
        { value: 'RETURNED', label: 'Devuelto' },
    ]

    const ADMIN_STATUSES: AvailableStatus[] = [
        { value: 'CANCELED', label: 'Cancelado' },
        { value: 'RESOLVED', label: 'Revisado' },
    ]

    if (role === 'MESSENGER') {
        return MESSENGER_STATUSES
    }

    if (role === 'ADMIN') {
        return ADMIN_STATUSES
    }

    return []
}


/**
 * Check if a service is locked for a specific user role.
 * Returns a message explaining why it's locked, or null if not locked.
 */
export function getServiceLockReason(): string | null {
    // No locks - all states can be changed based only on role permissions
    return null
}

/**
 * Check if the current user can edit the service (update status).
 */
export function canUserEditService(
    role: UserRole
): boolean {
    const availableStatuses = getAvailableStatusesForUser(role)
    return availableStatuses.length > 0
}
