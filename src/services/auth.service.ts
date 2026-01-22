import type { LoginCredentials, LoginResponse } from '@/types';
import { LoginResponseSchema } from '@/schemas/api-schemas';
import apiClient from './api-client';
import { logger } from '@/utils/logger';
import { offlineCacheService } from './offline-cache.service';

/**
 * Servicio encargado de gestionar los flujos de autenticación.
 * Maneja el ciclo de vida de la sesión, incluyendo el inicio y cierre de sesión,
 * la renovación de tokens y la recuperación de información del usuario y roles.
 */
export const authService = {
    /**
     * Realiza el proceso de inicio de sesión.
     * @param credentials - Credenciales de acceso (documento y contraseña).
     * @returns Datos del usuario y tokens de acceso tras una validación exitosa.
     */
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
        const rawData = response.data;

        // Validar respuesta contra schema Zod
        try {
            const validatedData = LoginResponseSchema.parse(rawData);
            return validatedData;
        } catch (error) {
            logger.error('Error de validación en auth.login:', error);
            throw new Error('Formato de respuesta del servidor inválido');
        }
    },

    /**
     * Solicita una renovación del token de acceso utilizando una cookie de sesión o el token persistente.
     */
    async refreshToken(): Promise<void> {
        // Enviar refresh token en body como fallback si existe en storage (cookies bloqueadas)
        const fallbackToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
        await apiClient.post('/auth/refresh', fallbackToken ? { refreshToken: fallbackToken } : {});
    },

    /**
     * Cierra la sesión del usuario actual, limpia el almacenamiento local y notifica al servidor.
     */
    async logout() {
        try {
            // Limpiar caché offline antes de nada
            await offlineCacheService.clearAll();

            // Llamar endpoint de logout para limpiar cookies del servidor
            await apiClient.post('/auth/logout');
        } catch (error) {
            logger.warn('Error al cerrar sesión (no crítico):', error);
        }

        // Limpiar metadata local
        const keys = ['role', 'user'];
        keys.forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });

        // Limpiar tokens
        const tokenKeys = ['accessToken', 'refreshToken'];
        tokenKeys.forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });
    },

    /**
     * Recupera el objeto del usuario autenticado actualmente desde el almacenamiento local.
     * @returns Datos del usuario o null si no hay sesión activa.
     */
    getCurrentUser() {
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (userStr) return JSON.parse(userStr);
        return null;
    },

    /**
     * Obtiene el token de acceso actual (fallback en sessionStorage).
     * @returns El token de acceso como string o null.
     */
    getToken() {
        return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    },

    /**
     * Obtiene un token efímero específico para establecer una conexión segura vía WebSockets.
     */
    async getWsToken(): Promise<string> {
        const response = await apiClient.post<{ wsToken: string }>('/auth/ws-token');
        return response.data.wsToken;
    },

    /**
     * Obtiene el rol del usuario actual (ADMIN, MESSENGER, etc.).
     */
    getRole() {
        return localStorage.getItem('role') || sessionStorage.getItem('role');
    }
};
