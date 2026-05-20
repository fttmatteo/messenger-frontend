/**
 * Esquemas de validación Zod para las respuestas y peticiones de la API.
 * Aseguran la integridad de los datos en tiempo de ejecución.
 */
import { z } from 'zod'

/**
 * Esquema de validación para la respuesta de inicio de sesión.
 */
export const LoginResponseSchema = z.object({
    role: z.string(),
    message: z.string(),
    accessToken: z.string().optional(),
    refreshToken: z.string().optional(),
    user: z
        .object({
            id: z.number().optional(),
            name: z.string().optional(),
            document: z.number().optional(),
            dealershipName: z.string().optional(),
            role: z.string().optional()
        })
        .nullable()
        .optional()
})

/**
 * Enumeración de todos los estados posibles de un servicio de entrega.
 */
export const ServiceStatusSchema = z.enum([
    'ASSIGNED',
    'PENDING',
    'DELIVERED',
    'RETURNED',
    'CANCELED',
    'RESOLVED',
    'DELETED'
])

/**
 * Tipos de vehículos soportados por el sistema.
 */
export const PlateTypeSchema = z.enum(['CAR', 'MOTORCYCLE', 'MOTORCAR'])

/**
 * Información básica de la placa de un vehículo.
 */
export const PlateInfoSchema = z.object({
    idPlate: z.number(),
    plateNumber: z.string(),
    plateType: PlateTypeSchema
})

/**
 * Datos relacionados con la firma capturada como evidencia (imagen y GIF).
 */
export const SignatureInfoSchema = z.object({
    idSignature: z.number(),
    signaturePath: z.string()
})

/**
 * Información de una fotografía capturada.
 */
export const PhotoInfoSchema = z.object({
    idPhoto: z.number(),
    photoPath: z.string(),
    photoType: z.enum(['PLATE_DETECTION', 'EVIDENCE']).optional()
})

/**
 * Información detallada de un concesionario (destino).
 */
export const DealershipInfoSchema = z.object({
    idDealership: z.number(),
    uuid: z.string(),
    name: z.string(),
    address: z.string(),
    phone: z.string(),
    zone: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional()
})

/**
 * Información de perfil de un empleado (Administrador o Mensajero).
 */
export const EmployeeInfoSchema = z.object({
    idEmployee: z.number(),
    uuid: z.string(),
    document: z.number(),
    fullName: z.string(),
    phone: z.string(),
    role: z.enum(['ADMIN', 'MESSENGER'])
})

/**
 * Registro de un cambio de estado en la historia del servicio.
 */
export const StatusHistoryInfoSchema = z.object({
    idStatusHistory: z.number(),
    previousStatus: z.union([ServiceStatusSchema, z.null()]).catch(null),
    newStatus: ServiceStatusSchema,
    changeDate: z.string(),
    changedBy: EmployeeInfoSchema,
    photos: z.array(PhotoInfoSchema).optional(),
    deliveryLatitude: z.number().optional(),
    deliveryLongitude: z.number().optional(),
    signature: SignatureInfoSchema.optional(),
    observation: z.string().optional()
})

/**
 * Representación completa de un servicio de entrega de placa.
 */
export const ServiceDeliverySchema = z.object({
    idServiceDelivery: z.number(),
    uuid: z.string(),
    plate: PlateInfoSchema,
    dealership: DealershipInfoSchema,
    originDealership: DealershipInfoSchema,
    messenger: EmployeeInfoSchema.nullable().optional(),
    currentStatus: ServiceStatusSchema,
    observation: z.string().optional(),
    signature: SignatureInfoSchema.optional(),
    photos: z.array(PhotoInfoSchema).default([]),
    history: z.array(StatusHistoryInfoSchema).default([]),
    createdAt: z.string(),
    deletedAt: z.string().optional()
})

/**
 * Esquema genérico para envolver respuestas con paginación.
 * @param schema - El esquema de Zod para los elementos del contenido.
 */
export const PaginatedSchema = <T extends z.ZodTypeAny>(schema: T) =>
    z.object({
        content: z.array(schema),
        currentPage: z.number(),
        pageSize: z.number(),
        totalElements: z.number(),
        totalPages: z.number(),
        first: z.boolean(),
        last: z.boolean()
    })

/**
 * Esquema para capturar errores estandarizados de la API.
 */
export const ErrorResponseSchema = z.object({
    status: z.number().optional(),
    message: z.string().optional(),
    details: z.record(z.string(), z.unknown()).optional(),
    timestamp: z.string().optional(),
    path: z.string().optional()
})

export const ServiceListResponseSchema = z.array(ServiceDeliverySchema)
