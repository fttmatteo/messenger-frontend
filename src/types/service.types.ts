/**
 * Estados permitidos para un servicio de entrega.
 */
export type ServiceStatus =
    | 'ASSIGNED'
    | 'PENDING'
    | 'DELIVERED'
    | 'RETURNED'
    | 'CANCELED'
    | 'RESOLVED'
    | 'DELETED'

/**
 * Categorías de vehículos admitidas.
 */
export type PlateType =
    | 'CAR'
    | 'MOTORCYCLE'
    | 'MOTORCAR'

/**
 * Información resumida de la placa identificada.
 */
export interface PlateInfo {
    idPlate: number
    plateNumber: string
    plateType: PlateType
}

export interface SignatureInfo {
    idSignature: number
    signaturePath: string
    gifPath?: string
}

export interface PhotoInfo {
    idPhoto: number
    photoPath: string
    photoType?: 'PLATE_DETECTION' | 'EVIDENCE'
}

/**
 * Información básica de un concesionario.
 */
export interface DealershipInfo {
    idDealership: number
    uuid: string
    name: string
    address: string
    phone: string
    zone: string
    latitude?: number
    longitude?: number
}

export interface EmployeeInfo {
    idEmployee: number
    uuid: string
    document: number
    fullName: string
    phone: string
    role: 'ADMIN' | 'MESSENGER'
}

/**
 * Registro de auditoría y evidencia para cada cambio de estado.
 */
export interface StatusHistoryInfo {
    idStatusHistory: number
    previousStatus: ServiceStatus | null
    newStatus: ServiceStatus
    changeDate: string
    changedBy: EmployeeInfo
    photos?: PhotoInfo[]
    deliveryLatitude?: number
    deliveryLongitude?: number
    signature?: SignatureInfo
    observation?: string
}

/**
 * Interface principal de Entrega de Servicio (Service Delivery).
 * Contiene toda la información de la placa, el concesionario, el historial y las evidencias.
 */
export interface ServiceDelivery {
    idServiceDelivery: number
    uuid: string
    plate: PlateInfo
    dealership: DealershipInfo
    // El backend puede omitir o devolver null para el mensajero cuando no está asignado
    messenger?: EmployeeInfo | null
    currentStatus: ServiceStatus
    observation?: string
    signature?: SignatureInfo
    photos: PhotoInfo[]
    history: StatusHistoryInfo[]
    createdAt: string
    /** Fecha en que el servicio fue movido a la papelera (borrado lógico). Solo presente para servicios eliminados. */
    deletedAt?: string
}

/**
 * Parámetros requeridos para la creación de un nuevo servicio con imagen de placa.
 */
export interface CreateServiceRequest {
    image: File
    dealershipId: string
    messengerDocument?: string
    manualPlateNumber?: string
    latitude?: number
    longitude?: number
}

/**
 * Datos y evidencias para actualizar el estado de un servicio.
 */
export interface UpdateServiceStatusRequest {
    status: ServiceStatus
    observation?: string
    signature?: File
    signatureGif?: File
    photos?: File[]
    latitude?: number
    longitude?: number
}

/**
 * Estadísticas operativas diarias para dashboards.
 */
export interface DailyStats {
    date: string
    assigned: number
    delivered: number
    returned: number
    canceled: number
    pending: number
    total: number
}

/**
 * Estructura de respuesta genérica para listados con paginación del lado del servidor.
 */
export interface PaginatedResponse<T> {
    content: T[]
    currentPage: number
    pageSize: number
    totalElements: number
    totalPages: number
    first: boolean
    last: boolean
}
