import type { ServiceStatus } from "@/types/service.types"
import { Car, Bike, Truck } from "lucide-react"

interface StatusBadgeConfig {
    label: string
    className: string
}

/**
 * Get the badge configuration for a service status.
 * Used to display consistent status badges across the application.
 */
export function getStatusBadge(status: ServiceStatus | string): StatusBadgeConfig {
    const config: Record<string, StatusBadgeConfig> = {
        ASSIGNED: { label: 'Asignado', className: 'bg-blue-500 text-white' },
        PENDING: { label: 'Pendiente', className: 'bg-indigo-500 text-white' },
        DELIVERED: { label: 'Entregado', className: 'bg-green-500 text-white' },
        RETURNED: { label: 'Devuelto', className: 'bg-orange-500 text-white' },
        CANCELED: { label: 'Cancelado', className: 'bg-red-500 text-white' },
        RESOLVED: { label: 'Revisado', className: 'bg-purple-500 text-white' },
        DELETED: { label: 'Eliminado', className: 'bg-slate-500 text-white' },
    }
    return config[status] || { label: status, className: 'bg-gray-500 text-white' }
}

interface StatusIconConfig {
    label: string
    dotColor: string // Color for the circular dot indicator
    textColor: string // Color for the status text
}

/**
 * Get the icon configuration for a service status (circular dot + text).
 * Used in timeline-style displays like the services list.
 */
export function getStatusIconConfig(status: ServiceStatus | string): StatusIconConfig {
    const config: Record<string, StatusIconConfig> = {
        ASSIGNED: { label: 'Asignado', dotColor: 'bg-blue-500', textColor: 'text-blue-500' },
        PENDING: { label: 'Pendiente', dotColor: 'bg-indigo-500', textColor: 'text-indigo-500' },
        DELIVERED: { label: 'Entregado', dotColor: 'bg-green-500', textColor: 'text-green-500' },
        RETURNED: { label: 'Devuelto', dotColor: 'bg-orange-500', textColor: 'text-orange-500' },
        CANCELED: { label: 'Cancelado', dotColor: 'bg-red-500', textColor: 'text-red-500' },
        RESOLVED: { label: 'Revisado', dotColor: 'bg-purple-500', textColor: 'text-purple-500' },
        DELETED: { label: 'Eliminado', dotColor: 'bg-slate-500', textColor: 'text-slate-500' },
    }
    return config[status] || { label: status, dotColor: 'bg-gray-500', textColor: 'text-gray-500' }
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
