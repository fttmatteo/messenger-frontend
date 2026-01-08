import { z } from 'zod';

// ---------- Auth Schemas ----------
export const LoginUserSchema = z
  .object({
    id: z.number().int().optional(),
    name: z.string().optional(),
    document: z.number().int().optional(),
    dealershipName: z.string().optional(),
    role: z.string().optional(),
  })
  .catchall(z.any());

export const LoginResponseSchema = z
  .object({
    role: z.string(),
    message: z.string().optional(),
    user: LoginUserSchema.optional(),
  })
  .catchall(z.any());

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// ---------- Service Delivery Schemas ----------
export const ServiceStatusSchema = z.string();

export const PlateTypeSchema = z.string();

export const PlateInfoSchema = z
  .object({
    idPlate: z.number().int().optional(),
    plateNumber: z.string().optional(),
    plateType: PlateTypeSchema.optional(),
  })
  .catchall(z.any());

export const SignatureInfoSchema = z
  .object({
    idSignature: z.number().int().optional(),
    signaturePath: z.string().optional(),
  })
  .catchall(z.any());

export const PhotoInfoSchema = z
  .object({
    idPhoto: z.number().int().optional(),
    photoPath: z.string().optional(),
    photoType: z.string().optional(),
  })
  .catchall(z.any());

export const DealershipInfoSchema = z
  .object({
    idDealership: z.number().int().optional(),
    name: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    zone: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  })
  .catchall(z.any());

export const EmployeeInfoSchema = z
  .object({
    idEmployee: z.number().int().optional(),
    document: z.number().int().optional(),
    fullName: z.string().optional(),
    phone: z.string().optional(),
    role: z.string().optional(),
  })
  .catchall(z.any());

export const StatusHistoryInfoSchema = z
  .object({
    idStatusHistory: z.number().int().optional(),
    previousStatus: ServiceStatusSchema.nullable().optional(),
    newStatus: ServiceStatusSchema.optional(),
    changeDate: z.string().optional(),
    changedBy: EmployeeInfoSchema.optional(),
    photos: z.array(PhotoInfoSchema).optional(),
    deliveryLatitude: z.number().optional(),
    deliveryLongitude: z.number().optional(),
    signature: SignatureInfoSchema.optional(),
    observation: z.string().optional(),
  })
  .catchall(z.any());

export const ServiceDeliverySchema = z
  .object({
    idServiceDelivery: z.number().int().optional(),
    plate: PlateInfoSchema.optional(),
    dealership: DealershipInfoSchema.optional(),
    messenger: EmployeeInfoSchema.optional(),
    currentStatus: ServiceStatusSchema.optional(),
    observation: z.string().optional(),
    signature: SignatureInfoSchema.optional(),
    photos: z.array(PhotoInfoSchema).optional(),
    history: z.array(StatusHistoryInfoSchema).optional(),
    createdAt: z.string().optional(),
  })
  .catchall(z.any());

export type ServiceDelivery = z.infer<typeof ServiceDeliverySchema>;

// ---------- Pagination ----------
export const PaginatedSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z
    .object({
      content: z.array(schema).optional(),
      currentPage: z.number().int().optional(),
      pageSize: z.number().int().optional(),
      totalElements: z.number().int().optional(),
      totalPages: z.number().int().optional(),
      first: z.boolean().optional(),
      last: z.boolean().optional(),
    })
    .catchall(z.any());

// ---------- Error Schema ----------
export const ErrorResponseSchema = z
  .object({
    status: z.number().optional(),
    message: z.string().optional(),
    details: z.record(z.string(), z.unknown()).optional(),
    timestamp: z.string().optional(),
    path: z.string().optional(),
  })
  .catchall(z.any());
