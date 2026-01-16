import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'
import { authService } from '@/services/auth.service'
import type { ReactNode } from 'react'

vi.mock('../services/auth.service', () => ({
    authService: {
        login: vi.fn(),
        logout: vi.fn(),
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
    })

    afterEach(() => {
        localStorage.clear()
        sessionStorage.clear()
    })

    describe('useAuth hook', () => {
        it('should throw error when used outside AuthProvider', () => {
            expect(() => {
                renderHook(() => useAuth())
            }).toThrow('useAuth must be used within an AuthProvider')
        })

        it('should return initial unauthenticated state', async () => {
            const { result } = renderHook(() => useAuth(), { wrapper })

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.user).toBeNull()
            expect(result.current.isAuthenticated).toBe(false)
        })

        it('should restore user from localStorage on mount', async () => {
            const storedUser = {
                document: '12345',
                role: 'ADMIN',
                id: 1,
                isOnline: false
            }
            localStorage.setItem('user', JSON.stringify(storedUser))
            localStorage.setItem('role', 'ADMIN')

            const { result } = renderHook(() => useAuth(), { wrapper })

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.user).toEqual(storedUser)
            expect(result.current.isAuthenticated).toBe(true)
        })

        it('should restore user from sessionStorage on mount', async () => {
            const storedUser = {
                document: '12345',
                role: 'MESSENGER',
                id: 2,
                isOnline: true
            }
            sessionStorage.setItem('user', JSON.stringify(storedUser))
            sessionStorage.setItem('role', 'MESSENGER')

            const { result } = renderHook(() => useAuth(), { wrapper })

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.user).toEqual(storedUser)
            expect(result.current.isAuthenticated).toBe(true)
        })
    })

    describe('login', () => {
        it('should login with rememberMe and store in localStorage', async () => {
            vi.mocked(authService.login).mockResolvedValue({
                role: 'ADMIN',
                message: 'ok',
                user: { id: 123, document: 12345, role: 'ADMIN' }
            })

            const { result } = renderHook(() => useAuth(), { wrapper })

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            await act(async () => {
                await result.current.login({
                    document: 12345,
                    password: 'password',
                    rememberMe: true,
                })
            })

            expect(authService.login).toHaveBeenCalledWith({
                document: 12345,
                password: 'password',
                rememberMe: true,
            })
            expect(localStorage.getItem('role')).toBe('ADMIN')
            expect(localStorage.getItem('user')).toContain('"id":123')
            expect(result.current.isAuthenticated).toBe(true)
            expect(result.current.user?.role).toBe('ADMIN')
        })

        it('should login without rememberMe and store in sessionStorage', async () => {
            localStorage.clear()
            sessionStorage.clear()

            vi.mocked(authService.login).mockResolvedValue({
                role: 'MESSENGER',
                message: 'ok',
                user: { id: 456, document: 67890, role: 'MESSENGER' }
            })

            const { result } = renderHook(() => useAuth(), { wrapper })

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            await act(async () => {
                await result.current.login({
                    document: 67890,
                    password: 'password',
                    rememberMe: false,
                })
            })

            expect(sessionStorage.getItem('role')).toBe('MESSENGER')
            expect(sessionStorage.getItem('user')).toContain('"id":456')
            expect(result.current.user?.role).toBe('MESSENGER')
            expect(result.current.user?.isOnline).toBe(true)
        })
    })

    describe('logout', () => {
        it('should clear user and call authService.logout', async () => {
            const storedUser = {
                document: '12345',
                role: 'ADMIN',
                id: 1,
                isOnline: false
            }
            localStorage.setItem('user', JSON.stringify(storedUser))
            localStorage.setItem('role', 'ADMIN')

            const { result } = renderHook(() => useAuth(), { wrapper })

            await waitFor(() => {
                expect(result.current.isAuthenticated).toBe(true)
            })

            act(() => {
                result.current.logout()
            })

            expect(authService.logout).toHaveBeenCalled()
            expect(result.current.user).toBeNull()
            expect(result.current.isAuthenticated).toBe(false)
        })
    })

    describe('updateUser', () => {
        it('should update user partially', async () => {
            const storedUser = {
                document: '12345',
                role: 'MESSENGER',
                id: 1,
                isOnline: false
            }
            localStorage.setItem('user', JSON.stringify(storedUser))
            localStorage.setItem('role', 'MESSENGER')

            const { result } = renderHook(() => useAuth(), { wrapper })

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            act(() => {
                result.current.updateUser({ isOnline: true })
            })

            expect(result.current.user?.isOnline).toBe(true)
            expect(result.current.user?.document).toBe('12345')
            const updatedStored = JSON.parse(localStorage.getItem('user') || '{}')
            expect(updatedStored.isOnline).toBe(true)
        })

        it('should do nothing when no user is logged in', async () => {
            const { result } = renderHook(() => useAuth(), { wrapper })

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            act(() => {
                result.current.updateUser({ isOnline: true })
            })

            expect(result.current.user).toBeNull()
        })
    })
})
