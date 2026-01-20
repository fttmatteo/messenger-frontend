import { AxiosError } from 'axios'

/**
 * Estructura estándar que devuelve el servidor ante una petición fallida.
 */
export interface ApiErrorResponse {
    message: string
    status?: number
    timestamp?: string
    path?: string
}

/**
 * Tipo compuesto que engloba tanto errores locales como errores de red interceptados por Axios.
 */
export type AppError = Error | AxiosError<ApiErrorResponse>

/**
 * Detalles específicos de una falla de validación en un campo determinado.
 */
export interface ValidationError {
    field: string
    message: string
}

/**
 * Estructura para errores que contienen múltiples fallas de validación (ej. formularios).
 */
export interface ApiValidationErrorResponse extends ApiErrorResponse {
    errors?: ValidationError[]
}
