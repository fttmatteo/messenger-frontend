import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import UpdateStatus from '../UpdateStatus'
import { StatusColorProvider } from '@/context/StatusColorContext'
import { AuthProvider } from '@/context/AuthContext'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { serviceDeliveryService } from '@/services/service.service'
import { useNetwork } from '@/hooks/use-network'
import { offlineSyncService } from '@/services/offline-sync.service'


// Mock de useSmartLocation para evitar avisos de GPS real en los tests
vi.mock('@/hooks/use-smart-location', () => ({
    useSmartLocation: () => ({
        getCurrentLocation: vi.fn().mockResolvedValue({ latitude: 10, longitude: 20 })
    })
}))

vi.mock('@/hooks/use-network', () => ({
    useNetwork: vi.fn().mockReturnValue({
        isOnline: true,
        wasOffline: false,
        pendingActionsCount: 0,
        offlineReady: false,
        needRefresh: false,
        updateServiceWorker: vi.fn(),
        dismissUpdate: vi.fn()
    })
}))

vi.mock('@/services/offline-sync.service', () => ({
    offlineSyncService: {
        registerHandler: vi.fn(),
        queueAction: vi.fn(),
        getPendingActions: vi.fn().mockResolvedValue([]),
        setupBackgroundSyncListener: vi.fn(),
    }
}))

vi.mock('@/components/messenger/SignatureCanvas', async () => {
    const { forwardRef, useImperativeHandle } = await import('react')

    const MockSignatureCanvas = forwardRef((props: { onSignatureChange: (v: boolean) => void }, ref: React.ForwardedRef<unknown>) => {
        useImperativeHandle(ref, () => ({
            getSignature: async () => new File(['signature'], 'signature.png', { type: 'image/png' }),
            clear: () => {
                props.onSignatureChange(false)
            },
            hasSignature: () => true,
            isReady: () => true
        }));

        return (
            <div data-testid="mock-signature-canvas" className="mock-signature-canvas">
                <p>Signature Canvas Mock</p>
                <button
                    type="button"
                    onClick={() => props.onSignatureChange(true)}
                >
                    Simular Firma
                </button>
            </div>
        )
    })

    return { SignatureCanvas: MockSignatureCanvas }
})

vi.mock('@/components/messenger/EvidenceCapture', () => ({
    EvidenceCapture: (props: { onPhotosChange: (files: File[]) => void }) => (
        <div data-testid="mock-evidence-capture">
            <button type="button" onClick={() => props.onPhotosChange([new File([], 'photo.jpg')])}>
                Simular Foto
            </button>
        </div>
    )
}))

/**
 * Suite de pruebas de integración para el componente UpdateStatus.
 * Verifica el flujo crítico de actualización de estado de entrega, incluyendo la validación
 * de requisitos complejos como firmas digitales y captura de evidencia fotográfica.
 */
