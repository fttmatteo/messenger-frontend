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
 */
export function getErrorMessage(error: unknown): string {
    if (isAxiosError(error)) {
        if (error.response?.data?.message) {
            return error.response.data.message
        }
        if (error.code === 'ERR_NETWORK' || !error.response) {
            return 'Error de conexión. Verifica tu red e intenta nuevamente.'
        }
        return error.message
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
 */
export function getApiError(error: unknown): ApiErrorResponse | null {
    if (isAxiosError(error) && error.response?.data) {
        return error.response.data
    }
    return null
}

/**
 * Obtiene el código de estado HTTP del error
 */
export function getHttpStatus(error: unknown): number | null {
    if (isAxiosError(error)) {
        return error.response?.status ?? null
    }
    return null
}

/**
 * Verifica si un error es un error de autenticación (401 o 403)
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
 */
export function isValidationError(error: unknown): boolean {
    if (isAxiosError(error)) {
        return error.response?.status === 400
    }
    return false
}

/**
 * Verifica si un error es un error de recurso no encontrado (404)
 */
export function isNotFoundError(error: unknown): boolean {
    if (isAxiosError(error)) {
        return error.response?.status === 404
    }
    return false
}

/**
 * Verifica si un error es un error del servidor (5xx)
 */
export function isServerError(error: unknown): boolean {
    if (isAxiosError(error)) {
        const status = error.response?.status
        return status !== undefined && status >= 500 && status < 600
    }
    return false
}

/**
 * Verifica si un error es un error de red (sin conexión)
 */
export function isNetworkError(error: unknown): boolean {
    if (isAxiosError(error)) {
        return error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || !error.response
    }
    return false
}
