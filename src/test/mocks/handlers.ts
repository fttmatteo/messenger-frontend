import { http, HttpResponse, type RequestHandler } from 'msw';

export const handlers: RequestHandler[] = [
    // Add global mocks here (e.g., auth check, basic config)
    http.get(new RegExp('.*/auth/check.*'), () => {
        return HttpResponse.json({ authenticated: true, user: { id: 1, name: 'Test User' } });
    }),
    http.post(new RegExp('.*/auth/login.*'), async ({ request }) => {
        const body = await request.json() as { document: string };
        const mockPayload = { id: 123, sub: body.document, role: 'ADMIN' };
        const base64Payload = btoa(JSON.stringify(mockPayload));
        const mockToken = `header.${base64Payload}.signature`;

        return HttpResponse.json({
            token: mockToken,
            refreshToken: 'fake-refresh-token',
            role: 'ADMIN'
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
