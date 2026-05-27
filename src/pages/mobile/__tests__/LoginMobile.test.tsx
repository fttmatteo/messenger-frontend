import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LoginMobile from '../LoginMobile'
import { useAuth } from '@/features/auth/context/AuthContext'
import { showToast } from '@/shared/config/toast-config'
import { openSupportEmail } from '@/shared/lib/app-config'

// Mock dependencies
vi.mock('@/features/auth/context/AuthContext', () => ({
    useAuth: vi.fn(),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

vi.mock('@/shared/config/toast-config', () => ({
    showToast: {
        error: vi.fn(),
        success: vi.fn(),
        dismiss: vi.fn()
    }
}))

vi.mock('@/shared/lib/app-config', () => ({
    APP_CONFIG: { version: '1.7.3' },
    openSupportEmail: vi.fn()
}))

vi.mock('@/shared/hooks/useNavigationGuard', () => ({
    navigateAfterLogin: vi.fn(),
    useNavigationGuard: () => ({
        handleBackNavigation: vi.fn(),
        getParentRoute: vi.fn(),
        isRootRoute: vi.fn(),
        currentPath: '/'
    })
}))

vi.mock('next-themes', () => ({
    useTheme: () => ({
        theme: 'light',
        setTheme: vi.fn()
    })
}))

vi.mock('@/shared/hooks/use-turnstile-reset', () => ({
    useTurnstileReset: () => vi.fn()
}))

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => vi.fn()
    }
})

// Mock Turnstile
vi.mock('@/shared/components/ui/turnstile-widget', () => ({
    TurnstileWidget: ({ onVerify }: { onVerify: (t: string) => void }) => {
        return <button onClick={() => onVerify('fake-token')}>Verify Turnstile</button>
    }
}))

// Mock AnimatedLogoBackground
vi.mock('@/shared/components/ui/AnimatedLogoBackground', () => ({
    default: () => <div data-testid="animated-background" />
}))

// Mock Lucide icons
vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal<typeof import('lucide-react')>()
    return {
        ...actual,
        Package: () => <div data-testid="package-icon" />,
        HelpCircle: () => <div data-testid="help-icon" />,
        Loader2: () => <div data-testid="loader" />
    }
})

describe('LoginMobile Page', () => {
    const mockLogin = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        localStorage.clear()
        sessionStorage.clear()
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        mockLogin.mockResolvedValue(undefined)
        vi.mocked(useAuth).mockReturnValue({
            login: mockLogin,
            isAuthenticated: false,
            loading: false,
            user: null,
            logout: vi.fn(),
            checkAuth: vi.fn(),
            refresh: vi.fn()
        } as unknown as ReturnType<typeof useAuth>)
    })

    afterEach(() => {
        cleanup()
    })

    const renderLogin = () => {
        return render(
            <MemoryRouter>
                <LoginMobile />
            </MemoryRouter>
        )
    }

    const waitForLoadingToFinish = async () => {
        await waitFor(() => {
            expect(screen.queryByText(/iniciando sesión/i)).not.toBeInTheDocument()
        }, { timeout: 2000 })
    }

    it('should show validation errors for empty fields', async () => {
        renderLogin()
        fireEvent.click(await screen.findByText(/verify turnstile/i))
        const submitBtn = await screen.findByRole('button', { name: /iniciar sesión/i })
        fireEvent.click(submitBtn)
        expect(await screen.findByText(/el documento es requerido/i)).toBeInTheDocument()
        await waitForLoadingToFinish()
    })

    it('should handle generic login error', async () => {
        mockLogin.mockRejectedValue(new Error('Invalid credentials'))
        renderLogin()
        fireEvent.change(await screen.findByLabelText(/documento/i), { target: { value: '12345678' } })
        fireEvent.change(screen.getByPlaceholderText(/ingrese contraseña/i), { target: { value: 'password123' } })
        fireEvent.click(screen.getByText(/verify turnstile/i))
        fireEvent.click(screen.getByLabelText(/he leído y acepto/i))
        const submitBtn = await screen.findByRole('button', { name: /iniciar sesión/i })
        await waitFor(() => expect(submitBtn).not.toBeDisabled())
        fireEvent.click(submitBtn)
        await waitFor(() => {
            expect(showToast.error).toHaveBeenCalledWith('Invalid credentials', expect.anything())
        })
        await waitForLoadingToFinish()
    })

    it('should handle rate limiting error (429)', async () => {
        const setIntervalSpy = vi.spyOn(globalThis, 'setInterval')
        mockLogin.mockRejectedValue({ statusCode: 429 })
        renderLogin()

        fireEvent.change(await screen.findByLabelText(/documento/i), { target: { value: '12345678' } })
        fireEvent.change(screen.getByPlaceholderText(/ingrese contraseña/i), { target: { value: 'password' } })
        fireEvent.click(screen.getByText(/verify turnstile/i))
        fireEvent.click(screen.getByLabelText(/he leído y acepto/i))
        const submitBtn = await screen.findByRole('button', { name: /iniciar sesión/i })
        await waitFor(() => expect(submitBtn).not.toBeDisabled())
        fireEvent.click(submitBtn)

        await waitFor(() => {
            expect(showToast.error).toHaveBeenCalledWith(
                expect.stringContaining('15 minutos'),
                expect.anything()
            )
        })

        expect(setIntervalSpy).toHaveBeenCalled()
        setIntervalSpy.mockRestore()
        await waitForLoadingToFinish()
    })

    it('should handle logo load and error', async () => {
        renderLogin()
        const logo = await screen.findByAltText(/plak logo/i)
        fireEvent.error(logo)
        expect(screen.getByTestId('package-icon')).toBeInTheDocument()
        fireEvent.load(logo)
    })

    it('should handle support and version', async () => {
        renderLogin()
        expect(await screen.findByText(/1.7.3/i)).toBeInTheDocument()
        fireEvent.click(screen.getByLabelText(/ayuda/i))
        expect(openSupportEmail).toHaveBeenCalled()
    })

    it('should toggle password visibility and handle checkbox', async () => {
        renderLogin()
        const passInput = await screen.findByPlaceholderText(/ingrese contraseña/i)
        fireEvent.click(screen.getByRole('button', { name: /toggle password visibility/i }))
        expect(passInput).toHaveAttribute('type', 'text')
        fireEvent.click(screen.getByLabelText(/recordar contraseña/i))
    })
})
