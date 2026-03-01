import type { LoginCredentials, LoginResponse } from '@/types';
import { LoginResponseSchema } from '@/schemas/api-schemas';
import apiClient from './api-client';
import { logger } from '@/utils/logger';
import { offlineCacheService } from './offline-cache.service';
import { Preferences } from '@capacitor/preferences';

/**
 * Servicio encargado de gestionar los flujos de autenticación.
 * Maneja el ciclo de vida de la sesión, utilizando almacenamiento seguro nativo cuando es posible.
 */
export const authService = {
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
        const rawData = response.data;

        try {
            return LoginResponseSchema.parse(rawData);
        } catch (error) {
            logger.error('Error de validación en auth.login:', error);
            throw new Error('Formato de respuesta del servidor inválido');
        }
    },

    async refreshToken(): Promise<void> {
        let fallbackToken = null;
        try {
            const { value } = await Preferences.get({ key: 'refreshToken' });
            fallbackToken = value;
        } catch { /* ignore */ }

        if (!fallbackToken) {
            fallbackToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
        }

        await apiClient.post('/auth/refresh', fallbackToken ? { refreshToken: fallbackToken } : {});
    },

    async logout() {
        try {
            await offlineCacheService.clearAll();
            await apiClient.post('/auth/logout');
        } catch (error) {
            logger.warn('Error al cerrar sesión (no crítico):', error);
        }

        const keys = ['role', 'user', 'accessToken', 'refreshToken'];

        // Limpiar storage web clásico
        keys.forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });

        // Limpiar secure storage
        for (const key of keys) {
            await Preferences.remove({ key });
        }
    },

    async getCurrentUserAsync(): Promise<unknown> {
        try {
            const { value } = await Preferences.get({ key: 'user' });
            if (value) return JSON.parse(value);
        } catch { /* ignore */ }

        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (userStr) return JSON.parse(userStr);
        return null;
    },

    async getTokenAsync(): Promise<string | null> {
        try {
            const { value } = await Preferences.get({ key: 'accessToken' });
            if (value) return value;
        } catch { /* ignore */ }

        return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    },

    async getWsToken(): Promise<string> {
        const response = await apiClient.post<{ wsToken: string }>('/auth/ws-token');
        return response.data.wsToken;
    },

    async getRoleAsync() {
        try {
            const { value } = await Preferences.get({ key: 'role' });
            if (value) return value;
        } catch { /* ignore */ }

        return localStorage.getItem('role') || sessionStorage.getItem('role');
    }
};
