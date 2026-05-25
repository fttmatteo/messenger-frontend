import { http, HttpResponse, type RequestHandler } from 'msw';

/**
 * Definición de handlers de interceptación de red para Mock Service Worker (MSW).
 * Simula respuestas de API para endpoints críticos como autenticación, servicios y configuración,
 * permitiendo pruebas de integración deterministas sin backend real.
 */
export const handlers: RequestHandler[] = [
    // Agregar mocks globales aquí (ej. verificación de auth, configuración básica)
    http.get(new RegExp('.*/auth/check.*'), () => {
        return HttpResponse.json({ authenticated: true, user: { id: 1, uuid: 'u1', name: 'Test User' } });
    }),
    http.post(new RegExp('.*/auth/logout.*'), () => {
        return HttpResponse.json({ message: 'Logout ok' });
    }),
    http.post(new RegExp('.*/auth/login.*'), async ({ request }) => {
        const body = await request.json() as { document: string };
        return HttpResponse.json({
            role: 'ADMIN',
            message: 'Login exitoso',
            user: {
                id: 123,
                uuid: 'u123',
                document: body.document,
                role: 'ADMIN'
            }
        }, {
            headers: {
                // Simular set-cookie de access/refresh token (string única para evitar conflictos de tipos)
                'Set-Cookie': 'accessToken=fake; Path=/; HttpOnly; SameSite=None; Secure'
            }
        });
    }),
    http.get(new RegExp('.*/services/findByServiceId/.*'), ({ request }) => {
        const id = request.url.split('/').pop()?.split('?')[0];
        if (id === '999') {
            return new HttpResponse(null, { status: 404, statusText: 'Not Found' });
        }
        return HttpResponse.json({
            idServiceDelivery: Number(id) || 1,
            uuid: typeof id === 'string' && id.length > 10 ? id : '550e8400-e29b-41d4-a716-446655440000',
            currentStatus: 'PENDING',
            createdAt: new Date().toISOString(),
            plate: {
                idPlate: 1,
                plateNumber: 'ABC-123',
                plateType: 'CAR'
            },
            dealership: {
                idDealership: 1,
                uuid: 'd39cfc1b-08fb-44b4-af04-cc9172be53f9',
                name: 'Test Dealership',
                address: '123 Test St',
                phone: '555-0123',
                zone: 'NORTH'
            },
            originDealership: {
                idDealership: 2,
                uuid: 'a29cfc1b-08fb-44b4-af04-cc9172be53f9',
                name: 'Origin Dealership',
                address: '456 Origin St',
                phone: '555-4567',
                zone: 'SOUTH'
            },
            history: []
        });
    }),
    http.put(new RegExp('.*/services/updateService/.*'), async ({ request }) => {
        const id = request.url.split('/').pop()?.split('?')[0];
        const formData = await request.formData();
        return HttpResponse.json({
            idServiceDelivery: Number(id) || 1,
            uuid: typeof id === 'string' && id.length > 10 ? id : '550e8400-e29b-41d4-a716-446655440000',
            currentStatus: formData.get('status'),
            message: 'Status updated successfully',
            plate: { idPlate: 1, plateNumber: 'ABC-123', plateType: 'CAR' },
            dealership: {
                idDealership: 1,
                uuid: 'd39cfc1b-08fb-44b4-af04-cc9172be53f9',
                name: 'Test Dealership',
                address: '123 Test St',
                phone: '555-0123',
                zone: 'NORTH'
            },
            originDealership: {
                idDealership: 2,
                uuid: 'a29cfc1b-08fb-44b4-af04-cc9172be53f9',
                name: 'Origin Dealership',
                address: '456 Origin St',
                phone: '555-4567',
                zone: 'SOUTH'
            },
            createdAt: new Date().toISOString()
        });
    }),
    http.get(new RegExp('.*/services/allServicesPageable.*'), () => {
        return HttpResponse.json({
            content: [
                {
                    idServiceDelivery: 1,
                    uuid: '550e8400-e29b-41d4-a716-446655440000',
                    plate: { idPlate: 1, plateNumber: 'ADM-001', plateType: 'CAR' },
                    dealership: { idDealership: 1, uuid: 'd39cfc1b-08fb-44b4-af04-cc9172be53f9', name: 'Admin Dealer', address: '123 St', phone: '555-5555', zone: 'NORTH' },
                    originDealership: { idDealership: 2, uuid: 'a29cfc1b-08fb-44b4-af04-cc9172be53f9', name: 'Origin Dealer', address: '456 St', phone: '555-6666', zone: 'SOUTH' },
                    messenger: { idEmployee: 1, uuid: 'm1', document: 12345, fullName: 'Test Messenger', phone: '123', role: 'MESSENGER' },
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
    }),
    http.get(new RegExp('.*/dealerships/allDealerships.*'), () => {
        return HttpResponse.json([
            {
                idDealership: 1,
                uuid: 'd39cfc1b-08fb-44b4-af04-cc9172be53f9',
                name: 'Test Dealership',
                address: '123 Test St',
                phone: '555-0123',
                zone: 'NORTH',
                status: true
            }
        ]);
    })
];
