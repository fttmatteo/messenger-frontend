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
        ASSIGNED: { label: 'Asignado', className: 'bg-slate-600 text-white' },
        PENDING: { label: 'Pendiente', className: 'bg-indigo-500 text-white' },
        DELIVERED: { label: 'Entregado', className: 'bg-green-500 text-white' },
        RETURNED: { label: 'Devuelto', className: 'bg-orange-500 text-white' },
        CANCELED: { label: 'Cancelado', className: 'bg-gray-500 text-white' },
        RESOLVED: { label: 'Resuelto', className: 'bg-emerald-500 text-white' },
    }
    return config[status] || { label: status, className: 'bg-gray-500 text-white' }
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
