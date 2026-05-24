import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/test-utils';
import AdminCreateServicio from '../CreateService';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';
import { serviceDeliveryService } from '@/features/delivery/services/service.service';

vi.mock('@/features/delivery/services/service.service', () => ({
    serviceDeliveryService: {
        create: vi.fn(),
    }
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('AdminCreateServicio Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        server.use(
            http.get('http://localhost:8080/dealerships/allDealerships', () => {
                return HttpResponse.json([
                    { idDealership: 1, name: 'Concesionario A', zone: 'Norte' },
                    { idDealership: 2, name: 'Concesionario B', zone: 'Sur' }
                ]);
            }),
            http.get('http://localhost:8080/employees/allEmployees', () => {
                return HttpResponse.json([
                    { idEmployee: 1, fullName: 'Mensajero 1', role: 'MESSENGER' },
                    { idEmployee: 2, fullName: 'Admin 1', role: 'ADMIN' }
                ]);
            })
        );
    });

    it('should render the creation form for admin', async () => {
        renderWithProviders(<AdminCreateServicio />);

        expect(await screen.findByText(/Información del servicio/i)).toBeInTheDocument();
        expect(screen.getByText(/Concesionario origen/i, { selector: 'label' })).toBeInTheDocument();
        expect(screen.getByText(/Concesionario destino/i, { selector: 'label' })).toBeInTheDocument();
        expect(screen.getByText(/Transportista/i, { selector: 'label' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    });

    it('should navigate back to /admin/servicios when cancel is clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(<AdminCreateServicio />);

        const cancelBtn = await screen.findByRole('button', { name: /cancelar/i });
        await user.click(cancelBtn);

        expect(mockNavigate).toHaveBeenCalledWith('/admin/servicios');
    });

    it('should not call create service if form is submitted empty', async () => {
        const user = userEvent.setup();
        renderWithProviders(<AdminCreateServicio />);

        await screen.findByText(/Concesionario origen/i, { selector: 'label' });
        await waitFor(() => {
            expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0);
        });

        const submitBtn = screen.getByRole('button', { name: /crear servicio/i });
        await user.click(submitBtn);

        await waitFor(() => {
            expect(serviceDeliveryService.create).not.toHaveBeenCalled();
        });
    });
});
