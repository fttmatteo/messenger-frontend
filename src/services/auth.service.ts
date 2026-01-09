import type { LoginCredentials, LoginResponse } from '@/types';
import { LoginResponseSchema } from '@/schemas/api-schemas';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/auth';

export const authService = {
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // CRÍTICO: Enviar y recibir cookies
            body: JSON.stringify(credentials),
        });

        const rawData = await response.json();

        if (!response.ok) {
            // Manejar específicamente el rate limiting (429)
            if (response.status === 429) {
                const error = new Error(rawData.message || 'Demasiados intentos fallidos. Intenta de nuevo en 15 minutos.') as Error & { statusCode?: number };
                error.statusCode = 429;
                throw error;
            }

            // Para otros errores (401, etc.)
            const error = new Error(rawData.message || 'Error en el inicio de sesión') as Error & { statusCode?: number };
            error.statusCode = response.status;
            throw error;
        }

        // Validar respuesta contra schema Zod
        try {
            const validatedData = LoginResponseSchema.parse(rawData);
            return validatedData;
        } catch {
            throw new Error('Invalid server response format');
        }
    },

    async refreshToken(): Promise<void> {
        // El refresh token está en cookie automáticamente
        // NO necesitamos enviarlo en el body
        const response = await fetch(`${API_URL}/refresh`, {
            method: 'POST',
            credentials: 'include', // Envía cookie automáticamente
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        // Nueva cookie se setea automáticamente por el servidor
        // NO necesitamos hacer nada más
    },

    async logout() {
        try {
            // Llamar endpoint de logout para limpiar cookies del servidor
            await fetch(`${API_URL}/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.warn('Logout error:', error);
        }

        // Limpiar metadata local
        const keys = ['role', 'user'];
        keys.forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (userStr) return JSON.parse(userStr);
        return null;
    },

    getToken() {
        // Ya NO necesitamos este método
        // Las cookies se envían automáticamente con cada request
        // Mantenemos por compatibilidad pero retorna null
        return null;
    },

    async getWsToken(): Promise<string> {
        const response = await fetch(`${API_URL}/ws-token`, {
            method: 'POST',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to get WebSocket token');
        }

        const data = await response.json();
        return data.wsToken;
    },

    getRole() {
        return localStorage.getItem('role') || sessionStorage.getItem('role');
    }
};
