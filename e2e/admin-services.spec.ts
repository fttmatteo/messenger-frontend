import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['Pixel 5'] });

test.describe('Service Creation Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Aggressive auth injection
        /* eslint-disable @typescript-eslint/no-explicit-any */
        await page.addInitScript(() => {
            const mockUser = {
                document: 123,
                role: 'MESSENGER',
                id: 1,
                name: 'E2E Creator',
                isOnline: true
            };
            const userStr = JSON.stringify(mockUser);
            window.localStorage.setItem('role', 'MESSENGER');
            window.localStorage.setItem('user', userStr);
            window.localStorage.setItem('accessToken', 'mock-messenger-token');

            window.sessionStorage.setItem('role', 'MESSENGER');
            window.sessionStorage.setItem('user', userStr);
            window.sessionStorage.setItem('accessToken', 'mock-messenger-token');

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

        await page.route('**/services/pending**', async route => {
            await route.fulfill({ json: [] });
        });

        await page.route('**/dealerships/allDealerships', async route => {
            await route.fulfill({
                json: [{
                    idDealership: 1,
                    name: 'Test Dealership',
                    address: 'Calle 123',
                    phone: '555-1234',
                    zone: 'Norte'
                }]
            });
        });

        await page.route('**/services/createService', async route => {
            await route.fulfill({
                json: {
                    idServiceDelivery: 202,
                    plate: { idPlate: 1, plateNumber: 'ABC123', plateType: 'CAR' },
                    dealership: { idDealership: 1, name: 'Test Dealership', address: 'Calle 123', phone: '555-1234', zone: 'Norte' },
                    currentStatus: 'PENDING',
                    createdAt: new Date().toISOString()
                }
            });
        });

        await page.route('**/services/extractPlate', async route => {
            await route.fulfill({
                json: { success: false, message: 'OCR Fallback' }
            });
        });

        await page.goto('/messenger');
        await page.waitForLoadState('networkidle');
    });

    test('should create a new service delivery successfully from messenger dashboard', async ({ page }) => {
        await expect(page).not.toHaveURL(/.*login/, { timeout: 15000 });

        const fab = page.locator('button:has(svg.lucide-plus)').first();
        await expect(fab).toBeVisible({ timeout: 20000 });
        await fab.click();

        await expect(page).toHaveURL(/.*crear/, { timeout: 20000 });

        const trigger = page.locator('button[id="dealershipId"]').first();
        await expect(trigger).toBeVisible({ timeout: 10000 });
        await trigger.click();

        const option = page.getByRole('option', { name: 'Test Dealership' }).first();
        await expect(option).toBeVisible();
        await option.click();

        await page.locator('input[type="file"]').first().setInputFiles({
            name: 'plate.jpg',
            mimeType: 'image/jpeg',
            buffer: Buffer.from('fake-image-content'),
        });

        const plateInput = page.locator('input[name="manualPlateNumber"]').first();
        await expect(plateInput).toBeVisible({ timeout: 15000 });
        await plateInput.fill('ABC 123');

        await page.getByRole('button', { name: /crear servicio/i }).click();

        await expect(page).toHaveURL(/.*\/messenger/, { timeout: 20000 });
    });
});
