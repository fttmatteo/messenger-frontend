import type { AuthResponse, LoginCredentials } from '../types/auth.types';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/auth';

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Error en el inicio de sesión');
        }

        return response.json();
    },

    async refreshToken(): Promise<AuthResponse> {
        const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');

        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await fetch(`${API_URL}/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        const data: AuthResponse = await response.json();
        const storage = localStorage.getItem('refreshToken') ? localStorage : sessionStorage;

        storage.setItem('token', data.token);
        storage.setItem('refreshToken', data.refreshToken);

        return data;
    },

    logout() {
        const keys = ['token', 'refreshToken', 'role', 'user'];
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
        return localStorage.getItem('token') || sessionStorage.getItem('token');
    },

    getRole() {
        return localStorage.getItem('role') || sessionStorage.getItem('role');
    }
};
