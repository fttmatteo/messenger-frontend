import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Servicios from '../Servicios'
import { StatusColorProvider } from '@/context/StatusColorContext'

import { AuthProvider } from '@/context/AuthContext'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { showToast } from '@/config/toast-config'

vi.mock('@/config/toast-config', () => ({
    showToast: {
        error: vi.fn(),
        success: vi.fn()
    }
}))

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
                            uuid: '550e8400-e29b-41d4-a716-446655440000',
                            plate: { idPlate: 101, plateNumber: 'ADM-001', plateType: 'CAR' },
                            dealership: {
                                idDealership: 201,
                                uuid: 'd39cfc1b-08fb-44b4-af04-cc9172be53f9',
                                name: 'Dealership-Alpha',
                                address: '123 Main',
                                phone: '555-1111',
                                zone: 'North'
                            },
                            originDealership: {
                                idDealership: 202,
                                uuid: 'e49cfc1b-08fb-44b4-af04-cc9172be53fa',
                                name: 'Origin-Alpha',
                                address: '456 Origin',
                                phone: '555-3333',
                                zone: 'South'
                            },
                            messenger: {
                                idEmployee: 301,
                                uuid: '899a6317-8bbc-4d96-81b0-c586041f0945',
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

    it('should show error message when API fails (500)', async () => {
        server.use(
            http.get(new RegExp('.*/services/allServicesPageable.*'), () => {
                return new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' })
            })
        )

        renderPage()

        await waitFor(() => {
            expect(screen.queryByTestId('service-skeleton-0')).not.toBeInTheDocument()
        }, { timeout: 4000 })

        // El componente UI debe manejar el rechazo lanzando un Toast (gestionado por el hook useServices)
        expect(showToast.error).toHaveBeenCalledWith("Error al cargar servicios", expect.any(Object))

        // La tabla debe mostrarse vacía
        expect(await screen.findByText(/Sin servicios/i)).toBeInTheDocument()
    })
})
