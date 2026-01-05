import { http, HttpResponse } from 'msw';

export const handlers = [
    // Add global mocks here (e.g., auth check, basic config)
    http.get('*/api/auth/check', () => {
        return HttpResponse.json({ authenticated: true, user: { id: 1, name: 'Test User' } });
    }),
];
