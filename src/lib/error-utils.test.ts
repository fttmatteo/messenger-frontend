import { describe, it, expect, vi } from 'vitest'
import axios, { AxiosError } from 'axios'
import {
    isAxiosError,
    getErrorMessage,
    getApiError,
    isAuthError,
    isValidationError
} from './error-utils'
import type { ApiErrorResponse } from '@/types/error.types'

// Helper to create mock Axios errors
function createAxiosError(
    status: number,
    data?: ApiErrorResponse,
    message = 'Request failed'
): AxiosError<ApiErrorResponse> {
    const error = new Error(message) as AxiosError<ApiErrorResponse>
    error.isAxiosError = true
    error.response = {
        status,
        statusText: 'Error',
        data: data || { message: 'Server error' },
        headers: {},
        config: {} as AxiosError['config']
    } as AxiosError<ApiErrorResponse>['response']
    error.config = {} as AxiosError['config']
    error.toJSON = () => ({})
    return error
}

describe('error-utils', () => {
    describe('isAxiosError', () => {
        it('should return true for Axios errors', () => {
            const axiosError = createAxiosError(500)
            // Mock axios.isAxiosError
            vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)
            expect(isAxiosError(axiosError)).toBe(true)
        })

        it('should return false for regular Error instances', () => {
            const error = new Error('Regular error')
            vi.spyOn(axios, 'isAxiosError').mockReturnValue(false)
            expect(isAxiosError(error)).toBe(false)
        })

        it('should return false for strings', () => {
            vi.spyOn(axios, 'isAxiosError').mockReturnValue(false)
            expect(isAxiosError('string error')).toBe(false)
        })

        it('should return false for null/undefined', () => {
            vi.spyOn(axios, 'isAxiosError').mockReturnValue(false)
            expect(isAxiosError(null)).toBe(false)
            expect(isAxiosError(undefined)).toBe(false)
        })
    })

    describe('getErrorMessage', () => {
        it('should extract message from Axios error with API response', () => {
            const axiosError = createAxiosError(400, { message: 'Validation failed' })
            vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)
            expect(getErrorMessage(axiosError)).toBe('Validation failed')
        })

        it('should use error.message when API response has no message', () => {
            const axiosError = createAxiosError(500, {} as ApiErrorResponse)
            axiosError.message = 'Network error'
            vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)
            expect(getErrorMessage(axiosError)).toBe('Network error')
        })

        it('should extract message from regular Error instances', () => {
            const error = new Error('Something went wrong')
            vi.spyOn(axios, 'isAxiosError').mockReturnValue(false)
            expect(getErrorMessage(error)).toBe('Something went wrong')
        })

        it('should return string errors as-is', () => {
            vi.spyOn(axios, 'isAxiosError').mockReturnValue(false)
            expect(getErrorMessage('Direct error message')).toBe('Direct error message')
        })

        it('should return default message for unknown error types', () => {
            vi.spyOn(axios, 'isAxiosError').mockReturnValue(false)
            expect(getErrorMessage({})).toBe('Error desconocido')
            expect(getErrorMessage(123)).toBe('Error desconocido')
            expect(getErrorMessage(null)).toBe('Error desconocido')
        })
    })

    describe('getApiError', () => {
        it('should return API error response for Axios errors', () => {
            const apiResponse: ApiErrorResponse = {
                message: 'Not found',
                status: 404,
                timestamp: '2024-01-01T00:00:00Z'
            }
            const axiosError = createAxiosError(404, apiResponse)
            vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)

            const result = getApiError(axiosError)
            expect(result).toEqual(apiResponse)
        })

        it('should return null for non-Axios errors', () => {
            vi.spyOn(axios, 'isAxiosError').mockReturnValue(false)
            expect(getApiError(new Error('Regular error'))).toBeNull()
        })

        it('should return null for Axios errors without response data', () => {
            const axiosError = createAxiosError(500)
            axiosError.response = undefined
            vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)

            expect(getApiError(axiosError)).toBeNull()
        })
    })

    describe('isAuthError', () => {
        it('should return true for 401 status', () => {
            const axiosError = createAxiosError(401)
            vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)
            expect(isAuthError(axiosError)).toBe(true)
        })

        it('should return true for 403 status', () => {
            const axiosError = createAxiosError(403)
            vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)
            expect(isAuthError(axiosError)).toBe(true)
        })

        it('should return false for other status codes', () => {
            const axiosError = createAxiosError(500)
            vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)
            expect(isAuthError(axiosError)).toBe(false)
        })

        it('should return false for non-Axios errors', () => {
            vi.spyOn(axios, 'isAxiosError').mockReturnValue(false)
            expect(isAuthError(new Error('Regular error'))).toBe(false)
        })
    })

    describe('isValidationError', () => {
        it('should return true for 400 status', () => {
            const axiosError = createAxiosError(400)
            vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)
            expect(isValidationError(axiosError)).toBe(true)
        })

        it('should return false for other status codes', () => {
            const axiosError = createAxiosError(500)
            vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)
            expect(isValidationError(axiosError)).toBe(false)
        })

        it('should return false for non-Axios errors', () => {
            vi.spyOn(axios, 'isAxiosError').mockReturnValue(false)
            expect(isValidationError(new Error('Regular error'))).toBe(false)
        })
    })
})
