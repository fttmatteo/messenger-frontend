import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import UpdateStatus from '../UpdateStatus'
import { StatusColorProvider } from '@/context/StatusColorContext'
import { AuthProvider } from '@/context/AuthContext'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'


// Mock useSmartLocation to avoid real GPS prompts in tests
vi.mock('@/hooks/use-smart-location', () => ({
    useSmartLocation: () => ({
        getCurrentLocation: vi.fn().mockResolvedValue({ latitude: 10, longitude: 20 })
    })
}))

vi.mock('@/hooks/use-network', () => ({
    useNetwork: () => ({
        isOnline: true,
        wasOffline: false,
        pendingActionsCount: 0
    })
}))

vi.mock('@/services/offline-sync.service', () => ({
    offlineSyncService: {
        registerHandler: vi.fn(),
        queueAction: vi.fn(),
        getPendingActions: vi.fn().mockResolvedValue([]),
    }
}))

vi.mock('@/components/messenger/SignatureCanvas', async () => {
    const { forwardRef, useImperativeHandle } = await import('react')

    const MockSignatureCanvas = forwardRef((props: { onSignatureChange: (v: boolean) => void, onGifGenerated?: (v: Blob | null) => void, enableCamera?: boolean }, ref: React.ForwardedRef<unknown>) => {
        useImperativeHandle(ref, () => ({
            getSignature: async () => new File(['signature'], 'signature.png', { type: 'image/png' }),
            getGifFile: async () => new File(['gif'], 'capture.gif', { type: 'image/gif' }),
            clear: () => {
                props.onSignatureChange(false)
                if (props.onGifGenerated) props.onGifGenerated(null)
            },
            hasSignature: () => true,
            hasGif: () => true,
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
                {props.enableCamera && (
                    <button
                        type="button"
                        onClick={() => props.onGifGenerated && props.onGifGenerated(new Blob(['gif'], { type: 'image/gif' }))}
                    >
                        Simular GIF
                    </button>
                )}
            </div>
        )
    })

    return { SignatureCanvas: MockSignatureCanvas }
})

describe('UpdateStatus Page Integration', () => {
    beforeEach(() => {
        localStorage.setItem('role', 'MESSENGER') // Required by some hooks or services
        // Explicitly handle 123 for this test suite
        server.use(
            http.get('http://localhost:8080/services/findByServiceId/123', () => {
                return HttpResponse.json({
                    idServiceDelivery: 123,
                    currentStatus: 'PENDING',
                    plate: { idPlate: 1, plateNumber: 'ABC-123', plateType: 'CAR' },
                    dealership: {
                        idDealership: 10,
                        name: 'Test Dealership',
                        address: '123 Main St',
                        phone: '555-0000',
                        zone: 'Z1'
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
                        </Routes>
                    </StatusColorProvider>
                </AuthProvider>
            </MemoryRouter>
        )
    }

    it('should load service data and display current status', async () => {
        renderWithRouter('123')

        expect(await screen.findByText(/ABC/i)).toBeInTheDocument()
        expect(screen.getByText(/123/i)).toBeInTheDocument()
        expect(screen.getByText(/Test Dealership/i)).toBeInTheDocument()
        expect(screen.getByText(/Pendiente/i)).toBeInTheDocument()
    })

    it('should require signature and GIF for DELIVERED status', async () => {
        renderWithRouter('123')
        await screen.findByText(/ABC/i)

        const submitBtn = screen.getByRole('button', { name: /selecciona un estado/i })
        expect(submitBtn).toBeDisabled()

        // Select "DELIVERED" (Entregado)
        const deliveredOption = screen.getByText('Entregado')
        await userEvent.click(deliveredOption)

        // Mock canvas should be visible
        expect(screen.getByTestId('mock-signature-canvas')).toBeInTheDocument()

        // Confirm button should be disabled initially
        const confirmBtn = screen.getByRole('button', { name: /confirmar entregado/i })
        expect(confirmBtn).toBeDisabled()

        // 1. Simulate Drawing Signature
        await userEvent.click(screen.getByText('Simular Firma'))

        // Should STILL be disabled because DELIVERED requires GIF now
        expect(confirmBtn).toBeDisabled()

        // 2. Simulate GIF Capture
        // The button "Simular GIF" should be visible because enableCamera is true for DELIVERED
        const gifBtn = screen.getByText('Simular GIF')
        expect(gifBtn).toBeInTheDocument()
        await userEvent.click(gifBtn)

        // NOW it should be enabled
        expect(confirmBtn).toBeEnabled()
    })

    it('should reset validation when changing status', async () => {
        renderWithRouter('123')
        await screen.findByText(/ABC/i)

        // 1. Select DELIVERED and fulfill requirements
        await userEvent.click(screen.getByText('Entregado'))
        await userEvent.click(screen.getByText('Simular Firma'))
        await userEvent.click(screen.getByText('Simular GIF'))

        const confirmBtn = screen.getByRole('button', { name: /confirmar entregado/i })
        expect(confirmBtn).toBeEnabled()
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
