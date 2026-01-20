import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import type { ReactNode } from 'react'

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
                rememberMe: true
            })
        })

        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.user).toMatchObject({
            document: 12345,
            role: 'ADMIN',
            id: 123
        })

        expect(localStorage.getItem('role')).toBe('ADMIN')
        expect(localStorage.getItem('user')).toContain('"id":123')
        expect(localStorage.getItem('token')).toBeNull()
    })

    it('should logout and clear storage', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper })

        await act(async () => {
            await result.current.login({
                document: 12345,
                password: 'any',
                rememberMe: false
            })
        })
        expect(result.current.isAuthenticated).toBe(true)

        act(() => {
            result.current.logout()
        })

        expect(result.current.isAuthenticated).toBe(false)
        expect(result.current.user).toBeNull()
        expect(sessionStorage.getItem('user')).toBeNull()
        expect(localStorage.getItem('user')).toBeNull()
    })

    it('should restore session from localStorage on mount', async () => {
        const storedUser = {
            document: '999',
            role: 'MESSENGER',
            id: 999,
            isOnline: true
        }
        localStorage.setItem('user', JSON.stringify(storedUser))
        localStorage.setItem('role', storedUser.role)

        const { result } = renderHook(() => useAuth(), { wrapper })

        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.user).toEqual(storedUser)
    })
})
