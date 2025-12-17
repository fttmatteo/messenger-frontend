/**
 * Tests para LoginPage
 * 
 * Verifica el comportamiento del formulario de login:
 * - Renderizado correcto de campos
 * - Manejo de submit
 * - Estados de loading y error
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginPage } from '@/pages/LoginPage'
import { AuthProvider } from '@/context/AuthContext'
import { BrowserRouter } from 'react-router-dom'

// Mock del contexto de autenticación
const mockLogin = vi.fn()

vi.mock('@/context/AuthContext', async () => {
    const actual = await vi.importActual('@/context/AuthContext')
    return {
        ...actual,
        useAuth: () => ({
            login: mockLogin,
            isLoading: false,
            error: null,
            clearError: vi.fn(),
            isAuthenticated: false,
            user: null,
        }),
    }
})

/**
 * Wrapper con providers necesarios
 */
function renderWithProviders() {
    return render(
        <BrowserRouter>
            <AuthProvider>
                <LoginPage />
            </AuthProvider>
        </BrowserRouter>
    )
}

describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renderiza el formulario de login correctamente', () => {
        renderWithProviders()

        expect(screen.getByText('E-PLACA')).toBeInTheDocument()
        expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
    })

    it('permite escribir en los campos de input', () => {
        renderWithProviders()

        const usernameInput = screen.getByLabelText(/usuario/i)
        const passwordInput = screen.getByLabelText(/contraseña/i)

        fireEvent.change(usernameInput, { target: { value: 'admin' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })

        expect(usernameInput).toHaveValue('admin')
        expect(passwordInput).toHaveValue('password123')
    })

    it('llama a login cuando se envía el formulario', async () => {
        renderWithProviders()

        const usernameInput = screen.getByLabelText(/usuario/i)
        const passwordInput = screen.getByLabelText(/contraseña/i)
        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })

        fireEvent.change(usernameInput, { target: { value: 'admin' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith({
                userName: 'admin',
                password: 'password123',
            })
        })
    })
})
