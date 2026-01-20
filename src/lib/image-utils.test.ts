import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getImageUrl } from './image-utils'

/**
 * Suite de pruebas para las utilidades de procesamiento de rutas de imágenes.
 * Verifica la normalización de URLs relativas y absolutas, prependiendo la URL de la API
 * cuando es necesario y evitando duplicidades.
 */
describe('image-utils', () => {
    beforeEach(() => {
        // Limpiar mocks
        vi.clearAllMocks()
    })

    afterEach(() => {
        // Restaurar env original
        vi.unstubAllEnvs()
    })

    describe('getImageUrl', () => {
        it('should return empty string for empty input', () => {
            expect(getImageUrl('')).toBe('')
        })

        it('should return empty string for falsy input', () => {
            // @ts-expect-error Probando caso borde con null
            expect(getImageUrl(null)).toBe('')
            // @ts-expect-error Probando caso borde con undefined
            expect(getImageUrl(undefined)).toBe('')
        })

        it('should return full URLs unchanged', () => {
            const httpUrl = 'http://example.com/image.jpg'
            const httpsUrl = 'https://example.com/image.jpg'

            expect(getImageUrl(httpUrl)).toBe(httpUrl)
            expect(getImageUrl(httpsUrl)).toBe(httpsUrl)
        })

        it('should prepend API URL to relative paths starting with /', () => {
            const relativePath = '/uploads/images/photo.jpg'
            const result = getImageUrl(relativePath)

            expect(result).toContain('/uploads/images/photo.jpg')
            expect(result).toMatch(/^https?:\/\//)
        })

        it('should prepend API URL to relative paths without leading /', () => {
            const relativePath = 'uploads/images/photo.jpg'
            const result = getImageUrl(relativePath)

            expect(result).toContain('uploads/images/photo.jpg')
            expect(result).toMatch(/^https?:\/\//)
        })

        it('should remove /api prefix if present to avoid duplication', () => {
            const pathWithApi = '/api/uploads/images/photo.jpg'
            const result = getImageUrl(pathWithApi)

            // No debería tener doble /api/api
            expect(result).not.toContain('/api/api')
            expect(result).toContain('/uploads/images/photo.jpg')
        })

        it('should handle paths that start with /api/', () => {
            const pathWithApi = '/api/photos/123.jpg'
            const result = getImageUrl(pathWithApi)

            // El prefijo /api/ debería ser removido
            expect(result).toContain('/photos/123.jpg')
        })

        it('should not modify paths that contain api but dont start with /api/', () => {
            const path = '/uploads/api-docs/image.jpg'
            const result = getImageUrl(path)

            expect(result).toContain('/uploads/api-docs/image.jpg')
        })
    })
})
