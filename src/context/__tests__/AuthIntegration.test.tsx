import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import type { ReactNode } from 'react'

const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
)

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

        // 1. Initial state
        expect(result.current.isAuthenticated).toBe(false)
        expect(result.current.user).toBeNull()

        // 2. Perform Login
        await act(async () => {
            await result.current.login({
                document: 12345,
                password: 'correct-password',
                rememberMe: true
            })
        })

        // 3. Verify state after login
        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.user).toMatchObject({
            document: 12345,
            role: 'ADMIN',
            id: 123
        })

        // 4. Verify persistence
        expect(localStorage.getItem('token')).toBeDefined()
        expect(localStorage.getItem('user')).toContain('"id":123')
    })

    it('should logout and clear storage', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper })

        // Pre-fill login state
        await act(async () => {
            await result.current.login({
                document: 12345,
                password: 'any',
                rememberMe: false
            })
        })
        expect(result.current.isAuthenticated).toBe(true)

        // Logout
        act(() => {
            result.current.logout()
        })

        expect(result.current.isAuthenticated).toBe(false)
        expect(result.current.user).toBeNull()
        expect(sessionStorage.getItem('token')).toBeNull()
    })

    it('should restore session from localStorage on mount', async () => {
        const storedUser = {
            document: '999',
            role: 'MESSENGER',
            id: 999,
            isOnline: true
        }
        localStorage.setItem('user', JSON.stringify(storedUser))
        localStorage.setItem('token', 'valid-token')

        const { result } = renderHook(() => useAuth(), { wrapper })

        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.user).toEqual(storedUser)
    })
})
