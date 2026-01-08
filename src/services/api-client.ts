import axios from 'axios'
import { authService } from './auth.service'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// Create axios instance with default config
export const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    withCredentials: true, // CRÍTICO: Enviar cookies en cada request
})

// Request interceptor - Ya NO necesitamos añadir Authorization header manualmente
// Las cookies se envían automáticamente gracias a withCredentials: true
apiClient.interceptors.request.use(
    (config) => {
        // Las cookies HttpOnly se envían automáticamente
        // Ya no necesitamos manipular el header Authorization
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Flag to track if token refresh is already in progress
let isRefreshing = false

// Type for queued requests waiting for token refresh
interface QueuedRequest {
    resolve: (token: string) => void
    reject: (error: unknown) => void
}

// Queue to hold requests that are waiting for the token refresh
let failedQueue: QueuedRequest[] = []

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else if (token) {
            prom.resolve(token)
        }
    })

    failedQueue = []
}

// Response interceptor - handle 401 errors globally
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject })
                })
                    .then(() => {
                        // Ya no necesitamos pasar el token
                        // La cookie se envía automáticamente
                        return apiClient(originalRequest)
                    })
                    .catch((err) => {
                        return Promise.reject(err)
                    })
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                // Refresh token automáticamente desde cookie
                await authService.refreshToken()
                
                // Ya no necesitamos setear headers manualmente
                // La cookie nueva se envía automáticamente
                processQueue(null, 'refreshed')

                // Retry original request (cookie se envía automáticamente)
                return apiClient(originalRequest)
            } catch (err) {
                processQueue(err, null)
                authService.logout()
                window.dispatchEvent(new CustomEvent('session-expired'))
                return Promise.reject(err)
            } finally {
                isRefreshing = false
            }
        }

        return Promise.reject(error)
    }
)

export default apiClient
