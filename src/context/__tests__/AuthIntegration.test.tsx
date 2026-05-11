import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import { Preferences } from '@capacitor/preferences'
import { http, HttpResponse } from 'msw'
import { server } from '../../test/mocks/server'

// Componente de prueba para consumir el contexto
const AuthConsumer = () => {
    const { user, isAuthenticated, isLoading } = useAuth()
    
    if (isLoading) return <div data-testid="loading">Cargando...</div>
    if (!isAuthenticated) return <div data-testid="unauthenticated">No autenticado</div>
    
    return (
        <div data-testid="authenticated">
            <span data-testid="user-name">{user?.name}</span>
            <span data-testid="user-role">{user?.role}</span>
        </div>
    )
}

describe('AuthIntegration (MSW)', () => {
    beforeEach(async () => {
        vi.clearAllMocks()
        localStorage.clear()
        sessionStorage.clear()
        await Preferences.clear()
    })

    afterEach(async () => {
        localStorage.clear()
        sessionStorage.clear()
        await Preferences.clear()
    })

    it('should restore session from Preferences on mount', async () => {
        const storedUser = {
            document: 999,
            role: 'MESSENGER',
            id: 999,
            name: 'Test Messenger',
            isOnline: true
        }
        
        await Preferences.set({ key: 'user', value: JSON.stringify(storedUser) })
        await Preferences.set({ key: 'role', value: storedUser.role })

        render(
            <AuthProvider>
                <AuthConsumer />
            </AuthProvider>
        )

        // Debería mostrar cargando inicialmente
        expect(screen.getByTestId('loading')).toBeInTheDocument()

        // Esperar a que se restaure la sesión
        await waitFor(() => {
            expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
        }, { timeout: 4000 })

        expect(screen.getByTestId('authenticated')).toBeInTheDocument()
        expect(screen.getByTestId('user-role')).toHaveTextContent('MESSENGER')
        expect(screen.getByTestId('user-name')).toHaveTextContent('Test Messenger')
    })

    it('should handle login successfully with real MSW interaction', async () => {
        // MSW ya tiene handlers por defecto en src/test/mocks/handlers.ts
        // Pero podemos sobreescribirlos si es necesario
        
        const LoginAction = () => {
            const { login } = useAuth()
            return <button onClick={() => login({ document: 12345, password: 'correct-password', rememberMe: true, turnstileToken: 'tok' })}>Login</button>
        }

        render(
            <AuthProvider>
                <AuthConsumer />
                <LoginAction />
            </AuthProvider>
        )

        await waitFor(() => expect(screen.queryByTestId('loading')).not.toBeInTheDocument())
        
        const loginBtn = screen.getByText('Login')
        loginBtn.click()

        await waitFor(() => {
            expect(screen.getByTestId('authenticated')).toBeInTheDocument()
        }, { timeout: 4000 })

        expect(screen.getByTestId('user-role')).toHaveTextContent('ADMIN')
    })

    it('should clear storage on logout', async () => {
        server.use(
            http.post('*/auth/logout', () => new HttpResponse(null, { status: 200 }))
        )

        const LogoutAction = () => {
            const { logout } = useAuth()
            return <button onClick={logout}>Logout</button>
        }

        render(
            <AuthProvider>
                <AuthConsumer />
                <LogoutAction />
            </AuthProvider>
        )

        // Simular que ya hay sesión (via inyección previa)
        const storedUser = { document: 1, role: 'ADMIN', id: 1, name: 'Admin' }
        await Preferences.set({ key: 'user', value: JSON.stringify(storedUser) })
        await Preferences.set({ key: 'role', value: 'ADMIN' })

        // Recargar el componente para que tome el estado inyectado
        // (En un test real renderizamos después de inyectar)
        
        await waitFor(() => expect(screen.queryByTestId('loading')).not.toBeInTheDocument())
        
        // Ejecutar logout
        const logoutBtn = screen.getByText('Logout')
        logoutBtn.click()

        await waitFor(() => {
            expect(screen.getByTestId('unauthenticated')).toBeInTheDocument()
        })

        const { value: user } = await Preferences.get({ key: 'user' })
        expect(user).toBeNull()
    })
})
