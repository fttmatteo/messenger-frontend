import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['Pixel 5'] });

test.describe('Messenger Delivery Execution', () => {
    test.beforeEach(async ({ page }) => {
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('request', req => console.log('>> REQ:', req.method(), req.url()));
        page.on('response', res => console.log('<< RES:', res.status(), res.url()));

        /* eslint-disable @typescript-eslint/no-explicit-any */
        await page.addInitScript(() => {
            const mockUser = {
                document: 456,
                role: 'MESSENGER',
                id: 2,
                uuid: 'm2',
                name: 'E2E Messenger',
                isOnline: true
            };
            const userStr = JSON.stringify(mockUser);
            window.localStorage.setItem('role', 'MESSENGER');
            window.localStorage.setItem('user', userStr);
            window.localStorage.setItem('accessToken', 'mock-messenger-token');
            window.localStorage.setItem('plak_cookie_consent', 'accepted');
            window.localStorage.setItem('CapacitorStorage.plak_cookie_consent', 'accepted');

            window.sessionStorage.setItem('role', 'MESSENGER');
            window.sessionStorage.setItem('user', userStr);
            window.sessionStorage.setItem('accessToken', 'mock-messenger-token');

            (window as any).e2eTestCameraMock = true;

            // @ts-expect-error - Mocking global object
            window.turnstile = {
                render: (_c: any, o: any) => { setTimeout(() => { if (o && o.callback) o.callback('tok'); }, 50); return 'id'; },
                reset: () => { }, remove: () => { }, getResponse: () => 'tok'
            };
        });
        /* eslint-enable @typescript-eslint/no-explicit-any */

        await page.route('**/settings/status-colors', async route => {
            await route.fulfill({ json: { PENDING: '#6b7280', DELIVERED: '#10b981' } });
        });

        await page.route('**/services/allServicesPageable**', async route => {
            await route.fulfill({
                json: {
                    content: [{
                        idServiceDelivery: 101,
                        uuid: 's101',
                        plate: { idPlate: 10, plateNumber: 'E2E-123', plateType: 'MOTORCYCLE' },
                        dealership: {
                            idDealership: 1,
                            uuid: 'd1',
                            name: 'E2E Dealership',
                            address: 'Av. Principal 45',
                            phone: '1234567',
                            zone: 'Sur'
                        },
                        currentStatus: 'ASSIGNED',
                        createdAt: new Date().toISOString(),
                        history: [],
                        photos: []
                    }],
                    currentPage: 0,
                    pageSize: 10,
                    totalElements: 1,
                    totalPages: 1,
                    first: true,
                    last: true
                }
            });
        });

        await page.route('**/services/updateStatus/**', async route => {
            await route.fulfill({
                json: { message: 'Status updated' }
            });
        });
        await page.route('**/auth/ws-token', async route => {
            await route.fulfill({ json: { token: 'mock-ws-token' } });
        });

        await page.route('**/services/findByServiceId/**', async route => {
            await route.fulfill({
                json: {
                    idServiceDelivery: 101,
                    uuid: 's101',
                    plate: { idPlate: 10, plateNumber: 'E2E-123', plateType: 'MOTORCYCLE' },
                    dealership: {
                        idDealership: 1,
                        uuid: 'd1',
                        name: 'E2E Dealership',
                        address: 'Av. Principal 45',
                        phone: '1234567',
                        zone: 'Sur'
                    },
                    currentStatus: 'ASSIGNED',
                    createdAt: new Date().toISOString(),
                    photos: [], history: []
                }
            });
        });

        await page.route('**/services/updateService/s101', async route => {
            await route.fulfill({ json: { success: true } });
        });

        await page.goto('/messenger');
        await page.waitForLoadState('networkidle');
    });

    test('should update service status to DELIVERED with signature', async ({ page }) => {
        await expect(page).not.toHaveURL(/.*login/, { timeout: 15000 });

        const serviceItem = page.getByText(/E2E.*123/i).first();
        await expect(serviceItem).toBeVisible({ timeout: 20000 });
        await serviceItem.click();

        await expect(page).toHaveURL(/.*servicio\/s101\/actualizar/, { timeout: 20000 });

        await page.getByText(/entregado/i).first().click();

        await page.getByText(/toca para firmar/i).first().click();

        const canvas = page.locator('canvas.touch-none').first();
        await expect(canvas).toBeVisible({ timeout: 15000 });

        await canvas.evaluate((node) => {
            const evStart = new MouseEvent('mousedown', { clientX: 10, clientY: 10, bubbles: true });
            node.dispatchEvent(evStart);
            const evMove = new MouseEvent('mousemove', { clientX: 50, clientY: 50, bubbles: true });
            node.dispatchEvent(evMove);
            const evEnd = new MouseEvent('mouseup', { bubbles: true });
            node.dispatchEvent(evEnd);
        });

        const confirmBtn = page.getByRole('button', { name: /confirmar firma/i });
        await expect(confirmBtn).toBeEnabled({ timeout: 15000 });
        await confirmBtn.click();

        await page.getByRole('button', { name: /confirmar entregado/i }).click();
        await page.getByRole('button', { name: /^Confirmar$/ }).click();

        await expect(page).toHaveURL(/.*\/messenger/, { timeout: 20000 });
    });
});
