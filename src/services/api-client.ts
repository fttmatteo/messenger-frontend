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

// Response interceptor - handle 401 errors globally
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear auth data
            authService.logout()

            // Dispatch custom event for session expired
            window.dispatchEvent(new CustomEvent('session-expired'))
        }
        return Promise.reject(error)
    }
)

export default apiClient
