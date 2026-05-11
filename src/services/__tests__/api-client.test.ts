import { describe, it, expect, vi, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/mocks/server';
import apiClient, { _resetState } from '../api-client';
import { authService } from '../auth.service';
import { Preferences } from '@capacitor/preferences';

// Mock authService para evitar side-effects
vi.mock('../auth.service', () => ({
    authService: {
        refreshToken: vi.fn(),
        logout: vi.fn(),
    }
}));

import type { InternalAxiosRequestConfig } from 'axios';

describe('api-client interceptors', () => {
    beforeEach(() => {
        _resetState();
        vi.clearAllMocks();
        localStorage.clear();
        sessionStorage.clear();
    });

    it('should inject correlation ID into request headers', async () => {
        // En lugar de interceptores, podemos probar la configuración directamente de axios
        // instanciando la promesa
        const requestInterceptor = (apiClient.interceptors.request as unknown as { handlers: { fulfilled: (c: InternalAxiosRequestConfig) => Promise<InternalAxiosRequestConfig> }[] }).handlers[0].fulfilled;

        const config = { headers: {} as unknown as InternalAxiosRequestConfig['headers'] } as InternalAxiosRequestConfig;
        const result = await requestInterceptor(config);

        expect(result.headers['X-Correlation-Id']).toBeDefined();
        // Debe ser un UUID válido
        expect(result.headers['X-Correlation-Id']).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should inject accessToken from Preferences as fallback', async () => {
        const requestInterceptor = (apiClient.interceptors.request as unknown as { handlers: { fulfilled: (c: InternalAxiosRequestConfig) => Promise<InternalAxiosRequestConfig> }[] }).handlers[0].fulfilled;
        await Preferences.set({ key: 'accessToken', value: 'test-token' });

        const config = { headers: {} as unknown as InternalAxiosRequestConfig['headers'] } as InternalAxiosRequestConfig;
        const result = await requestInterceptor(config);

        expect(result.headers['Authorization']).toBe('Bearer test-token');
    });


    describe('401 Refresh logic', () => {
        it('should handle 401 error and trigger token refresh', { timeout: 15000 }, async () => {
            let refreshCalled = false;
            vi.mocked(authService.refreshToken).mockImplementation(async () => {
                refreshCalled = true;
            });

            server.use(
                http.get(new RegExp('.*/test-401'), () => {
                    if (!refreshCalled) {
                        return new HttpResponse(null, { status: 401 });
                    }
                    return HttpResponse.json({ data: 'retry-success' });
                }),
                http.get(new RegExp('.*/test-401'), () => {
                    return HttpResponse.json({ data: 'retry-success' });
                })
            );

            const result = await apiClient.get('/test-401');

            expect(refreshCalled).toBe(true);
            expect(result.data.data).toBe('retry-success');
        });

        it('should avoid loop if endpoint is login', async () => {
            server.use(
                http.post(new RegExp('.*/auth/login'), () => {
                    return new HttpResponse(null, { status: 401 });
                })
            );

            await expect(apiClient.post('/auth/login', {})).rejects.toThrow();
            expect(authService.refreshToken).not.toHaveBeenCalled();
        });

        it('should logout on refresh failure', async () => {
            vi.mocked(authService.refreshToken).mockRejectedValue(new Error('Refresh failed'));

            server.use(
                http.get(new RegExp('.*/test-refresh-fail'), () => {
                    return new HttpResponse(null, { status: 401 });
                })
            );

            await expect(apiClient.get('/test-refresh-fail')).rejects.toThrow();
            expect(authService.logout).toHaveBeenCalled();
        });
    });
});
