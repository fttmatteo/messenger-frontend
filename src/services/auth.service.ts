import type { LoginCredentials, LoginResponse } from '@/types';
import { LoginResponseSchema } from '@/schemas/api-schemas';
import apiClient from './api-client';
import { logger } from '@/utils/logger';

export const authService = {
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
        const rawData = response.data;

        // Validar respuesta contra schema Zod
        try {
            const validatedData = LoginResponseSchema.parse(rawData);
            return validatedData;
        } catch (error) {
            logger.error('Validation error in auth.login:', error);
            throw new Error('Invalid server response format');
        }
    },

    async refreshToken(): Promise<void> {
        // Enviar refresh token en body como fallback si existe en storage (cookies bloqueadas)
        const fallbackToken = sessionStorage.getItem('refreshToken');
        await apiClient.post('/auth/refresh', fallbackToken ? { refreshToken: fallbackToken } : {});
    },

    async logout() {
        try {
            // Llamar endpoint de logout para limpiar cookies del servidor
            await apiClient.post('/auth/logout');
        } catch (error) {
            logger.warn('Logout error (non-critical):', error);
        }

        // Limpiar metadata local
        const keys = ['role', 'user'];
        keys.forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });

        // Limpiar token fallback
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (userStr) return JSON.parse(userStr);
        return null;
    },

    getToken() {
        // Retornar el token de sessionStorage como fallback si es necesario
        return sessionStorage.getItem('accessToken');
    },

    async getWsToken(): Promise<string> {
        const response = await apiClient.post<{ wsToken: string }>('/auth/ws-token');
        return response.data.wsToken;
    },

    getRole() {
        return localStorage.getItem('role') || sessionStorage.getItem('role');
    }
};
