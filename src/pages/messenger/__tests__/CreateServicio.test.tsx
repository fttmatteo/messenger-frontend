import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/test-utils';
import MessengerCreateServicio from '../CreateServicio';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

vi.mock('@/services/service.service', () => ({
    serviceDeliveryService: {
        extractPlate: vi.fn(),
        create: vi.fn(),
    }
}));

import { serviceDeliveryService } from '@/services/service.service';

vi.mock('@/components/camera', () => ({
    PlateCamera: ({ onCapture, onCancel }: { onCapture: (file: File, url: string) => void, onCancel: () => void }) => (
        <div data-testid="camera-mock">
            Camera Mock
            <button onClick={() => onCapture(new File([''], 'plate.jpg', { type: 'image/jpeg' }), 'blob:http://localhost:5173/test-url')}>Capture Photo</button>
            <button onClick={onCancel}>Cancel Camera</button>
        </div>
    ),
    ImageUploadFallback: () => <div data-testid="upload-mock">Upload Mock</div>
}));

vi.mock('@/hooks/use-smart-location', () => ({
    useSmartLocation: () => ({
        getCurrentLocation: vi.fn().mockResolvedValue({ latitude: 10, longitude: 20 })
    })
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

/**
 * Suite de pruebas de integración para la página de creación de servicios (perfil mensajero).
 * Evalúa el renderizado del formulario, la interacción con la cámara (mock) y la validación
 * de campos obligatorios como el concesionario.
 */
describe('CreateServicio Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        server.use(
            http.get('http://localhost:8080/dealerships/allDealerships', () => {
                return HttpResponse.json([
                    { idDealership: 1, name: 'Concesionario A', zone: 'Norte' },
                    { idDealership: 2, name: 'Concesionario B', zone: 'Sur' }
                ]);
            })
        );
        (serviceDeliveryService.extractPlate as Mock).mockResolvedValue({
            success: true,
            plate: 'ABC1234567890',
            message: 'Chasis detectado'
        });
    });

    it('should render the creation form', async () => {
        renderWithProviders(<MessengerCreateServicio />);

        expect(await screen.findByText('Foto del chasis')).toBeInTheDocument();
        expect(screen.getByText('Concesionario destino')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    });

    it('should show chasis preview after capturing a photo', async () => {
        const user = userEvent.setup();
        renderWithProviders(<MessengerCreateServicio />);

        const captureBtn = await screen.findByText('Capture Photo');
        await user.click(captureBtn);

        expect(await screen.findByText(/Chasis detectado/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue('ABC1234567890')).toBeInTheDocument();
        expect(screen.getByText(/Confirma o edita el chasis/i)).toBeInTheDocument();
    });

    it('should navigate back to /messenger when cancel is clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(<MessengerCreateServicio />);

        const cancelBtn = await screen.findByRole('button', { name: /cancelar/i });
        await user.click(cancelBtn);

        expect(mockNavigate).toHaveBeenCalledWith('/messenger', { replace: true });
    });

    it('should show validation error if form is submitted empty', async () => {
        const user = userEvent.setup();
        renderWithProviders(<MessengerCreateServicio />);

        await screen.findByText('Concesionario destino');

        const closeCameraBtn = screen.getByText('Cancel Camera');
        await user.click(closeCameraBtn);

        const submitBtn = screen.getByRole('button', { name: /crear servicio/i });
        await user.click(submitBtn);

        await waitFor(() => {
            expect(screen.getByText(/el concesionario es obligatorio/i)).toBeInTheDocument();
        });
    });
});
