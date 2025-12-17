/**
 * Tipos de Service Delivery (Entregas)
 * 
 * Define las interfaces para el módulo de gestión de entregas.
 * Corresponde a los DTOs del backend.
 */

/**
 * Estados posibles de una entrega
 */
export type ServiceStatus = 
    | 'PENDING'      // Pendiente de asignación
    | 'ASSIGNED'     // Asignada a mensajero
    | 'IN_PROGRESS'  // En camino
    | 'COMPLETED'    // Entregada
    | 'CANCELLED'    // Cancelada

/**
 * Entrega de servicio completa (respuesta del backend)
 */
export interface ServiceDelivery {
    /** ID único de la entrega */
    id: number
    /** Placa del vehículo (extraída por OCR) */
    licensePlate: string
    /** URL de la imagen de la placa */
    plateImageUrl?: string
    /** Estado actual de la entrega */
    status: ServiceStatus
    /** Observaciones adicionales */
    observations?: string
    /** ID del concesionario destino */
    dealershipId: number
    /** Nombre del concesionario (incluido por backend) */
    dealershipName?: string
    /** Dirección del concesionario */
    dealershipAddress?: string
    /** ID del mensajero asignado */
    messengerId?: number
    /** Nombre del mensajero */
    messengerName?: string
    /** Documento del mensajero */
    messengerDocument?: string
    /** Fecha/hora de creación */
    createdAt: string
    /** Fecha/hora de última actualización */
    updatedAt?: string
    /** Fecha/hora de entrega completada */
    completedAt?: string
}

/**
 * Request para crear una entrega (multipart/form-data)
 * El backend espera un FormData con estos campos
 */
export interface CreateServiceRequest {
    /** Imagen de la placa (archivo) */
    image: File
    /** ID del concesionario destino */
    dealershipId: number
    /** Documento del mensajero (requerido para ADMIN) */
    messengerDocument?: string
}

/**
 * Request para actualizar estado
 */
export interface UpdateServiceStatusRequest {
    status: ServiceStatus
}

/**
 * Request para agregar observaciones
 */
export interface UpdateObservationsRequest {
    observations: string
}

/**
 * Filtros para listar entregas
 */
export interface ServiceFilters {
    status?: ServiceStatus
    messengerId?: number
    dealershipId?: number
    dateFrom?: string
    dateTo?: string
}

/**
 * Colores y labels para estados
 */
export const SERVICE_STATUS_CONFIG: Record<ServiceStatus, { label: string; color: string; bgColor: string }> = {
    PENDING: { label: 'Pendiente', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
    ASSIGNED: { label: 'Asignada', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
    IN_PROGRESS: { label: 'En Progreso', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
    COMPLETED: { label: 'Completada', color: 'text-green-400', bgColor: 'bg-green-500/20' },
    CANCELLED: { label: 'Cancelada', color: 'text-red-400', bgColor: 'bg-red-500/20' },
}
