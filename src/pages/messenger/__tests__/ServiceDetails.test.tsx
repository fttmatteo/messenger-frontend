import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ServiceDetails from '../ServiceDetails'
import { serviceDeliveryService } from '@/services/service.service'
import { openMaps } from '@/lib/navigation-utils'
import { trackingService } from '@/services/tracking.service'
import type { ServiceDelivery } from '@/types/service.types'

// Mock dependencies
vi.mock('@/hooks/use-network', () => ({
    useNetwork: vi.fn().mockReturnValue({ isOnline: true })
}))

vi.mock('@/hooks/use-status-colors', () => ({
    useStatusColors: vi.fn().mockReturnValue({
        colors: {},
        updateColor: vi.fn(),
        resetToDefaults: vi.fn(),
        isModified: false
    })
}))

vi.mock('@/lib/navigation-utils', () => ({
    openMaps: vi.fn()
}))

vi.mock('@/services/tracking.service', () => ({
    trackingService: {
        getLastKnownLocation: vi.fn().mockReturnValue(null)
    }
}))

vi.mock('@/services/service.service', () => ({
    serviceDeliveryService: {
        getById: vi.fn()
    }
}))

describe('ServiceDetails Page Integration', () => {
    const mockService: ServiceDelivery = {
        idServiceDelivery: 1,
        uuid: 'service-uuid-1',
        currentStatus: 'ASSIGNED',
        plate: { plateNumber: 'XYZ-789', plateType: 'MOTORCYCLE', idPlate: 123 },
        dealership: {
            idDealership: 1,
            uuid: 'dealer-uuid-1',
            name: 'Main Dealership',
            address: '123 Main St',
            phone: '555-0199',
            zone: 'NORTH',
            latitude: 10,
            longitude: 10
        },
        photos: [],
        createdAt: '2023-01-01T00:00:00Z',
        history: []
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(serviceDeliveryService.getById).mockResolvedValue(mockService)
        vi.mocked(trackingService.getLastKnownLocation).mockReturnValue(null)

        // Ensure navigator.geolocation exists for spying/mocking
        const mockGeo = {
            getCurrentPosition: vi.fn((success: PositionCallback) => {
                success({ coords: { latitude: 10, longitude: 10 } } as GeolocationPosition)
            })
        };

        vi.stubGlobal('navigator', {
            ...navigator,
            geolocation: mockGeo
        });
    })

    const renderWithRouter = (id: string) => {
        return render(
            <MemoryRouter initialEntries={[`/messenger/servicio/${id}`]}>
                <Routes>
                    <Route path="/messenger/servicio/:id" element={<ServiceDetails />} />
                    <Route path="/messenger/servicio/:id/actualizar" element={<div>Update Page</div>} />
                </Routes>
            </MemoryRouter>
        )
    }

    it('should display service details correctly', async () => {
        renderWithRouter('1')

        expect(await screen.findByText(/XYZ/i)).toBeInTheDocument()
        expect(await screen.findByText(/789/i)).toBeInTheDocument()
        expect(await screen.findByText(/Main Dealership/i)).toBeInTheDocument()
    })

    it('should trigger navigation when clicking Navegar button', async () => {
        renderWithRouter('1')
        await screen.findByText(/XYZ/i)

        const navBtn = screen.getByRole('button', { name: /navegar/i })
        await userEvent.click(navBtn)

        expect(openMaps).toHaveBeenCalled()
    })

    it('should handle geolocation fallback if high accuracy fails', async () => {
        const getCurrentPositionSpy = vi.mocked(navigator.geolocation.getCurrentPosition)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .mockImplementation((success: any, error: any, options: any) => {
                if (options?.enableHighAccuracy) {
                    error({ code: 3, message: 'Timeout' } as GeolocationPositionError)
                } else {
                    success({ coords: { latitude: 5, longitude: 5 } } as GeolocationPosition)
                }
            });

        renderWithRouter('1')
        await screen.findByText(/XYZ/i)

        const navBtn = screen.getByRole('button', { name: /navegar/i })
        await userEvent.click(navBtn)

        await waitFor(() => {
            expect(getCurrentPositionSpy).toHaveBeenCalledTimes(2)
        })

        expect(openMaps).toHaveBeenCalledWith(
            expect.anything(),
            5,
            5
        )
    })

    it('should show error message if service fetch fails', async () => {
        vi.mocked(serviceDeliveryService.getById).mockRejectedValue(new Error('Network Error'))

        renderWithRouter('1')

        expect(await screen.findByText(/Network Error/i)).toBeInTheDocument()
    })

    it('should show not found message if service is null', async () => {
        vi.mocked(serviceDeliveryService.getById).mockResolvedValue(null as unknown as ServiceDelivery)

        renderWithRouter('1')

        expect(await screen.findByText(/servicio no encontrado/i)).toBeInTheDocument()
    })

    it('should display visual evidence if photo is present', async () => {
        vi.mocked(serviceDeliveryService.getById).mockResolvedValue({
            ...mockService,
            photos: [{
                idPhoto: 1,
                photoType: 'PLATE_DETECTION',
                photoPath: 'http://example.com/photo.jpg'
            }]
        })

        renderWithRouter('1')

        expect(await screen.findByText(/evidencia visual/i)).toBeInTheDocument()
        expect(screen.getByAltText(/placa del vehículo/i)).toHaveAttribute('src', 'http://example.com/photo.jpg')
    })
})
