import { describe, it, expect} from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DeletedServices from '../DeletedServices'
import { StatusColorProvider } from '@/shared/context/StatusColorContext'
import { AdminUIProvider } from '@/shared/context/AdminUIContext'
import { AuthProvider } from '@/features/auth/context/AuthContext'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'

describe('DeletedServices Page Integration', () => {
    const renderPage = () => {
        localStorage.setItem('role', 'ADMIN')
        return render(
            <MemoryRouter>
                <AuthProvider>
                    <AdminUIProvider>
                        <StatusColorProvider>
                            <DeletedServices />
                        </StatusColorProvider>
                    </AdminUIProvider>
                </AuthProvider>
            </MemoryRouter>
        )
    }

    it('should load and display deleted services list', async () => {
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
                                uuid: 'dealership-uuid',
                                name: 'Old Dealership',
                                address: 'Old Street 123',
                                phone: '555-1234',
                                zone: 'South'
                            },
                            originDealership: {
                                idDealership: 202,
                                uuid: 'origin-dealership-uuid',
                                name: 'Origin Dealership',
                                address: 'Origin Street 456',
                                phone: '555-9876',
                                zone: 'North'
                            },
                            messenger: {
                                idEmployee: 501,
                                uuid: 'messenger-uuid',
                                document: 12345678,
                                fullName: 'Former Messenger',
                                phone: '555-5678',
                                role: 'MESSENGER'
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

        expect(screen.getByText(/Services eliminados/i)).toBeInTheDocument()

        expect(await screen.findByText(/Old Dealership/i)).toBeInTheDocument()
        
        // Use findByTitle because PlacaBadge splits the text in child elements
        expect(await screen.findByTitle(/DEL-001/i)).toBeInTheDocument()
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
