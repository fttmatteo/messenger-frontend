import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/test-utils';
import { CreateServiceDialog } from '@/features/delivery/components/CreateServiceDialog';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';
import { serviceDeliveryService } from '@/features/delivery/services/service.service';

vi.mock('@/features/delivery/services/service.service', () => ({
    serviceDeliveryService: {
        create: vi.fn(),
    }
}));

vi.mock('@/features/tracking/hooks/use-smart-location', () => ({
    useSmartLocation: () => ({
        getCurrentLocation: vi.fn().mockResolvedValue({ latitude: 10, longitude: 20 })
    })
}));

describe('CreateServiceDialog', () => {
    const mockOnOpenChange = vi.fn();
    const mockOnSuccess = vi.fn();
    beforeEach(() => {
        vi.clearAllMocks();
        server.use(
            http.get(new RegExp('.*/dealerships/allDealerships.*'), () => {
                return HttpResponse.json([
                    { idDealership: 1, name: 'Concesionario A', zone: 'Norte' },
                    { idDealership: 2, name: 'Concesionario B', zone: 'Sur' }
                ]);
            }),
            http.get(new RegExp('.*/employees/allEmployees.*'), () => {
                return HttpResponse.json([
                    { idEmployee: 1, fullName: 'Mensajero 1', role: 'MESSENGER' },
                    { idEmployee: 2, fullName: 'Admin 1', role: 'ADMIN' }
                ]);
            })
        );
    });

    it('should render the creation form for admin', async () => {
        renderWithProviders(
            <CreateServiceDialog open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
        );

        expect(await screen.findByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/Concesionario origen/i, { selector: 'label' })).toBeInTheDocument();
        expect(screen.getByText(/Concesionario destino/i, { selector: 'label' })).toBeInTheDocument();
        expect(screen.getByText(/Transportista/i, { selector: 'label' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    });

    it('should call onOpenChange(false) when cancel is clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <CreateServiceDialog open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
        );

        const cancelBtn = await screen.findByRole('button', { name: /cancelar/i });
        await user.click(cancelBtn);

        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('should not call create service if form is submitted empty', async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <CreateServiceDialog open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
        );

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

    it('should show date and time inputs when programar is toggled', async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <CreateServiceDialog open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
        );

        expect(screen.queryByLabelText(/Fecha y hora de activación/i)).not.toBeInTheDocument();

        const scheduleToggle = await screen.findByRole('switch', { name: /¿Programar servicio?/i });
        await user.click(scheduleToggle);

        expect(await screen.findByLabelText(/Fecha y hora de activación/i)).toBeInTheDocument();
    });

    it('should validate that scheduled date must be in the future', async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <CreateServiceDialog open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
        );

        await user.type(await screen.findByLabelText(/Chasis/i), 'ABC1234567');
        
        const messengerSelect = await screen.findByRole('combobox', { name: /Transportista/i });
        await waitFor(() => expect(messengerSelect).not.toBeDisabled());
        await user.click(messengerSelect);
        await user.click(await screen.findByRole('option', { name: /Mensajero 1/i }));

        const originSelect = await screen.findByRole('combobox', { name: /Concesionario origen/i });
        await user.click(originSelect);
        const originOptions = await screen.findAllByRole('option', { name: /Concesionario A/i });
        await user.click(originOptions[0]);

        const destSelect = await screen.findByRole('combobox', { name: /Concesionario destino/i });
        await user.click(destSelect);
        const destOptions = await screen.findAllByRole('option', { name: /Concesionario B/i });
        await user.click(destOptions[0]);

        const scheduleToggle = await screen.findByRole('switch', { name: /¿Programar servicio?/i });
        await user.click(scheduleToggle);

        const dateInput = await screen.findByLabelText(/Fecha y hora de activación/i);
        await user.clear(dateInput);
        await user.type(dateInput, '2000-01-01T12:00');

        const submitBtn = screen.getByRole('button', { name: /Crear servicio/i });
        await user.click(submitBtn);

        expect(serviceDeliveryService.create).not.toHaveBeenCalled();
    });

    it('should successfully schedule a service with valid future date and time', async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <CreateServiceDialog open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
        );

        await user.type(await screen.findByLabelText(/Chasis/i), 'ABC1234567');

        const messengerSelect = await screen.findByRole('combobox', { name: /Transportista/i });
        await waitFor(() => expect(messengerSelect).not.toBeDisabled());
        await user.click(messengerSelect);
        await user.click(await screen.findByRole('option', { name: /Mensajero 1/i }));

        const originSelect = await screen.findByRole('combobox', { name: /Concesionario origen/i });
        await user.click(originSelect);
        const originOptions = await screen.findAllByRole('option', { name: /Concesionario A/i });
        await user.click(originOptions[0]);

        const destSelect = await screen.findByRole('combobox', { name: /Concesionario destino/i });
        await user.click(destSelect);
        const destOptions = await screen.findAllByRole('option', { name: /Concesionario B/i });
        await user.click(destOptions[0]);

        const scheduleToggle = await screen.findByRole('switch', { name: /¿Programar servicio?/i });
        await user.click(scheduleToggle);

        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        const futureDateString = futureDate.toISOString().slice(0, 16); // format: YYYY-MM-DDThh:mm

        const dateInput = await screen.findByLabelText(/Fecha y hora de activación/i);
        await user.clear(dateInput);
        await user.type(dateInput, futureDateString);

        const submitBtn = screen.getByRole('button', { name: /Crear servicio/i });
        await user.click(submitBtn);

        await waitFor(() => {
            expect(serviceDeliveryService.create).toHaveBeenCalledWith(expect.objectContaining({
                manualPlateNumber: 'ABC1234567',
                messengerDocument: '1',
                originDealershipId: '1',
                dealershipId: '2',
                scheduledAt: expect.stringContaining(futureDate.getFullYear().toString())
            }));
            expect(mockOnSuccess).toHaveBeenCalled();
            expect(mockOnOpenChange).toHaveBeenCalledWith(false);
        });
    });

    it('should successfully create a service normally without scheduling', async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <CreateServiceDialog open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />
        );

        await user.type(await screen.findByLabelText(/Chasis/i), 'ABC1234567');

        const messengerSelect = await screen.findByRole('combobox', { name: /Transportista/i });
        await waitFor(() => expect(messengerSelect).not.toBeDisabled());
        await user.click(messengerSelect);
        await user.click(await screen.findByRole('option', { name: /Mensajero 1/i }));

        const originSelect = await screen.findByRole('combobox', { name: /Concesionario origen/i });
        await user.click(originSelect);
        const originOptions = await screen.findAllByRole('option', { name: /Concesionario A/i });
        await user.click(originOptions[0]);

        const destSelect = await screen.findByRole('combobox', { name: /Concesionario destino/i });
        await user.click(destSelect);
        const destOptions = await screen.findAllByRole('option', { name: /Concesionario B/i });
        await user.click(destOptions[0]);

        const submitBtn = screen.getByRole('button', { name: /Crear servicio/i });
        await user.click(submitBtn);

        await waitFor(() => {
            expect(serviceDeliveryService.create).toHaveBeenCalledWith(expect.objectContaining({
                manualPlateNumber: 'ABC1234567',
                messengerDocument: '1',
                originDealershipId: '1',
                dealershipId: '2',
                scheduledAt: undefined
            }));
            expect(mockOnSuccess).toHaveBeenCalled();
        });
    });
});
