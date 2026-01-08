import type { LoginCredentials, LoginResponse } from '@/types';

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

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Error en el inicio de sesión');
        }

        const data: LoginResponse = await response.json();
        // No guardamos tokens ni estado aquí; lo gestiona AuthContext según rememberMe.
        return data;
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
            console.error('Error en logout:', error);
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

    getRole() {
        return localStorage.getItem('role') || sessionStorage.getItem('role');
    }
};
