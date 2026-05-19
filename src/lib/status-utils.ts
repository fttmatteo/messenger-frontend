import type { ServiceStatus } from "@/types/service.types"
import { Bike } from "lucide-react"
import { getStatusHexColor, getStatusLabel, getMergedColors, getStatusPillBackground } from "@/lib/status-colors"

interface StatusBadgeConfig {
    label: string
    className: string
    style?: React.CSSProperties
}

/**
 * Obtiene la configuración de insignia para un estado de servicio.
 * Usa colores dinámicos del sistema centralizado de colores.
 */
export function getStatusBadge(status: ServiceStatus | string, customColors?: Record<string, string>): StatusBadgeConfig {
    const colors = customColors || getMergedColors()
    return {
        label: getStatusLabel(status),
        className: 'text-white',
        style: { backgroundColor: colors[status] || getStatusHexColor(status, colors), color: 'white' }
    }
}

interface StatusIconConfig {
    label: string
    dotColor: string
    textColor: string
    dotStyle: React.CSSProperties
    textStyle: React.CSSProperties
    pillBackground: string
}

/**
 * Obtiene la configuración de icono para un estado de servicio (punto circular + texto).
 * Usa colores dinámicos del sistema centralizado de colores.
 */
export function getStatusIconConfig(status: ServiceStatus | string, customColors?: Record<string, string>): StatusIconConfig {
    const hexColor = getStatusHexColor(status, customColors)
    return {
        label: getStatusLabel(status),
        dotColor: '',
        textColor: '',
        dotStyle: { backgroundColor: hexColor },
        textStyle: { color: hexColor },
        pillBackground: getStatusPillBackground(status, customColors, 0.15)
    }
}

/**
 * Obtiene la etiqueta de visualización para el tipo de vehículo.
 */
export function getPlateTypeLabel(): string {
    return 'Moto'
}

/**
 * Obtiene el componente de icono para el tipo de vehículo.
 */
export function getPlateTypeIcon(): typeof Bike {
    return Bike
}



type UserRole = 'ADMIN' | 'MESSENGER'

interface AvailableStatus {
    value: ServiceStatus
    label: string
}

/**
 * Obtiene los estados disponibles para un usuario basado en su rol.
 * 
 * Reglas de Negocio:
 * - MESSENGER solo puede usar: PENDING, DELIVERED, RETURNED
 * - ADMIN puede usar todos los estados: ASSIGNED, PENDING, DELIVERED, RETURNED, CANCELED, RESOLVED
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
        { value: 'ASSIGNED', label: 'Asignado' },
        { value: 'PENDING', label: 'Pendiente' },
        { value: 'DELIVERED', label: 'Entregado' },
        { value: 'RETURNED', label: 'Devuelto' },
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
 * Verifica si un servicio está bloqueado para un rol de usuario específico.
 * Retorna un mensaje explicando por qué está bloqueado, o null si no lo está.
 */
export function getServiceLockReason(): string | null {
    return null
}

/**
 * Verifica si el usuario actual puede editar el servicio (actualizar estado).
 */
export function canUserEditService(
    role: UserRole
): boolean {
    const availableStatuses = getAvailableStatusesForUser(role)
    return availableStatuses.length > 0
}
