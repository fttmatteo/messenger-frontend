import { describe, it, expect} from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Eliminados from '../Eliminados'
import { StatusColorProvider } from '@/context/StatusColorContext'
import { AdminUIProvider } from '@/context/AdminUIContext'
import { AuthProvider } from '@/context/AuthContext'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'

describe('Eliminados Page Integration', () => {
    const renderPage = () => {
        localStorage.setItem('role', 'ADMIN')
        return render(
            <MemoryRouter>
                <AuthProvider>
                    <AdminUIProvider>
                        <StatusColorProvider>
                            <Eliminados />
                        </StatusColorProvider>
                    </AdminUIProvider>
                </AuthProvider>
            </MemoryRouter>
        )
    }

    it('should load and display deleted services list', async () => {
        // Mock more flexible to catch any variation of the URL
        server.use(
            http.get(/.*\/services\/trash.*/, () => {
                return HttpResponse.json({
                    content: [
                        {
                            idServiceDelivery: 99,
                            uuid: 'deleted-service-uuid',
                            plate: { idPlate: 102, plateNumber: 'DEL-001', plateType: 'CAR' },
                            dealership: {
                                idDealership: 201,
                                name: 'Old Dealership',
                                zone: 'South'
                            },
                            messenger: {
                                fullName: 'Former Messenger'
                            },
                            currentStatus: 'CANCELED',
                            createdAt: new Date().toISOString(),
                            deletedAt: new Date().toISOString()
                        }
                    ],
                    totalPages: 1,
                    totalElements: 1,
                    currentPage: 0,
                    pageSize: 10,
                    first: true,
                    last: true
                });
            })
        )

        renderPage()

        // Verify title
        expect(screen.getByText(/Servicios eliminados/i)).toBeInTheDocument()

        // Wait for data
        expect(await screen.findByText(/Old Dealership/i)).toBeInTheDocument()
        expect(await screen.findByText(/DEL-001/i)).toBeInTheDocument()
    })

    it('should show empty state when trash is empty', async () => {
        server.use(
            http.get(/.*\/services\/trash.*/, () => {
                return HttpResponse.json({
                    content: [],
                    totalPages: 0,
                    totalElements: 0,
                    currentPage: 0,
                    pageSize: 10,
                    first: true,
                    last: true
                });
            })
        )

        renderPage()

        expect(await screen.findByText(/Papelera vacía/i)).toBeInTheDocument()
    })
})
