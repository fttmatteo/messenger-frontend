// Service Status - using type instead of enum for TS compatibility
export type ServiceStatus =
    | 'ASSIGNED'
    | 'PENDING'
    | 'DELIVERED'
    | 'RETURNED'
    | 'CANCELED'
    | 'RESOLVED'
    | 'DELETED'

// Plate Type
export type PlateType =
    | 'CAR'
    | 'MOTORCYCLE'
    | 'MOTORCAR'

// Nested interfaces
export interface PlateInfo {
    idPlate: number
    plateNumber: string
    plateType: PlateType
}

export interface SignatureInfo {
    idSignature: number
    signaturePath: string
}

export interface PhotoInfo {
    idPhoto: number
    photoPath: string
    photoType?: 'PLATE_DETECTION' | 'EVIDENCE'
}

export interface DealershipInfo {
    idDealership: number
    name: string
    address: string
    phone: string
    zone: string
    latitude?: number
    longitude?: number
}

export interface EmployeeInfo {
    idEmployee: number
    document: number
    fullName: string
    phone: string
    role: 'ADMIN' | 'MESSENGER'
}

export interface StatusHistoryInfo {
    idStatusHistory: number
    previousStatus: ServiceStatus | null
    newStatus: ServiceStatus
    changeDate: string
    changedBy: EmployeeInfo
    photos: PhotoInfo[]
    deliveryLatitude?: number
    deliveryLongitude?: number
    signature?: SignatureInfo
    observation?: string
}

// Main Service Delivery interface
export interface ServiceDelivery {
    idServiceDelivery: number
    plate: PlateInfo
    dealership: DealershipInfo
    messenger: EmployeeInfo
    currentStatus: ServiceStatus
    observation?: string
    signature?: SignatureInfo
    photos: PhotoInfo[]
    history: StatusHistoryInfo[]
    createdAt: string
}

// Request types
export interface CreateServiceRequest {
    image: File
    dealershipId: string
    messengerDocument?: string
    manualPlateNumber?: string
    latitude?: number
    longitude?: number
}

export interface UpdateServiceStatusRequest {
    status: ServiceStatus
    observation?: string
    signature?: File
    photos?: File[]
    latitude?: number
    longitude?: number
}

export interface DailyStats {
    date: string
    assigned: number
    delivered: number
    returned: number
    canceled: number
    pending: number
    total: number
}

// Paginated Response (matches backend PageResponse)
export interface PaginatedResponse<T> {
    content: T[]
    currentPage: number
    pageSize: number
    totalElements: number
    totalPages: number
    first: boolean
    last: boolean
}
