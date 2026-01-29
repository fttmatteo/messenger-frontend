import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/test-utils';
import MessengerCreateServicio from '../CreateServicio';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

// Mock de componentes y hooks
vi.mock('@/components/camera', () => ({
    PlateCamera: ({ onCapture, onCancel }: { onCapture: (file: File) => void, onCancel: () => void }) => (
        <div data-testid="camera-mock">
            Camera Mock
            <button onClick={() => onCapture(new File([''], 'plate.jpg', { type: 'image/jpeg' }))}>Capture Photo</button>
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

// Mock de navigate
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
        // Mock de APIs
        server.use(
            http.get('http://localhost:8080/dealerships/allDealerships', () => {
                return HttpResponse.json([
                    { idDealership: 1, name: 'Concesionario A', zone: 'Norte' },
                    { idDealership: 2, name: 'Concesionario B', zone: 'Sur' }
                ]);
            }),
            http.post('http://localhost:8080/services/extractPlate', () => {
                return HttpResponse.json({
                    success: true,
                    plate: 'ABC123',
                    message: 'Placa detectada'
                });
            })
        );
    });

    it('should render the creation form', async () => {
        renderWithProviders(<MessengerCreateServicio />);

        expect(await screen.findByText('Foto de la placa')).toBeInTheDocument();
        expect(screen.getByText('Concesionario destino')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    });

    it('should show plate preview after capturing a photo', async () => {
        const user = userEvent.setup();
        renderWithProviders(<MessengerCreateServicio />);

        const captureBtn = await screen.findByText('Capture Photo');
        await user.click(captureBtn);

        // Debería aparecer la sección de placa detectada
        expect(await screen.findByText(/Placa Detectada/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue('ABC123')).toBeInTheDocument();
        expect(screen.getByText(/Confirma o corrige la placa detectada/i)).toBeInTheDocument();
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

        // Esperar a que carguen los datos
        await screen.findByText('Concesionario destino');

        // Cerrar cámara para habilitar el botón
        const closeCameraBtn = screen.getByText('Cancel Camera');
        await user.click(closeCameraBtn);

        const submitBtn = screen.getByRole('button', { name: /crear servicio/i });
        await user.click(submitBtn);

        await waitFor(() => {
            expect(screen.getByText(/el concesionario es obligatorio/i)).toBeInTheDocument();
        });
    });
});
