/**
 * Cliente HTTP Axios con Interceptores JWT
 * 
 * Este módulo configura una instancia de Axios preconfigurada para
 * comunicarse con la API del backend de Messenger. Incluye:
 * 
 * - Interceptor de request: Agrega automáticamente el token JWT
 * - Interceptor de response: Maneja errores 401 y refresca tokens
 * - Queue de peticiones: Encola peticiones mientras se refresca el token
 * - Gestión de tokens: Utilidades para guardar/obtener/limpiar tokens
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { env } from './env'

/**
 * Instancia de Axios preconfigurada para la API de Messenger.
 * 
 * Configuración:
 * - baseURL: URL de la API desde variables de entorno
 * - timeout: 30 segundos máximo por petición
 * - headers: Content-Type JSON por defecto
 */
const axiosClient = axios.create({
    baseURL: env.API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
})

/**
 * Claves de almacenamiento para los tokens de autenticación.
 * Se usan para guardar/recuperar tokens del localStorage.
 */
const TOKEN_KEY = 'messenger_access_token'
const REFRESH_TOKEN_KEY = 'messenger_refresh_token'

/**
 * Utilidades para gestión de tokens JWT.
 * 
 * Proporciona métodos para:
 * - Obtener el token de acceso actual
 * - Obtener el refresh token
 * - Guardar ambos tokens
 * - Limpiar tokens (logout)
 */
export const tokenManager = {
    /**
     * Obtiene el token de acceso del localStorage.
     * @returns Token JWT o null si no existe.
     */
    getToken: (): string | null => localStorage.getItem(TOKEN_KEY),

    /**
     * Obtiene el refresh token del localStorage.
     * @returns Refresh token o null si no existe.
     */
    getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),

    /**
     * Guarda ambos tokens en localStorage.
     * @param accessToken - Token JWT de acceso.
     * @param refreshToken - Token para refrescar la sesión.
     */
    setTokens: (accessToken: string, refreshToken: string): void => {
        localStorage.setItem(TOKEN_KEY, accessToken)
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    },

    /**
     * Elimina todos los tokens del localStorage.
     * Usado durante el logout o cuando los tokens son inválidos.
     */
    clearTokens: (): void => {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(REFRESH_TOKEN_KEY)
    },
}

/**
 * Interceptor de Request
 * 
 * Se ejecuta antes de cada petición HTTP.
 * Agrega el header Authorization con el token JWT si existe.
 */
axiosClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = tokenManager.getToken()
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

/**
 * Flag para evitar múltiples intentos de refresh simultáneos.
 */
let isRefreshing = false

/**
 * Cola de peticiones que esperan a que se complete el refresh del token.
 */
let failedQueue: Array<{
    resolve: (value: unknown) => void
    reject: (error: unknown) => void
}> = []

/**
 * Procesa la cola de peticiones pendientes.
 * 
 * @param error - Error si el refresh falló, null si fue exitoso.
 * @param token - Nuevo token si el refresh fue exitoso.
 */
const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

/**
 * Interceptor de Response
 * 
 * Se ejecuta después de cada respuesta HTTP.
 * 
 * Maneja errores 401 (No autorizado):
 * 1. Si hay un refresh token, intenta refrescar la sesión
 * 2. Si el refresh es exitoso, reintenta la petición original
 * 3. Si el refresh falla, redirige al login
 * 
 * También encola peticiones si ya hay un refresh en progreso
 * para evitar múltiples llamadas al endpoint de refresh.
 */
axiosClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        // Si el error es 401 y no hemos intentado refrescar aún
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Si ya estamos refrescando, encolar esta petición
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then((token) => {
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${token}`
                    }
                    return axiosClient(originalRequest)
                })
            }

            originalRequest._retry = true
            isRefreshing = true

            const refreshToken = tokenManager.getRefreshToken()
            if (!refreshToken) {
                // No hay refresh token, redirigir al login
                tokenManager.clearTokens()
                window.location.href = '/login'
                return Promise.reject(error)
            }

            try {
                // Intentar refrescar el token
                const response = await axios.post(`${env.API_URL}/auth/refresh`, {
                    refreshToken,
                })

                const { token: newToken, refreshToken: newRefreshToken } = response.data
                tokenManager.setTokens(newToken, newRefreshToken)

                // Procesar peticiones encoladas con el nuevo token
                processQueue(null, newToken)

                // Reintentar la petición original
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`
                }
                return axiosClient(originalRequest)
            } catch (refreshError) {
                // El refresh falló, limpiar y redirigir al login
                processQueue(refreshError, null)
                tokenManager.clearTokens()
                window.location.href = '/login'
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        return Promise.reject(error)
    }
)

export default axiosClient
