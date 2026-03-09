import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['Pixel 5'] });

test.describe('Messenger Delivery Execution', () => {
    test.beforeEach(async ({ context, page }) => {
        await context.addInitScript(() => {
            const mockUser = {
                document: 456,
                role: 'MESSENGER',
                id: 2,
                name: 'E2E Messenger',
                isOnline: true
            };
            window.localStorage.setItem('role', 'MESSENGER');
            window.localStorage.setItem('user', JSON.stringify(mockUser));
            window.localStorage.setItem('accessToken', 'mock-messenger-token');

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).turnstile = {
                render: (_c: unknown, o: { callback?: (t: string) => void }) => { setTimeout(() => { if (o.callback) o.callback('tok'); }, 50); return 'id'; },
                reset: () => { }, remove: () => { }, getResponse: () => 'tok'
            };
        });

        await page.route('**/services/pending**', async route => {
            await route.fulfill({
                json: [{
                    idServiceDelivery: 101,
                    currentStatus: 'PENDING',
                    plate: { plateNumber: 'E2E-123', plateType: 'CAR' },
                    dealership: { idDealership: 1, name: 'E2E Dealership' },
                    createdAt: new Date().toISOString()
                }]
            });
        });

        await page.route('**/services/findByServiceId/101', async route => {
            await route.fulfill({
                json: {
                    idServiceDelivery: 101,
                    currentStatus: 'PENDING',
                    plate: { plateNumber: 'E2E-123', plateType: 'CAR' },
                    dealership: { name: 'E2E Dealership' },
                    photos: [], history: [], createdAt: new Date().toISOString()
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
        await page.getByRole('button', { name: /simular/i }).first().click();

        await page.getByRole('button', { name: /confirmar entregado/i }).click();
        await page.getByRole('button', { name: /^Confirmar$/ }).click();

        await expect(page).toHaveURL(/.*\/messenger/, { timeout: 20000 });
    });
});
