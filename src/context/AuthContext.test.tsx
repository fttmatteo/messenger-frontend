import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'
import { authService } from '@/services/auth.service'
import type { ReactNode } from 'react'
import { Preferences } from '@capacitor/preferences'

vi.mock('../services/auth.service', () => ({
    authService: {
        login: vi.fn(),
        logout: vi.fn(),
        getRoleAsync: vi.fn(),
        saveSession: vi.fn(async (user, role, _at, _rt, rememberMe = true) => {
            if (rememberMe) {
                await Preferences.set({ key: 'user', value: JSON.stringify(user) });
                await Preferences.set({ key: 'role', value: role });
            } else {
                sessionStorage.setItem('user', JSON.stringify(user));
                sessionStorage.setItem('role', role);
            }
        }),
        getCurrentUserAsync: vi.fn().mockImplementation(async () => {
            const { value } = await Preferences.get({ key: 'user' });
            const userStr = value || sessionStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        }),
    },
}))

const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
)

describe('AuthContext', () => {
    beforeEach(() => {
        localStorage.clear()
        sessionStorage.clear()
        vi.clearAllMocks()
        // Reset Preferences mock state (since it's linked to localStorage in setup.ts)
    })

    it('debe restaurar al usuario desde storage al montar', async () => {
        const storedUser = { id: 1, name: 'Test', document: 111, role: 'ADMIN', isOnline: true }
        await Preferences.set({ key: 'user', value: JSON.stringify(storedUser) })
        
        const { result } = renderHook(() => useAuth(), { wrapper })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        }, { timeout: 2000 })

        expect(result.current.user).toMatchObject(storedUser)
        expect(result.current.isAuthenticated).toBe(true)
    })

    it('debe iniciar sesión con rememberMe y guardar en Preferences', async () => {
        const mockResponse = {
            role: 'ADMIN',
            message: 'ok',
            user: { id: 123, name: 'Admin', document: 12345, role: 'ADMIN', isOnline: true }
        }
        
        vi.mocked(authService.login).mockImplementation(async (creds) => {
            await authService.saveSession(mockResponse.user, mockResponse.role, 'at', 'rt', creds.rememberMe);
            return mockResponse;
        })

        const { result } = renderHook(() => useAuth(), { wrapper })
        await waitFor(() => expect(result.current.isLoading).toBe(false))

        await act(async () => {
            await result.current.login({ document: 123, password: 'pw', rememberMe: true, turnstileToken: 't' })
        })

        const { value: role } = await Preferences.get({ key: 'role' })
        expect(role).toBe('ADMIN')
        expect(result.current.isAuthenticated).toBe(true)
    })

    it('debe iniciar sesión sin rememberMe y guardar en sessionStorage', async () => {
        const mockResponse = {
            role: 'MESSENGER',
            message: 'ok',
            user: { id: 456, name: 'Messenger', document: 67890, role: 'MESSENGER', isOnline: true }
        }

        vi.mocked(authService.login).mockImplementation(async (creds) => {
            await authService.saveSession(mockResponse.user, mockResponse.role, 'at', 'rt', creds.rememberMe);
            return mockResponse;
        })

        const { result } = renderHook(() => useAuth(), { wrapper })
        await waitFor(() => expect(result.current.isLoading).toBe(false))

        await act(async () => {
            await result.current.login({ document: 456, password: 'pw', rememberMe: false, turnstileToken: 't' })
        })

        expect(sessionStorage.getItem('role')).toBe('MESSENGER')
        const { value: role } = await Preferences.get({ key: 'role' })
        expect(role).toBeNull()
    })

    it('debe limpiar el estado al hacer logout', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper })
        await waitFor(() => expect(result.current.isLoading).toBe(false))

        await act(async () => {
            await result.current.logout()
        })

        expect(result.current.user).toBeNull()
        expect(result.current.isAuthenticated).toBe(false)
        expect(authService.logout).toHaveBeenCalled()
    })
})
