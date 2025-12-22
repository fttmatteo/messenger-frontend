import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/test-utils';
import Login from './Login';
import * as authService from '@/services/auth.service';

// Mock the auth service
vi.mock('@/services/auth.service', () => ({
    authService: {
        login: vi.fn(),
        logout: vi.fn(),
    },
}));

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock logo import
vi.mock('@/assets/logo.png', () => ({
    default: 'logo.png',
}));

describe('Login Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        sessionStorage.clear();
    });

    it('should render login form', () => {
        renderWithProviders(<Login />);

        expect(screen.getByText('Inicio de sesión')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Ingrese su número de documento')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Ingrese su contraseña')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
    });

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

    it('should toggle password visibility', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Login />);

        const passwordInput = screen.getByPlaceholderText('Ingrese su contraseña') as HTMLInputElement;
        expect(passwordInput.type).toBe('password');

        const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });
        await user.click(toggleButton);

        expect(passwordInput.type).toBe('text');
    });

    it('should call login on successful form submission', async () => {
        const user = userEvent.setup();
        const mockLoginResponse = {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZG9jdW1lbnQiOiIxMjM0NTY3OCIsInJvbGUiOiJBRE1JTiJ9.test',
            refreshToken: 'refresh-token',
            role: 'ADMIN',
        };

        vi.mocked(authService.authService.login).mockResolvedValue(mockLoginResponse);

        renderWithProviders(<Login />);

        const documentInput = screen.getByPlaceholderText('Ingrese su número de documento');
        const passwordInput = screen.getByPlaceholderText('Ingrese su contraseña');
        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

        await user.type(documentInput, '12345678');
        await user.type(passwordInput, 'password123');
        await user.click(submitButton);

        await waitFor(() => {
            expect(authService.authService.login).toHaveBeenCalledWith({
                document: 12345678,
                password: 'password123',
                rememberMe: undefined,
            });
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });
});
