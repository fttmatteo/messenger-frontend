import { z } from 'zod'

// ---------- Auth Schemas ----------
export const LoginResponseSchema = z.object({
    role: z.string(),
    message: z.string(),
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

// ---------- Enums ----------
export const ServiceStatusSchema = z.enum([
    'ASSIGNED',
    'PENDING',
    'DELIVERED',
    'RETURNED',
    'CANCELED',
    'RESOLVED',
    'DELETED'
])

export const PlateTypeSchema = z.enum(['CAR', 'MOTORCYCLE', 'MOTORCAR'])

// ---------- Nested entities ----------
export const PlateInfoSchema = z.object({
    idPlate: z.number(),
    plateNumber: z.string(),
    plateType: PlateTypeSchema
})

export const SignatureInfoSchema = z.object({
    idSignature: z.number(),
    signaturePath: z.string()
})

export const PhotoInfoSchema = z.object({
    idPhoto: z.number(),
    photoPath: z.string(),
    photoType: z.enum(['PLATE_DETECTION', 'EVIDENCE']).optional()
})

export const DealershipInfoSchema = z.object({
    idDealership: z.number(),
    name: z.string(),
    address: z.string(),
    phone: z.string(),
    zone: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional()
})

export const EmployeeInfoSchema = z.object({
    idEmployee: z.number(),
    document: z.number(),
    fullName: z.string(),
    phone: z.string(),
    role: z.enum(['ADMIN', 'MESSENGER'])
})

export const StatusHistoryInfoSchema = z.object({
    idStatusHistory: z.number(),
    previousStatus: ServiceStatusSchema.nullable(),
    newStatus: ServiceStatusSchema,
    changeDate: z.string(),
    changedBy: EmployeeInfoSchema,
    photos: z.array(PhotoInfoSchema).optional(),
    deliveryLatitude: z.number().optional(),
    deliveryLongitude: z.number().optional(),
    signature: SignatureInfoSchema.optional(),
    observation: z.string().optional()
})

export const ServiceDeliverySchema = z.object({
    idServiceDelivery: z.number(),
    plate: PlateInfoSchema,
    dealership: DealershipInfoSchema,
    messenger: EmployeeInfoSchema.nullable().optional(),
    currentStatus: ServiceStatusSchema,
    observation: z.string().optional(),
    signature: SignatureInfoSchema.optional(),
    photos: z.array(PhotoInfoSchema).default([]),
    history: z.array(StatusHistoryInfoSchema).default([]),
    createdAt: z.string()
})

// ---------- Pagination ----------
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

// ---------- Error Schema ----------
export const ErrorResponseSchema = z.object({
    status: z.number().optional(),
    message: z.string().optional(),
    details: z.record(z.string(), z.unknown()).optional(),
    timestamp: z.string().optional(),
    path: z.string().optional()
})

// ---------- Collections ----------
export const ServiceListResponseSchema = z.array(ServiceDeliverySchema)
