import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/test-utils';
import { BottomNav } from '../BottomNav';

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('BottomNav Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render all navigation items', () => {
        renderWithProviders(<BottomNav />, { initialRoute: '/messenger' });

        expect(screen.getByText('Asignados')).toBeInTheDocument();
        expect(screen.getByText('Historial')).toBeInTheDocument();
        expect(screen.getByText('Config')).toBeInTheDocument();
        expect(screen.getByTitle('Crear')).toBeInTheDocument();
    });

    it('should highlight the active item', () => {
        renderWithProviders(<BottomNav />, { initialRoute: '/messenger/servicios' });

        const historialBtn = screen.getByRole('button', { name: /historial/i });
        expect(historialBtn).toHaveAttribute('aria-current', 'page');
        expect(historialBtn).toHaveClass('text-primary');

        const configBtn = screen.getByRole('button', { name: /config/i });
        expect(configBtn).not.toHaveAttribute('aria-current');
    });

    it('should navigate with replace when an item is clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(<BottomNav />, { initialRoute: '/messenger' });

        const configBtn = screen.getByRole('button', { name: /config/i });
        await user.click(configBtn);

        expect(mockNavigate).toHaveBeenCalledWith('/messenger/configuracion', { replace: true });
    });

    it('should navigate to create service when action button is clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(<BottomNav />, { initialRoute: '/messenger' });

        const createBtn = screen.getByTitle('Crear');
        await user.click(createBtn);

        expect(mockNavigate).toHaveBeenCalledWith('/messenger/crear', { replace: true });
    });
});
