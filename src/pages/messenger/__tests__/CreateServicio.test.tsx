import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/test-utils';
import MessengerCreateServicio from '../CreateServicio';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

// Mock components and hooks
vi.mock('@/components/camera', () => ({
    PlateCamera: ({ onCancel }: { onCancel: () => void }) => (
        <div data-testid="camera-mock">
            Camera Mock
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

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('CreateServicio Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock dealerships API
        server.use(
            http.get('http://localhost:8080/dealerships', () => {
                return HttpResponse.json([
                    { idDealership: 1, name: 'Concesionario A', zone: 'Norte' },
                    { idDealership: 2, name: 'Concesionario B', zone: 'Sur' }
                ]);
            })
        );
    });

    it('should render the creation form', async () => {
        renderWithProviders(<MessengerCreateServicio />);

        expect(await screen.findByText('Foto de la placa')).toBeInTheDocument();
        expect(screen.getByText('Concesionario destino')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
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

        // Wait for data to load
        await screen.findByText('Concesionario destino');

        // Close camera to enable button
        const closeCameraBtn = screen.getByText('Cancel Camera');
        await user.click(closeCameraBtn);

        const submitBtn = screen.getByRole('button', { name: /crear servicio/i });
        await user.click(submitBtn);

        await waitFor(() => {
            expect(screen.getByText('El concesionario es obligatorio')).toBeInTheDocument();
        });
    });
});
