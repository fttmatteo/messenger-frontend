import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../api-client';
import { authService } from '../auth.service';

// Mock authService para evitar side-effects
vi.mock('../auth.service', () => ({
    authService: {
        refreshToken: vi.fn(),
        logout: vi.fn(),
    }
}));

describe('api-client interceptors', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        sessionStorage.clear();
    });

    it('should inject correlation ID into request headers', async () => {
        // En lugar de interceptores, podemos probar la configuración directamente de axios
        // instanciando la promesa
        const requestInterceptor = (apiClient.interceptors.request as any).handlers[0].fulfilled;

        const config = { headers: {} };
        const result = await requestInterceptor(config);

        expect(result.headers['X-Correlation-Id']).toBeDefined();
        // Debe ser un UUID válido
        expect(result.headers['X-Correlation-Id']).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should inject accessToken from localStorage as fallback', async () => {
        const requestInterceptor = (apiClient.interceptors.request as any).handlers[0].fulfilled;
        localStorage.setItem('accessToken', 'test-token');

        const config = { headers: {} };
        const result = await requestInterceptor(config);

        expect(result.headers['Authorization']).toBe('Bearer test-token');
    });

    it('should extract and save tokens from response body', async () => {
        const responseInterceptor = (apiClient.interceptors.response as any).handlers[0].fulfilled;

        const mockResponse = {
            config: { url: '/auth/login' },
            data: {
                accessToken: 'new-access',
                refreshToken: 'new-refresh'
            }
        };

        await responseInterceptor(mockResponse);

        expect(localStorage.getItem('accessToken')).toBe('new-access');
        expect(localStorage.getItem('refreshToken')).toBe('new-refresh');
    });

    describe('401 Refresh logic', () => {
        it('should handle 401 error and trigger token refresh', async () => {
            const errorInterceptor = (apiClient.interceptors.response as any).handlers[1].rejected;
            vi.mocked(authService.refreshToken).mockResolvedValue();

            // Mockeamos el fallback a apiClient
            const originalRequest = { _retry: false, url: '/services/all' };
            const mockError = {
                config: originalRequest,
                response: { status: 401 }
            };

            // Hacemos mock de apiClient en sí mismo para la repetición
            vi.spyOn(apiClient, 'request').mockResolvedValue('retry-success' as any);

            try {
                await errorInterceptor(mockError);
            } catch {
                // ignorar para este mock base
            }

            expect(authService.refreshToken).toHaveBeenCalled();
            expect(originalRequest._retry).toBe(true);
        });

        it('should avoid loop if endpoint is login', async () => {
            const errorInterceptor = (apiClient.interceptors.response as any).handlers[1].rejected;

            const originalRequest = { _retry: false, url: '/auth/login' };
            const mockError = {
                config: originalRequest,
                response: { status: 401 }
            };

            await expect(errorInterceptor(mockError)).rejects.toBe(mockError);
            expect(authService.refreshToken).not.toHaveBeenCalled();
        });

        it('should logout on refresh failure', async () => {
            const errorInterceptor = (apiClient.interceptors.response as any).handlers[1].rejected;
            vi.mocked(authService.refreshToken).mockRejectedValue(new Error('Refresh failed'));

            const originalRequest = { _retry: false, url: '/services/all' };
            const mockError = {
                config: originalRequest,
                response: { status: 401 }
            };

            await expect(errorInterceptor(mockError)).rejects.toThrow('Refresh failed');
            expect(authService.logout).toHaveBeenCalled();
        });
    });
});
