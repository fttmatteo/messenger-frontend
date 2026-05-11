import axios from 'axios'
import { logger } from '../utils/logger'
import { Preferences } from '@capacitor/preferences'

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
    withCredentials: true,
})

apiClient.interceptors.request.use(
    async (config) => {
        const correlationId = crypto.randomUUID();
        config.headers['X-Correlation-Id'] = correlationId;

        try {
            const { value } = await Preferences.get({ key: 'accessToken' });
            const token = value || localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
            
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        } catch (e) {
            logger.warn('No se pudo recuperar el token de respaldo:', e);
        }

        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => Promise.reject(error)
);

let isRefreshing = false

interface QueuedRequest {
    resolve: (token: string) => void
    reject: (error: unknown) => void
}

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

apiClient.interceptors.response.use(
    (response) => {
        return response
    },
    async (error) => {
        const originalRequest = error.config

        if (!originalRequest?._retry || error.response?.status !== 401) {
            logger.apiError('Error en petición API', error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            const isAuthAction = 
                originalRequest.url?.includes('auth/login') || 
                originalRequest.url?.includes('auth/refresh') || 
                originalRequest.url?.includes('auth/logout');
            
            if (isAuthAction) {
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
                const { authService } = await import('./auth.service')
                
                await authService.refreshToken()
                processQueue(null, 'refreshed')

                return apiClient(originalRequest)
            } catch (err) {
                processQueue(err, null)
                const { authService } = await import('./auth.service')
                await authService.logout()
                window.dispatchEvent(new CustomEvent('session-expired'))
                return Promise.reject(err)
            } finally {
                isRefreshing = false
            }
        }

        return Promise.reject(error)
    }
)

/**
 * Solo para propósitos de test: permite resetear el estado interno de renovación.
 * @internal
 */
export const _resetState = () => {
    isRefreshing = false
    failedQueue = []
}

export default apiClient
