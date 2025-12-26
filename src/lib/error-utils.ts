import axios, { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/types/error.types'

/**
 * Type guard para verificar si un error es de tipo AxiosError
 */
export function isAxiosError(error: unknown): error is AxiosError<ApiErrorResponse> {
    return axios.isAxiosError(error)
}

/**
 * Extrae el mensaje de error de cualquier tipo de error
 * @param error - Error de cualquier tipo
 * @returns Mensaje de error formateado
 */
export function getErrorMessage(error: unknown): string {
    if (isAxiosError(error)) {
        return error.response?.data?.message || error.message
    }

    if (error instanceof Error) {
        return error.message
    }

    if (typeof error === 'string') {
        return error
    }

    return 'Error desconocido'
}

/**
 * Obtiene la respuesta de error completa de la API si está disponible
 * @param error - Error de cualquier tipo
 * @returns Respuesta de error de la API o null
 */
export function getApiError(error: unknown): ApiErrorResponse | null {
    if (isAxiosError(error) && error.response?.data) {
        return error.response.data
    }
    return null
}

/**
 * Verifica si un error es un error de autenticación (401 o 403)
 * @param error - Error de cualquier tipo
 * @returns true si es error de autenticación
 */
export function isAuthError(error: unknown): boolean {
    if (isAxiosError(error)) {
        const status = error.response?.status
        return status === 401 || status === 403
    }
    return false
}

/**
 * Verifica si un error es un error de validación (400)
 * @param error - Error de cualquier tipo
 * @returns true si es error de validación
 */
export function isValidationError(error: unknown): boolean {
    if (isAxiosError(error)) {
        return error.response?.status === 400
    }
    return false
}
