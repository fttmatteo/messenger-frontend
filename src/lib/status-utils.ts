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
        RESOLVED: { label: 'Resuelto', className: 'bg-purple-500 text-white' },
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
        RESOLVED: { label: 'Resuelto', dotColor: 'bg-purple-500', textColor: 'text-purple-500' },
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
 * Get available statuses for a user based on their role and the current service status.
 * 
 * Business Rules:
 * - MESSENGER can only use: PENDING, DELIVERED, RETURNED (from ASSIGNED or RETURNED states)
 * - ADMIN can only use: CANCELED, RESOLVED
 * - When service is in PENDING, messenger is LOCKED until admin intervenes
 * - When service is in DELIVERED/RESOLVED, no more transitions allowed (except within 72h window for admin)
 */
export function getAvailableStatusesForUser(
    role: UserRole,
    currentStatus: ServiceStatus,
    createdAt?: string
): AvailableStatus[] {
    const MESSENGER_STATUSES: AvailableStatus[] = [
        { value: 'PENDING', label: 'Pendiente' },
        { value: 'DELIVERED', label: 'Entregado' },
        { value: 'RETURNED', label: 'Devuelto' },
    ]

    const ADMIN_STATUSES: AvailableStatus[] = [
        { value: 'CANCELED', label: 'Cancelado' },
        { value: 'RESOLVED', label: 'Resuelto' },
    ]

    // Check if service is within 72h window (for DELIVERED/RESOLVED)
    const within72h = createdAt ? isWithin72hWindow(currentStatus, createdAt) : true

    if (role === 'MESSENGER') {
        // Messenger can only act on ASSIGNED or RETURNED states
        if (currentStatus === 'ASSIGNED' || currentStatus === 'RETURNED') {
            return MESSENGER_STATUSES
        }
        // Messenger is locked for PENDING, DELIVERED, CANCELED, RESOLVED
        return []
    }

    if (role === 'ADMIN') {
        // Admin can use CANCELED/RESOLVED on most states
        if (currentStatus === 'ASSIGNED' || currentStatus === 'PENDING' || currentStatus === 'RETURNED') {
            return ADMIN_STATUSES
        }
        // For DELIVERED, admin can still change within 72h
        if (currentStatus === 'DELIVERED' && within72h) {
            return ADMIN_STATUSES
        }
        // CANCELED: admin can reassign (status stays CANCELED, but can change messenger)
        // RESOLVED: final state (within 72h from DELIVERED)
        return []
    }

    return []
}

/**
 * Check if the service is in its 72-hour edit window.
 * Only applies to DELIVERED and RESOLVED statuses.
 */
export function isWithin72hWindow(currentStatus: ServiceStatus, deliveredAt: string): boolean {
    if (currentStatus !== 'DELIVERED' && currentStatus !== 'RESOLVED') {
        return true // No window restriction for other statuses
    }

    const deliveredDate = new Date(deliveredAt)
    const now = new Date()
    const hoursDiff = (now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60)

    return hoursDiff <= 72
}

/**
 * Get remaining time in the 72-hour window.
 * Returns { hours, minutes } or null if window has expired.
 */
export function getTimeRemainingIn72hWindow(deliveredAt: string): { hours: number; minutes: number } | null {
    const deliveredDate = new Date(deliveredAt)
    const windowEnd = new Date(deliveredDate.getTime() + (72 * 60 * 60 * 1000))
    const now = new Date()

    const remainingMs = windowEnd.getTime() - now.getTime()

    if (remainingMs <= 0) {
        return null
    }

    const hours = Math.floor(remainingMs / (1000 * 60 * 60))
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))

    return { hours, minutes }
}

/**
 * Check if a service is locked for a specific user role.
 * Returns a message explaining why it's locked, or null if not locked.
 */
export function getServiceLockReason(
    role: UserRole,
    currentStatus: ServiceStatus,
    createdAt?: string
): string | null {
    if (role === 'MESSENGER') {
        if (currentStatus === 'PENDING') {
            return 'Este servicio está en revisión. El administrador debe intervenir antes de continuar.'
        }
        if (currentStatus === 'DELIVERED') {
            return 'Este servicio ya fue entregado.'
        }
        if (currentStatus === 'CANCELED') {
            return 'Este servicio fue cancelado.'
        }
        if (currentStatus === 'RESOLVED') {
            return 'Este servicio fue resuelto.'
        }
    }

    if (role === 'ADMIN') {
        if (currentStatus === 'DELIVERED' || currentStatus === 'RESOLVED') {
            const within72h = createdAt ? isWithin72hWindow(currentStatus, createdAt) : false
            if (!within72h) {
                return 'La ventana de 72 horas para modificar este servicio ha expirado.'
            }
        }
    }

    return null
}

/**
 * Check if the current user can edit the service (update status).
 */
export function canUserEditService(
    role: UserRole,
    currentStatus: ServiceStatus,
    createdAt?: string
): boolean {
    const availableStatuses = getAvailableStatusesForUser(role, currentStatus, createdAt)
    return availableStatuses.length > 0
}
