import axios from 'axios'
import { authService } from './auth.service'
import { logger } from '../utils/logger'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

/**
 * Cliente Axios configurado para interactuar con la API del backend.
 * Incluye configuración base para cookies (CORS), timeouts y manejo de errores.
 * 
 * Implementa un sistema de interceptores para:
 * 1. Inyectar IDs de correlación y tokens de sesión como fallback.
 * 2. Gestionar la renovación automática de tokens (Refresh Token) ante errores 401.
 * 3. Centralizar el logueo de errores de comunicación.
 */
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

// Interceptor de petición: El frontend prefiere usar cookies.
// Ya no enviamos el accessToken manualmente si withCredentials: true está activo,
// para minimizar superficies de ataque y redundancia.
apiClient.interceptors.request.use(
    (config) => {
        const correlationId = crypto.randomUUID();
        config.headers['X-Correlation-Id'] = correlationId;

        // Fallback: Si el entorno ha guardado un token (porque las cookies fallaron o es Safari),
        // lo enviamos explícitamente en el header.
        const token = sessionStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // Nota: Axios ya debería manejar X-XSRF-TOKEN automáticamente 
        // si la cookie XSRF-TOKEN está presente.

        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de respuesta: capturar token del body si llega
apiClient.interceptors.response.use(
    (response) => {
        if (response.config.url?.includes('/auth/')) {
            // Lógica específica de auth si fuera necesaria
        }

        // Si la respuesta trae tokens en el body, lo guardamos como fallback
        if (response.data) {
            if (response.data.accessToken) {
                sessionStorage.setItem('accessToken', response.data.accessToken);
            }
            if (response.data.refreshToken) {
                sessionStorage.setItem('refreshToken', response.data.refreshToken);
            }
        }
        return response;
    },
    async (error) => {
        // Esta parte es manejada por el interceptor posterior, así que solo pasamos el error
        return Promise.reject(error);
    }
);

// Indicador para rastrear si la renovación del token ya está en progreso
let isRefreshing = false

// Tipo para peticiones en cola esperando la renovación del token
interface QueuedRequest {
    resolve: (token: string) => void
    reject: (error: unknown) => void
}

// Cola para mantener las peticiones que están esperando la renovación del token
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

// Interceptor de respuesta - manejar errores 401 globalmente y loguear todos los errores
apiClient.interceptors.response.use(
    (response) => {
        // Podemos loguear metadata opcionalmente aquí
        return response
    },
    async (error) => {
        const originalRequest = error.config

        if (!originalRequest?._retry || error.response?.status !== 401) {
            logger.apiError('Error en petición API', error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            // Ignorar reintento si el endpoint es login
            // (evita bucles infinitos: login falla -> 401 -> refresh -> retry login -> loop)
            if (originalRequest.url?.includes('auth/login')) {
                return Promise.reject(error)
            }

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

                // Reintentar petición original
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
