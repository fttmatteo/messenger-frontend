const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

/**
 * Converts a relative or absolute URL to a full API URL.
 * Handles various URL formats returned by the backend.
 */
export function getImageUrl(url: string): string {
    if (!url) return ''
    if (url.startsWith('http')) return url
    // Remove /api if present in url to avoid duplication if backend returns it
    const cleanUrl = url.replace(/^\/api\//, '/')
    return `${API_URL}${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}`
}
