import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['Pixel 5'] });

test.describe('Offline Resilience & Sync', () => {
    test.beforeEach(async ({ context, page }) => {
        await context.addInitScript(() => {
            const mockUser = {
                document: 789,
                role: 'MESSENGER',
                id: 3,
                name: 'Offline User',
                isOnline: true
            };
            window.localStorage.setItem('role', 'MESSENGER');
            window.localStorage.setItem('user', JSON.stringify(mockUser));
            window.localStorage.setItem('accessToken', 'offline-test-token');

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).turnstile = {
                render: (_c: unknown, o: { callback?: (t: string) => void }) => { setTimeout(() => { if (o.callback) o.callback('tok'); }, 50); return 'id'; },
                reset: () => { }, remove: () => { }, getResponse: () => 'tok'
            };
        });

        await page.route('**/services/findByServiceId/202', async route => {
            await route.fulfill({
                json: {
                    idServiceDelivery: 202,
                    currentStatus: 'PENDING',
                    plate: { plateNumber: 'OFF-123', plateType: 'CAR' },
                    dealership: { name: 'Offline Dealership' },
                    photos: [], history: [], createdAt: new Date().toISOString()
                }
            });
        });

        await page.route('**/settings/status-colors', async route => {
            await route.fulfill({ json: { PENDING: '#6b7280', DELIVERED: '#10b981' } });
        });

        await page.goto('/messenger/servicio/202/actualizar');
        await page.waitForLoadState('networkidle');
    });

    test('should queue action when offline and sync when back online', async ({ page, context }) => {
        await expect(page).not.toHaveURL(/.*login/, { timeout: 15000 });

        const deliveredBtn = page.getByText(/entregado/i).first();
        await expect(deliveredBtn).toBeVisible({ timeout: 20000 });

        await context.setOffline(true);

        await deliveredBtn.click();
        await page.getByRole('button', { name: /simular/i }).first().click();

        const confirmBtn = page.getByRole('button', { name: /confirmar/i }).first();
        await confirmBtn.click();

        await page.getByRole('button', { name: /^Confirmar$/ }).click();

        await expect(page.getByText(/offline|pendiente/i).first()).toBeVisible({ timeout: 20000 });

        let syncCalled = false;
        await page.route('**/services/updateService/202', async route => {
            syncCalled = true;
            await route.fulfill({ json: { success: true } });
        });

        await context.setOffline(false);
        await page.evaluate(() => window.dispatchEvent(new Event('online')));

        await expect.poll(() => syncCalled, { timeout: 30000 }).toBeTruthy();
    });
});
