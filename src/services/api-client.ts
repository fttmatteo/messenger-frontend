import axios from 'axios'
import { authService } from './auth.service'
import { logger } from '../utils/logger'
import { v4 as uuidv4 } from 'uuid'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// Create axios instance with default config
export const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    withCredentials: true, // CRÍTICO: Enviar cookies en cada request
})

// Defensivo: Limpiar residuo de 'token' en localStorage si existe (legacy)
// Esto evita que alguna librería o componente legacy intente decodificarlo si quedó basura.
if (typeof window !== 'undefined' && localStorage.getItem('token')) {
    localStorage.removeItem('token');
}

// Request interceptor - Correlation ID and cookies handled automatically
apiClient.interceptors.request.use(
    (config) => {
        // Generar o usar Correlation ID para trazabilidad
        const correlationId = uuidv4();
        config.headers['X-Correlation-ID'] = correlationId;

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

// Response interceptor - handle 401 errors globally and log all errors
apiClient.interceptors.response.use(
    (response) => {
        // Podemos loguear metadata opcionalmente aquí
        return response
    },
    async (error) => {
        const originalRequest = error.config

        // Loguear error de API de forma profesional
        if (!originalRequest?._retry || error.response?.status !== 401) {
            logger.apiError('Error en petición API', error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject })
                })
                    .then(() => {
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
                processQueue(null, 'refreshed')

                // Retry original request
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
