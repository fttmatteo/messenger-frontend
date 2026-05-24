import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/test-utils';
import Login from './Login';
import * as authService from '@/features/auth/services/auth.service';

// Mock del servicio de autenticación
vi.mock('@/services/auth.service', () => ({
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
}));

// Mock de navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock de importación de logo
vi.mock('@/assets/logo.png', () => ({
    default: 'logo.png',
}));

import { useEffect } from 'react';

// Mock de TurnstileWidget
vi.mock('@/components/ui/turnstile-widget', () => ({
    TurnstileWidget: ({ onVerify }: { onVerify: (token: string) => void }) => {
        // Ejecutar onVerify inmediatamente para simular verificación exitosa en tests
        // Usamos useEffect para evitar warnings de actualización durante el renderizado
        useEffect(() => {
            onVerify('test-token');
        }, [onVerify]);
        return <div data-testid="turnstile-widget" />;
    },
}));

/**
 * Suite de pruebas de integración para la página de Login.
 * Verifica la validación de formularios, feedback de usuario, visualización de contraseñ y navegación tras autenticación exitosa.
 */
describe('Login Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        sessionStorage.clear();
    });

    /**
     * Verifica que el formulario de login se renderiza correctamente con todos sus elementos.
     */
    it('should render login form', async () => {
        renderWithProviders(<Login />);

        await waitFor(() => {
            expect(screen.getByText('Inicio de sesión')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Ingrese número de documento')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Ingrese contraseña')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
        });
    });

    /**
     * Valida que se muestren mensajes de error cuando los campos requeridos están vacíos al enviar.
     */
    it('should show validation errors for empty fields', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Login />);

        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('El documento es requerido')).toBeInTheDocument();
            expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument();
        });
    });

    /**
     * Valida que el campo de documento solo acepte números.
     */
    it('should validate document format (numbers only)', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Login />);

        const documentInput = screen.getByLabelText(/documento/i);
        await user.type(documentInput, 'abc123');

        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Solo se permiten números')).toBeInTheDocument();
        });
    });

    /**
     * Verifica que el botón de visibilidad de contraseña alterne entre texto y password.
     */
    it('should toggle password visibility', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Login />);

        const passwordInput = screen.getByPlaceholderText('Ingrese contraseña') as HTMLInputElement;
        expect(passwordInput.type).toBe('password');

        const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });
        await user.click(toggleButton);

        expect(passwordInput.type).toBe('text');
    });

    /**
     * Verifica el flujo exitoso de login: envío de formulario, loading y redirección.
     */
    it('should call login on successful form submission', async () => {
        const user = userEvent.setup();
        const mockLoginResponse = {
            role: 'ADMIN',
            message: 'ok',
            user: { id: 1, document: 12345678, role: 'ADMIN' },
        };

        vi.mocked(authService.authService.login).mockImplementation(() => {
            return new Promise((resolve) => {
                setTimeout(() => resolve(mockLoginResponse), 100);
            });
        });

        renderWithProviders(<Login />);

        const documentInput = screen.getByPlaceholderText('Ingrese número de documento');
        const passwordInput = screen.getByPlaceholderText('Ingrese contraseña');
        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

        await user.type(documentInput, '12345678');
        await user.type(passwordInput, 'password123');
        await user.click(submitButton);

        // Verificar si el cargador es visible - usar texto único de FullScreenLoader
        expect(screen.getByText('Por favor espera un momento')).toBeInTheDocument();

        await waitFor(() => {
            expect(authService.authService.login).toHaveBeenCalledWith({
                document: 12345678,
                password: 'password123',
                rememberMe: false,
                turnstileToken: 'test-token',
            });
            expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
        });
    });


    /**
     * Verifica que la opción 'Recordar contraseña' se envíe correctamente al servicio de autenticación.
     */
    it('should call login with rememberMe true when checkbox is checked', async () => {
        const user = userEvent.setup();
        const mockLoginResponse = {
            role: 'ADMIN',
            message: 'ok',
            user: { id: 1, document: 12345678, role: 'ADMIN' },
        };

        vi.mocked(authService.authService.login).mockImplementation(() => {
            return new Promise((resolve) => {
                setTimeout(() => resolve(mockLoginResponse), 100);
            });
        });

        renderWithProviders(<Login />);

        const documentInput = screen.getByPlaceholderText('Ingrese número de documento');
        const passwordInput = screen.getByPlaceholderText('Ingrese contraseña');

        // Buscar checkbox por texto de etiqueta en lugar de rol para evitar ambigüedad
        // La etiqueta "Recordar contraseña" está asociada con el checkbox
        const rememberMeCheckbox = screen.getByLabelText('Recordar contraseña');
        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

        await user.type(documentInput, '12345678');
        await user.type(passwordInput, 'password123');
        await user.click(rememberMeCheckbox);
        await user.click(submitButton);

        await waitFor(() => {
            expect(authService.authService.login).toHaveBeenCalledWith({
                document: 12345678,
                password: 'password123',
                rememberMe: true,
                turnstileToken: 'test-token',
            });
            expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
        });
    });
});
