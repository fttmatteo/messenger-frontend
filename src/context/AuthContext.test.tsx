import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'
import { authService } from '@/services/auth.service'
import type { ReactNode } from 'react'

vi.mock('../services/auth.service', () => ({
    authService: {
        login: vi.fn(),
        logout: vi.fn(),
        getCurrentUserAsync: vi.fn().mockImplementation(async () => {
            const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        }),
        getRoleAsync: vi.fn().mockImplementation(async () => {
            return localStorage.getItem('role') || sessionStorage.getItem('role');
        }),
        getTokenAsync: vi.fn().mockImplementation(async () => {
            return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        }),
    },
}))

const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
)

/**
 * Suite de pruebas unitarias para el contexto de autenticación (AuthContext).
 * Evalúa los estados de sesión (login, logout, persistencia) y la correcta
 * interacción con el almacenamiento local (localStorage/sessionStorage).
 */
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

    describe('hook useAuth', () => {
        it('debe lanzar un error cuando se usa fuera de AuthProvider', () => {
            expect(() => {
                renderHook(() => useAuth())
            }).toThrow('useAuth debe ser usado dentro de un AuthProvider')
        })

        it('debe devolver el estado inicial no autenticado', async () => {
            const { result } = renderHook(() => useAuth(), { wrapper })

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(result.current.user).toBeNull()
            expect(result.current.isAuthenticated).toBe(false)
        })

        it('debe restaurar al usuario desde localStorage al montar', async () => {
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

        it('debe restaurar al usuario desde sessionStorage al montar', async () => {
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
        it('debe iniciar sesión con rememberMe y guardar en localStorage', async () => {
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
                    turnstileToken: 'test-token',
                })
            })

            expect(authService.login).toHaveBeenCalledWith({
                document: 12345,
                password: 'password',
                rememberMe: true,
                turnstileToken: 'test-token',
            })
            expect(localStorage.getItem('role')).toBe('ADMIN')
            expect(localStorage.getItem('user')).toContain('"id":123')
            expect(result.current.isAuthenticated).toBe(true)
            expect(result.current.user?.role).toBe('ADMIN')
        })

        it('debe iniciar sesión sin rememberMe y guardar en sessionStorage', async () => {
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
                    turnstileToken: 'test-token',
                })
            })

            expect(sessionStorage.getItem('role')).toBe('MESSENGER')
            expect(sessionStorage.getItem('user')).toContain('"id":456')
            expect(result.current.user?.role).toBe('MESSENGER')
            expect(result.current.user?.isOnline).toBe(true)
        })
    })

    describe('logout', () => {
        it('debe limpiar al usuario y llamar a authService.logout', async () => {
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
        it('debe actualizar al usuario parcialmente', async () => {
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

        it('no debe hacer nada cuando no hay un usuario autenticado', async () => {
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
