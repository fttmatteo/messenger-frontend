import { http, HttpResponse, type RequestHandler } from 'msw';

export const handlers: RequestHandler[] = [
    // Add global mocks here (e.g., auth check, basic config)
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
        return HttpResponse.json({
            idServiceDelivery: Number(id),
            currentStatus: 'PENDING',
            plate: { plateNumber: 'ABC-123', plateType: 'PARTICULAR' },
            dealership: { name: 'Test Dealership' },
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
                    plate: { plateNumber: 'ADM-001', plateType: 'PARTICULAR' },
                    dealership: { name: 'Admin Dealer' },
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
    })
];
