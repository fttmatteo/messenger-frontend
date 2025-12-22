import axios from 'axios'
import { authService } from './auth.service'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// Create axios instance with default config
export const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 30000,
})

// Request interceptor - add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = authService.getToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Flag to track if token refresh is already in progress
let isRefreshing = false
// Queue to hold requests that are waiting for the token refresh
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else {
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
                    .then((token) => {
                        originalRequest.headers.Authorization = 'Bearer ' + token
                        return apiClient(originalRequest)
                    })
                    .catch((err) => {
                        return Promise.reject(err)
                    })
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                const { token } = await authService.refreshToken()
                apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + token
                processQueue(null, token)

                // Retry original request
                originalRequest.headers.Authorization = 'Bearer ' + token
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
