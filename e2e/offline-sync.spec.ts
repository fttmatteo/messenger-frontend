import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['Pixel 5'] });

test.describe('Offline Resilience & Sync', () => {
    test.beforeEach(async ({ page }) => {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        await page.addInitScript(() => {
            const mockUser = {
                document: 789,
                role: 'MESSENGER',
                id: 3,
                uuid: 'messenger-3',
                name: 'Offline User',
                isOnline: true
            };
            const userStr = JSON.stringify(mockUser);
            window.localStorage.setItem('role', 'MESSENGER');
            window.localStorage.setItem('user', userStr);
            window.localStorage.setItem('accessToken', 'offline-test-token');
            window.localStorage.setItem('plak_cookie_consent', 'accepted');
            window.localStorage.setItem('CapacitorStorage.plak_cookie_consent', 'accepted');

            window.sessionStorage.setItem('role', 'MESSENGER');
            window.sessionStorage.setItem('user', userStr);
            window.sessionStorage.setItem('accessToken', 'offline-test-token');

            (window as any).e2eTestCameraMock = true;

            // @ts-expect-error - Mocking global object
            window.turnstile = {
                render: (_c: any, o: any) => { setTimeout(() => { if (o && o.callback) o.callback('tok'); }, 50); return 'id'; },
                reset: () => { }, remove: () => { }, getResponse: () => 'tok'
            };
        });
        /* eslint-enable @typescript-eslint/no-explicit-any */

        await page.route('**/services/findByServiceId/s202', async route => {
            await route.fulfill({
                json: {
                    idServiceDelivery: 202,
                    uuid: 's202',
                    plate: { idPlate: 20, plateNumber: 'OFF-LINE', plateType: 'CAR' },
                    dealership: {
                        idDealership: 2,
                        uuid: 'd2',
                        name: 'Concesionario Norte',
                        address: 'Calle 100 #15-20',
                        phone: '7654321',
                        zone: 'Norte'
                    },
                    originDealership: {
                        idDealership: 1,
                        uuid: 'd1',
                        name: 'Concesionario Sur',
                        address: 'Calle 10 #5-10',
                        phone: '1234567',
                        zone: 'Sur'
                    },
                    currentStatus: 'PENDING',
                    createdAt: new Date().toISOString()
                }
            });
        });

        await page.route('**/services/updateStatus/**', async route => {
            await route.fulfill({ json: { message: 'Success' } });
        });
        await page.route('**/auth/ws-token', async route => {
            await route.fulfill({ json: { token: 'mock-ws-token' } });
        });

        await page.goto('/messenger/servicio/s202/actualizar');
        await page.waitForLoadState('networkidle');
    });

    test('should queue action when offline and sync when back online', async ({ page, context }) => {
        await expect(page).not.toHaveURL(/.*login/, { timeout: 15000 });

        const deliveredBtn = page.getByText(/entregado/i).first();
        await expect(deliveredBtn).toBeVisible({ timeout: 20000 });

        await deliveredBtn.click();

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

        const confirmSignatureBtn = page.getByRole('button', { name: /confirmar firma/i });
        await expect(confirmSignatureBtn).toBeEnabled({ timeout: 15000 });
        await confirmSignatureBtn.click();

        const confirmBtn = page.getByRole('button', { name: /confirmar/i }).first();
        await confirmBtn.click();

        await context.setOffline(true);
        await expect(page.getByText(/sin conexión/i).first()).toBeVisible({ timeout: 15000 });

        await page.getByRole('button', { name: /^Confirmar$/ }).click();

        await expect(page.getByText(/offline|pendiente/i).first()).toBeVisible({ timeout: 20000 });

        let syncCalled = false;
        await page.route('**/services/updateService/**', async (route) => {
            syncCalled = true;
            await route.fulfill({ 
                status: 200, 
                contentType: 'application/json', 
                body: JSON.stringify({ 
                    idServiceDelivery: 202,
                    uuid: 's202',
                    plate: { idPlate: 20, plateNumber: 'OFF-LINE', plateType: 'CAR' },
                    dealership: { idDealership: 2, uuid: 'd2', name: 'Concesionario Norte' },
                    originDealership: { idDealership: 1, uuid: 'd1', name: 'Concesionario Sur' },
                    currentStatus: 'DELIVERED',
                    createdAt: new Date().toISOString()
                }) 
            });
        });

        await context.setOffline(false);

        await expect(page.getByText(/conexión restaurada/i).first()).toBeVisible({ timeout: 15000 });

        await expect.poll(() => syncCalled, { timeout: 30000 }).toBeTruthy();
    });
});
