import { AxiosError } from 'axios'

/**
 * Estructura estándar de respuesta de error de la API
 */
export interface ApiErrorResponse {
    message: string
    status?: number
    timestamp?: string
    path?: string
}

/**
 * Tipo unión para todos los errores de la aplicación
 */
export type AppError = Error | AxiosError<ApiErrorResponse>

/**
 * Error de validación individual
 */
export interface ValidationError {
    field: string
    message: string
}

/**
 * Respuesta de error con múltiples validaciones
 */
export interface ApiValidationErrorResponse extends ApiErrorResponse {
    errors?: ValidationError[]
}
