import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from './auth.service'
import { Preferences } from '@capacitor/preferences'
import apiClient from './api-client'

vi.mock('@capacitor/preferences', () => ({
    Preferences: {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn()
    }
}))

vi.mock('./api-client', () => ({
    default: {
        post: vi.fn(() => Promise.resolve({ data: {} }))
    }
}))

vi.mock('./offline-cache.service', () => ({
    offlineCacheService: {
        clearAll: vi.fn(() => Promise.resolve())
    }
}))

describe('Auth Service - Phase 1 Security', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        sessionStorage.clear();
    });

    it('saveSession debe guardar en Preferences y NO en localStorage', async () => {
        const mockUser = { id: 1, name: 'Test' } as any;
        const mockRole = 'ADMIN';
        const mockToken = 'secret-token';

        await authService.saveSession(mockUser, mockRole, mockToken);

        expect(Preferences.set).toHaveBeenCalledWith(expect.objectContaining({ key: 'accessToken', value: mockToken }));
        expect(Preferences.set).toHaveBeenCalledWith(expect.objectContaining({ key: 'user' }));

        expect(localStorage.getItem('accessToken')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
    });

    it('logout debe limpiar todos los almacenamientos', async () => {
        await authService.logout();

        expect(Preferences.remove).toHaveBeenCalled();
        expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
    });

    it('getTokenAsync debe recuperar el token de Preferences', async () => {
        const mockToken = 'native-token';
        vi.mocked(Preferences.get).mockResolvedValue({ value: mockToken });

        const token = await authService.getTokenAsync();

        expect(token).toBe(mockToken);
        expect(Preferences.get).toHaveBeenCalledWith({ key: 'accessToken' });
    });
});
