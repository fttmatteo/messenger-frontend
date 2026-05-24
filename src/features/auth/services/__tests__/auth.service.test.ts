import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from '@/features/auth/services/auth.service'
import { Preferences } from '@capacitor/preferences'
import apiClient from '@/shared/services/api-client'
import { isNative } from '@/shared/lib/capacitor'

vi.mock('@capacitor/preferences', () => ({
    Preferences: {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn()
    }
}))

vi.mock('@/lib/capacitor', () => ({
    isNative: vi.fn(() => false)
}))

vi.mock('@/shared/services/api-client', () => ({
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
        vi.mocked(isNative).mockReturnValue(false);
    });

    it('saveSession debe guardar en Preferences y TAMBIÉN en localStorage para resiliencia', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mockUser = { id: 1, fullName: 'Test' } as any;
        const mockRole = 'ADMIN';
        const mockToken = 'secret-token';

        await authService.saveSession(mockUser, mockRole, mockToken);

        expect(Preferences.set).toHaveBeenCalledWith(expect.objectContaining({ key: 'accessToken', value: mockToken }));
        
        // Ahora esperamos que SÍ esté en localStorage por nuestra nueva política de respaldo
        expect(localStorage.getItem('accessToken')).toBe(mockToken);
        expect(localStorage.getItem('user')).toContain('Test');
    });

    it('logout debe limpiar todos los almacenamientos', async () => {
        await authService.logout();

        expect(Preferences.remove).toHaveBeenCalled();
        expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
        expect(localStorage.getItem('accessToken')).toBeNull();
    });

    it('getTokenAsync debe recuperar el token de Preferences en entorno nativo', async () => {
        const mockToken = 'native-token';
        vi.mocked(isNative).mockReturnValue(true);
        vi.mocked(Preferences.get).mockResolvedValue({ value: mockToken });

        const token = await authService.getTokenAsync();

        expect(token).toBe(mockToken);
        expect(Preferences.get).toHaveBeenCalledWith({ key: 'accessToken' });
    });
});
