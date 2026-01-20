const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

/**
 * Convierte una URL relativa o absoluta a una URL completa de la API.
 * Maneja varios formatos de URL retornados por el backend.
 */
export function getImageUrl(url: string): string {
    if (!url) return ''
    if (url.startsWith('http')) return url
    const cleanUrl = url.replace(/^\/api\//, '/')
    return `${API_URL}${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}`
}
