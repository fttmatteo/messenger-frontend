import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../auth.service';
import apiClient from '../api-client';
import { offlineCacheService } from '../offline-cache.service';
import { Preferences } from '@capacitor/preferences';
import { logger } from '@/utils/logger';
import { isNative } from '@/lib/capacitor';

vi.mock('../api-client', () => ({
    default: {
        post: vi.fn(),
    },
}));

vi.mock('../offline-cache.service', () => ({
    offlineCacheService: {
        clearAll: vi.fn(),
    },
}));

vi.mock('@capacitor/preferences', () => ({
    Preferences: {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
    },
}));

vi.mock('@/lib/capacitor', () => ({
    isNative: vi.fn(() => false),
}));

vi.mock('@/utils/logger', () => ({
    logger: {
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

describe('authService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        sessionStorage.clear();
    });

    describe('login', () => {
        it('should return parsed data on successful login', async () => {
            const mockResponse = {
                data: {
                    role: 'MESSENGER',
                    message: 'Login success',
                    user: { id: 1, name: 'Test User', document: 12345, role: 'MESSENGER' },
                    accessToken: 'access-token',
                },
            };
            vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

            const result = await authService.login({ document: 12345, password: 'password', turnstileToken: 'mock-token' });

            expect(result).toEqual(mockResponse.data);
            expect(apiClient.post).toHaveBeenCalledWith('/auth/login', { document: 12345, password: 'password', turnstileToken: 'mock-token' });
        });

        it('should throw error if response schema is invalid', async () => {
            const mockResponse = { data: { invalid: 'data' } };
            vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

            await expect(authService.login({ document: 12345, password: 'password', turnstileToken: 'mock-token' }))
                .rejects.toThrow('Formato de respuesta del servidor inválido');
            expect(logger.error).toHaveBeenCalled();
        });
    });

    describe('refreshToken', () => {
        it('should call /auth/refresh with token from Preferences', async () => {
            vi.mocked(isNative).mockReturnValue(true);
            vi.mocked(Preferences.get).mockResolvedValue({ value: 'pref-refresh-token' });
            vi.mocked(apiClient.post).mockResolvedValue({});

            await authService.refreshToken();

            expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'pref-refresh-token' });
        });


        it('should call /auth/refresh with empty object if no token found', async () => {
            vi.mocked(Preferences.get).mockResolvedValue({ value: null });
            vi.mocked(apiClient.post).mockResolvedValue({});

            await authService.refreshToken();

            expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh', {});
        });
    });

    describe('logout', () => {
        it('should clear everything and call logout API', async () => {
            vi.mocked(apiClient.post).mockResolvedValue({});

            await authService.logout();

            expect(offlineCacheService.clearAll).toHaveBeenCalled();
            expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
            expect(Preferences.remove).toHaveBeenCalledTimes(4);
        });

        it('should not throw if API logout fails', async () => {
            vi.mocked(apiClient.post).mockRejectedValue(new Error('Logout failed'));

            await expect(authService.logout()).resolves.toBeUndefined();
            expect(logger.warn).toHaveBeenCalled();
        });
    });

    describe('getCurrentUserAsync', () => {
        it('should get user from Preferences', async () => {
            vi.mocked(isNative).mockReturnValue(true);
            const user = { id: 1, name: 'Test' };
            vi.mocked(Preferences.get).mockResolvedValue({ value: JSON.stringify(user) });

            const result = await authService.getCurrentUserAsync();
            expect(result).toEqual(user);
        });

    });

    describe('getTokenAsync', () => {
        it('should return token from Preferences', async () => {
            vi.mocked(isNative).mockReturnValue(true);
            vi.mocked(Preferences.get).mockResolvedValue({ value: 'token' });
            const result = await authService.getTokenAsync();
            expect(result).toBe('token');
        });
    });

    describe('getWsToken', () => {
        it('should return wsToken from API', async () => {
            vi.mocked(apiClient.post).mockResolvedValue({ data: { wsToken: 'ws-token-123' } });
            const result = await authService.getWsToken();
            expect(result).toBe('ws-token-123');
            expect(apiClient.post).toHaveBeenCalledWith('/auth/ws-token');
        });
    });

    describe('getRoleAsync', () => {
        it('should return role from Preferences', async () => {
            vi.mocked(isNative).mockReturnValue(true);
            vi.mocked(Preferences.get).mockResolvedValue({ value: 'ADMIN' });
            const result = await authService.getRoleAsync();
            expect(result).toBe('ADMIN');
        });
    });
});
