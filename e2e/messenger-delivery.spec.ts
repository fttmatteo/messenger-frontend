import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['Pixel 5'] });

test.describe('Messenger Delivery Execution', () => {
    test.beforeEach(async ({ page }) => {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        await page.addInitScript(() => {
            const mockUser = {
                document: 456,
                role: 'MESSENGER',
                id: 2,
                name: 'E2E Messenger',
                isOnline: true
            };
            const userStr = JSON.stringify(mockUser);
            window.localStorage.setItem('role', 'MESSENGER');
            window.localStorage.setItem('user', userStr);
            window.localStorage.setItem('accessToken', 'mock-messenger-token');

            window.sessionStorage.setItem('role', 'MESSENGER');
            window.sessionStorage.setItem('user', userStr);
            window.sessionStorage.setItem('accessToken', 'mock-messenger-token');

            // @ts-ignore
            window.turnstile = {
                render: (_c: any, o: any) => { setTimeout(() => { if (o && o.callback) o.callback('tok'); }, 50); return 'id'; },
                reset: () => { }, remove: () => { }, getResponse: () => 'tok'
            };
        });
        /* eslint-enable @typescript-eslint/no-explicit-any */

        await page.route('**/settings/status-colors', async route => {
            await route.fulfill({ json: { PENDING: '#6b7280', DELIVERED: '#10b981' } });
        });

        await page.route('**/services/pending**', async route => {
            await route.fulfill({
                json: [{
                    idServiceDelivery: 101,
                    plate: { idPlate: 10, plateNumber: 'E2E-123', plateType: 'MOTORCYCLE' },
                    dealership: {
                        idDealership: 1,
                        name: 'E2E Dealership',
                        address: 'Av. Principal 45',
                        phone: '1234567',
                        zone: 'Sur'
                    },
                    currentStatus: 'PENDING',
                    createdAt: new Date().toISOString(),
                    history: [],
                    photos: []
                }]
            });
        });

        await page.route('**/services/updateStatus/**', async route => {
            await route.fulfill({
                json: { message: 'Status updated' }
            });
        });

        await page.route('**/services/findByServiceId/**', async route => {
            await route.fulfill({
                json: {
                    idServiceDelivery: 101,
                    plate: { idPlate: 10, plateNumber: 'E2E-123', plateType: 'MOTORCYCLE' },
                    dealership: {
                        idDealership: 1,
                        name: 'E2E Dealership',
                        address: 'Av. Principal 45',
                        phone: '1234567',
                        zone: 'Sur'
                    },
                    currentStatus: 'PENDING',
                    createdAt: new Date().toISOString(),
                    photos: [], history: []
                }
            });
        });

        await page.route('**/services/updateService/101', async route => {
            await route.fulfill({ json: { success: true } });
        });

        await page.goto('/messenger');
        await page.waitForLoadState('networkidle');
    });

    test('should update service status to DELIVERED with signature', async ({ page }) => {
        await expect(page).not.toHaveURL(/.*login/, { timeout: 15000 });

        const serviceItem = page.getByText('E2E-123');
        await expect(serviceItem).toBeVisible({ timeout: 20000 });
        await serviceItem.click();

        await expect(page).toHaveURL(/.*servicio\/101/, { timeout: 20000 });

        const updateBtn = page.getByRole('button', { name: /actualizar/i }).first();
        await updateBtn.click();

        await expect(page).toHaveURL(/.*servicio\/101\/actualizar/, { timeout: 20000 });

        await page.getByText(/entregado/i).first().click();

        // Open signature dialog
        await page.getByText(/toca para firmar/i).first().click();

        // Wait for canvas and draw
        const canvas = page.locator('canvas.touch-none').first();
        const box = await canvas.boundingBox();
        if (box) {
            await page.mouse.move(box.x + box.width / 4, box.y + box.height / 4);
            await page.mouse.down();
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await page.mouse.up();
        }

        // Wait for GIF processing (if camera enabled)
        await page.waitForTimeout(2000); // Give some time for our fake camera to "capture"

        await page.getByRole('button', { name: /confirmar firma/i }).click();

        await page.getByRole('button', { name: /confirmar entregado/i }).click();
        await page.getByRole('button', { name: /^Confirmar$/ }).click();

        await expect(page).toHaveURL(/.*\/messenger/, { timeout: 20000 });
    });
});