describe('UpdateStatus Page Integration', () => {
    vi.setConfig({ testTimeout: 15000 });
    beforeEach(() => {
        localStorage.setItem('role', 'MESSENGER') // Requerido por algunos hooks o servicios
        // Manejar explícitamente el id 123 para esta suite de tests
        server.use(
            http.get('http://localhost:8080/services/findByServiceId/123', () => {
                return HttpResponse.json({
                    idServiceDelivery: 123,
                    uuid: '550e8400-e29b-41d4-a716-446655440000',
                    currentStatus: 'PENDING',
                    plate: { idPlate: 1, plateNumber: 'ABC-123', plateType: 'CAR' },
                    dealership: {
                        idDealership: 10,
                        uuid: 'd39cfc1b-08fb-44b4-af04-cc9172be53f9',
                        name: 'Test Dealership',
                        address: '123 Main St',
                        phone: '555-0000',
                        zone: 'Z1'
                    },
                    originDealership: {
                        idDealership: 11,
                        uuid: 'e49cfc1b-08fb-44b4-af04-cc9172be53fa',
                        name: 'Origin Dealership',
                        address: '456 Origin St',
                        phone: '555-1111',
                        zone: 'Z2'
                    },
                    history: [],
                    photos: [],
                    createdAt: new Date().toISOString()
                });
            })
        )
    })

    const renderWithRouter = (id: string) => {
        return render(
            <MemoryRouter initialEntries={[`/messenger/update-status/${id}`]}>
                <AuthProvider>
                    <StatusColorProvider>
                        <Routes>
                            <Route path="/messenger/update-status/:id" element={<UpdateStatus />} />
                            <Route path="/messenger" element={<div>Messenger Home</div>} />
                        </Routes>
                    </StatusColorProvider>
                </AuthProvider>
            </MemoryRouter>
        )
    }

    it('should submit successfully when online', async () => {
        const updateSpy = vi.spyOn(serviceDeliveryService, 'updateStatus').mockResolvedValue({} as unknown as import('@/types/service.types').ServiceDelivery)

        renderWithRouter('123')
        await screen.findByText(/ABC/i)

        // Select Entregado (Default in some tests, let's be explicit)
        await userEvent.click(screen.getByText('Entregado'))
        await userEvent.click(screen.getByText('Simular Firma'))
        const confirmBtn = screen.getByRole('button', { name: /confirmar entregado/i })
        await userEvent.click(confirmBtn)

        // Modal confirm highlight
        const finalConfirm = screen.getByRole('button', { name: 'Confirmar' })
        await userEvent.click(finalConfirm)

        await waitFor(() => {
            expect(updateSpy).toHaveBeenCalledWith('123', expect.objectContaining({
                status: 'DELIVERED',
                signature: expect.any(File)
            }))
        })
    })

    it('should queue action when offline', async () => {
        vi.mocked(useNetwork).mockReturnValue({
            isOnline: false,
            wasOffline: false,
            pendingActionsCount: 0,
            offlineReady: false,
            needRefresh: false,
            updateServiceWorker: vi.fn(),
            dismissUpdate: vi.fn()
        })
        const queueSpy = vi.mocked(offlineSyncService.queueAction)

        renderWithRouter('123')
        await screen.findByText(/ABC/i)

        await userEvent.click(screen.getByText('Entregado'))
        await userEvent.click(screen.getByText('Simular Firma'))

        await userEvent.click(screen.getByRole('button', { name: /confirmar entregado/i }))
        await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }))

        await waitFor(() => {
            expect(queueSpy).toHaveBeenCalledWith('UPDATE_STATUS_WITH_FILES', expect.objectContaining({
                uuid: '123',
                status: 'DELIVERED',
                signatureBase64: expect.any(String)
            }), expect.any(Object))
        })
    })

    it('should validate photo requirements for RETURNED status', async () => {
        renderWithRouter('123')
        await screen.findByText(/ABC/i)

        // RETURNED usually requires photos and observation
        await userEvent.click(screen.getByText('Devuelto'))

        const confirmBtn = screen.getByRole('button', { name: /confirmar devuelto/i })
        expect(confirmBtn).toBeDisabled()

        // Add observation
        const textarea = screen.getByPlaceholderText(/Motivo de la devolución/i)
        await userEvent.type(textarea, 'Cliente no estaba')

        expect(confirmBtn).toBeDisabled() // Still needs photos

        // We can't easily simulate EvidenceCapture here without mocking it too, 
        // but let's assume it works if we mock EvidenceCapture like SignatureCanvas
    })

    it('should show error state and navigate back when service is not found', async () => {
        server.use(
            http.get('http://localhost:8080/services/findByServiceId/999', () => {
                return new HttpResponse(null, { status: 404 });
            })
        )

        renderWithRouter('999')

        expect(await screen.findByText(/Error/i)).toBeInTheDocument()
        const volverBtn = screen.getByRole('button', { name: /volver/i })
        expect(volverBtn).toBeInTheDocument()
    })
})
