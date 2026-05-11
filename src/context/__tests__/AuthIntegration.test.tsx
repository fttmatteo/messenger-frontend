import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import type { ReactNode } from 'react'
import { Preferences } from '@capacitor/preferences'

const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
)

/**
 * Suite de pruebas de integración para el contexto de autenticación.
 * Verifica el flujo completo de inicio de sesión, cierre de sesión y persistencia
 * utilizando MSW (Mock Service Worker) para interceptar las llamadas a la API.
 */
describe('AuthIntegration (MSW)', () => {
    beforeEach(() => {
        localStorage.clear()
        sessionStorage.clear()
        vi.clearAllMocks()
    })

    afterEach(() => {
        localStorage.clear()
        sessionStorage.clear()
    })

    it('should login successfully using real service and MSW', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper })

        expect(result.current.isAuthenticated).toBe(false)
        expect(result.current.user).toBeNull()

        await act(async () => {
            await result.current.login({
                document: 12345,
                password: 'correct-password',
                rememberMe: true,
                turnstileToken: 'test-token'
            })
        })

        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.user).toMatchObject({
            document: 12345,
            role: 'ADMIN',
            id: 123
        })

        const { value: role } = await Preferences.get({ key: 'role' })
        expect(role).toBe('ADMIN')
        const { value: user } = await Preferences.get({ key: 'user' })
        expect(user).toContain('"id":123')
    })

    it('should logout and clear storage', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper })

        await act(async () => {
            await result.current.login({
                document: 12345,
                password: 'any',
                rememberMe: false,
                turnstileToken: 'test-token'
            })
        })
        expect(result.current.isAuthenticated).toBe(true)

        await act(async () => {
            await result.current.logout()
        })

        expect(result.current.isAuthenticated).toBe(false)
        expect(result.current.user).toBeNull()
        const { value: user } = await Preferences.get({ key: 'user' })
        expect(user).toBeNull()
    })

    it('should restore session from localStorage on mount', async () => {
        const storedUser = {
            document: '999',
            role: 'MESSENGER',
            id: 999,
            isOnline: true
        }
        await Preferences.set({ key: 'user', value: JSON.stringify(storedUser) })
        await Preferences.set({ key: 'role', value: storedUser.role })

        const { result } = renderHook(() => useAuth(), { wrapper })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.user).toEqual(storedUser)
    })
})
