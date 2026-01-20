import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Servicios from '../Servicios'
import { StatusColorProvider } from '@/context/StatusColorContext'

import { AuthProvider } from '@/context/AuthContext'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'

// Mock de useOutletContext para query de búsqueda
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useOutletContext: () => ({ searchQuery: '' })
    }
})

// Mock de useStatusColors para evitar problemas de contexto si es necesario, pero usamos el Provider
/**
 * Suite de pruebas de integración para la página de lista de servicios del administrador.
 * Verifica la correcta carga de datos, manejo de estados vacíos y visualización de la lista
 * simulando respuestas del servidor con MSW.
 */
describe('Servicios Admin Page Integration', () => {
    beforeEach(() => {
        server.use(
            http.get(new RegExp('.*/services/allServicesPageable.*'), () => {
                return HttpResponse.json({
                    content: [
                        {
                            idServiceDelivery: 1,
                            plate: { idPlate: 101, plateNumber: 'ADM-001', plateType: 'CAR' },
                            dealership: {
                                idDealership: 201,
                                name: 'Dealership-Alpha',
                                address: '123 Main',
                                phone: '555-1111',
                                zone: 'North'
                            },
                            messenger: {
                                idEmployee: 301,
                                document: 9001,
                                fullName: 'Messenger-Beta',
                                phone: '555-2222',
                                role: 'MESSENGER'
                            },
                            currentStatus: 'ASSIGNED',
                            createdAt: new Date().toISOString()
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
    })

    const renderPage = () => {
        localStorage.setItem('role', 'ADMIN')
        return render(
            <MemoryRouter>
                <AuthProvider>
                    <StatusColorProvider>
                        <Servicios />
                    </StatusColorProvider>
                </AuthProvider>
            </MemoryRouter>
        )
    }

    it('should load and display services list', async () => {
        renderPage()

        // Esperar a que desaparezca el skeleton
        await waitFor(() => {
            expect(screen.queryByTestId('service-skeleton-0')).not.toBeInTheDocument()
        }, { timeout: 4000 })

        // Verificar concesionario primero
        expect(await screen.findByText(/Dealership-Alpha/i)).toBeInTheDocument()

        // Luego verificar partes de la placa
        expect(await screen.findByText(/ADM/i)).toBeInTheDocument()
        expect(await screen.findByText(/001/i)).toBeInTheDocument()
        expect(await screen.findByText(/Messenger-Beta/i)).toBeInTheDocument()
        expect(await screen.findByText(/Asignado/i)).toBeInTheDocument()
    })

    it('should show empty state when no services', async () => {
        server.use(
            http.get(new RegExp('.*/services/allServicesPageable.*'), () => {
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

        expect(await screen.findByText(/Sin servicios/i)).toBeInTheDocument()
    })
})
