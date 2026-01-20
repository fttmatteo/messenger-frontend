import type { ServiceStatus } from "@/types/service.types"
import { Car, Bike, Truck } from "lucide-react"
import { getStatusHexColor, getStatusLabel, getMergedColors, getStatusPillBackground } from "@/lib/status-colors"

/** Configuración visual para una insignia de estado. */
interface StatusBadgeConfig {
    /** Etiqueta descriptiva del estado. */
    label: string
    /** Clases de Tailwind adicionales. */
    className: string
    /** Estilos CSS en línea (colores dinámicos). */
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

/** Configuración visual para la representación de estado con icono. */
interface StatusIconConfig {
    /** Etiqueta descriptiva. */
    label: string
    /** @deprecated Usar dotStyle para el color del punto. */
    dotColor: string
    /** @deprecated Usar textStyle para el color del texto. */
    textColor: string
    /** Estilo del punto indicador. */
    dotStyle: React.CSSProperties
    /** Estilo del texto de la etiqueta. */
    textStyle: React.CSSProperties
    /** Estilo de fondo para el contenedor tipo pastilla. */
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
 * Obtiene la etiqueta de visualización para un tipo de placa.
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
 * Obtiene el componente de icono para un tipo de placa.
 */
export function getPlateTypeIcon(plateType: string): typeof Car | typeof Bike | typeof Truck {
    const icons: Record<string, typeof Car | typeof Bike | typeof Truck> = {
        CAR: Car,
        MOTORCYCLE: Bike,
        MOTORCAR: Truck,
    }
    return icons[plateType] || Car
}



type UserRole = 'ADMIN' | 'MESSENGER'

/** Representación de una opción de estado disponible. */
interface AvailableStatus {
    /** Valor técnico del estado. */
    value: ServiceStatus
    /** Etiqueta amigable para el usuario. */
    label: string
}

/**
 * Obtiene los estados disponibles para un usuario basado en su rol.
 * 
 * Reglas de Negocio:
 * - MESSENGER solo puede usar: PENDING, DELIVERED, RETURNED
 * - ADMIN solo puede usar: CANCELED, RESOLVED
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
