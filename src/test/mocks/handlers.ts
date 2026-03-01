import { http, HttpResponse, type RequestHandler } from 'msw';

/**
 * Definición de handlers de interceptación de red para Mock Service Worker (MSW).
 * Simula respuestas de API para endpoints críticos como autenticación, servicios y configuración,
 * permitiendo pruebas de integración deterministas sin backend real.
 */
export const handlers: RequestHandler[] = [
    // Agregar mocks globales aquí (ej. verificación de auth, configuración básica)
    http.get(new RegExp('.*/auth/check.*'), () => {
        return HttpResponse.json({ authenticated: true, user: { id: 1, name: 'Test User' } });
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
            idServiceDelivery: Number(id),
            currentStatus: 'PENDING',
            createdAt: new Date().toISOString(),
            plate: {
                idPlate: 1,
                plateNumber: 'ABC-123',
                plateType: 'CAR'
            },
            dealership: {
                idDealership: 1,
                name: 'Test Dealership',
                address: '123 Test St',
                phone: '555-0123',
                zone: 'NORTH'
            },
            history: []
        });
    }),
    http.put(new RegExp('.*/services/updateService/.*'), async ({ request }) => {
        const id = request.url.split('/').pop()?.split('?')[0];
        const formData = await request.formData();
        return HttpResponse.json({
            idServiceDelivery: Number(id),
            currentStatus: formData.get('status'),
            message: 'Status updated successfully'
        });
    }),
    http.get(new RegExp('.*/settings/status-colors.*'), () => {
        return HttpResponse.json({});
    }),
    http.get(new RegExp('.*/services/allServicesPageable.*'), () => {
        return HttpResponse.json({
            content: [
                {
                    idServiceDelivery: 1,
                    plate: { idPlate: 1, plateNumber: 'ADM-001', plateType: 'CAR' },
                    dealership: { idDealership: 1, name: 'Admin Dealer', address: '123 St', phone: '555-5555', zone: 'NORTH' },
                    messenger: { fullName: 'Test Messenger' },
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
                name: 'Test Dealership',
                address: '123 Test St',
                phone: '555-0123',
                zone: 'NORTH',
                status: true
            }
        ]);
    })
];
