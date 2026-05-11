import type { LoginCredentials, LoginResponse, User } from '@/types';
import { LoginResponseSchema } from '@/schemas/api-schemas';
import apiClient from './api-client';
import { logger } from '@/utils/logger';
import { offlineCacheService } from './offline-cache.service';
import { Preferences } from '@capacitor/preferences';

const KEYS = {
    USER: 'user',
    ROLE: 'role',
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken'
} as const;

/**
 * Servicio encargado de gestionar los flujos de autenticación.
 */
export const authService = {
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
        const data = response.data;

        try {
            const validated = LoginResponseSchema.parse(data);
            
            const userObj: User = {
                document: credentials.document,
                role: validated.role,
                id: validated.user?.id,
                name: validated.user?.name,
                dealershipName: validated.user?.dealershipName,
                isOnline: validated.role === 'MESSENGER'
            };

            await authService.saveSession(
                userObj, 
                validated.role, 
                validated.accessToken, 
                validated.refreshToken, 
                credentials.rememberMe
            );
            
            return validated;
        } catch (error) {
            logger.error('Error de validación en auth.login:', error);
            throw new Error('Formato de respuesta del servidor inválido');
        }
    },

    async saveSession(user: User, role: string, accessToken?: string, refreshToken?: string, rememberMe: boolean = true) {
        if (rememberMe) {
            await Preferences.set({ key: KEYS.USER, value: JSON.stringify(user) });
            await Preferences.set({ key: KEYS.ROLE, value: role });
            if (accessToken) await Preferences.set({ key: KEYS.ACCESS_TOKEN, value: accessToken });
            if (refreshToken) await Preferences.set({ key: KEYS.REFRESH_TOKEN, value: refreshToken });
        } else {
            sessionStorage.setItem(KEYS.USER, JSON.stringify(user));
            sessionStorage.setItem(KEYS.ROLE, role);
            if (accessToken) sessionStorage.setItem(KEYS.ACCESS_TOKEN, accessToken);
            if (refreshToken) sessionStorage.setItem(KEYS.REFRESH_TOKEN, refreshToken);
        }
    },

    async refreshToken(): Promise<void> {
        const { value } = await Preferences.get({ key: KEYS.REFRESH_TOKEN });
        const refreshToken = value || sessionStorage.getItem(KEYS.REFRESH_TOKEN);
        await apiClient.post('/auth/refresh', refreshToken ? { refreshToken } : {});
    },

    async logout() {
        try {
            await offlineCacheService.clearAll();
            await apiClient.post('/auth/logout');
        } catch (error) {
            logger.warn('Error al cerrar sesión en el servidor:', error);
        }

        for (const key of Object.values(KEYS)) {
            await Preferences.remove({ key });
        }
        
        localStorage.clear();
        sessionStorage.clear();
    },

    async getCurrentUserAsync(): Promise<User | null> {
        try {
            const { value } = await Preferences.get({ key: KEYS.USER });
            const userStr = value || localStorage.getItem(KEYS.USER) || sessionStorage.getItem(KEYS.USER);
            return userStr ? JSON.parse(userStr) : null;
        } catch {
            return null;
        }
    },

    async getTokenAsync(): Promise<string | null> {
        const { value } = await Preferences.get({ key: KEYS.ACCESS_TOKEN });
        return value || localStorage.getItem(KEYS.ACCESS_TOKEN) || sessionStorage.getItem(KEYS.ACCESS_TOKEN);
    },

    async getWsToken(): Promise<string> {
        const response = await apiClient.post<{ wsToken: string }>('/auth/ws-token');
        return response.data.wsToken;
    },

    async getRoleAsync(): Promise<string | null> {
        const { value } = await Preferences.get({ key: KEYS.ROLE });
        return value || localStorage.getItem(KEYS.ROLE) || sessionStorage.getItem(KEYS.ROLE);
    }
};
