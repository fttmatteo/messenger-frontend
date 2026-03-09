import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['Pixel 5'] });

test.describe('Service Creation Flow', () => {
    test.beforeEach(async ({ context, page }) => {
        // Aggressive auth injection
        await context.addInitScript(() => {
            const mockUser = {
                document: 123,
                role: 'MESSENGER',
                id: 1,
                name: 'E2E Creator',
                isOnline: true
            };
            window.localStorage.setItem('role', 'MESSENGER');
            window.localStorage.setItem('user', JSON.stringify(mockUser));
            window.localStorage.setItem('accessToken', 'mock-messenger-token');

            // Mock Turnstile globally
            (window as any).turnstile = {
                render: (_c: any, o: any) => {
                    console.log('Turnstile mock render');
                    setTimeout(() => { if (o.callback) o.callback('mock-tok'); }, 50);
                    return 'mock-id';
                },
                reset: () => { }, remove: () => { }, getResponse: () => 'mock-tok'
            };
        });

        await page.route('**/services/pending**', async route => {
            await route.fulfill({ json: [] });
        });

        await page.route('**/dealerships/allDealerships', async route => {
            await route.fulfill({
                json: [{ idDealership: 1, name: 'Test Dealership', zone: 'Z1' }]
            });
        });

        await page.route('**/services/createService', async route => {
            await route.fulfill({
                status: 201,
                json: { idServiceDelivery: 999, currentStatus: 'PENDING' }
            });
        });

        await page.goto('/messenger');
        await page.waitForLoadState('networkidle');
    });

    test('should create a new service delivery successfully from messenger dashboard', async ({ page }) => {
        // Wait for dashboard to be ready (ensure we are not on login page)
        await expect(page).not.toHaveURL(/.*login/, { timeout: 15000 });

        // Find FAB (Plus icon)
        const fab = page.locator('button:has(svg.lucide-plus)').first();
        await expect(fab).toBeVisible({ timeout: 20000 });
        await fab.click();

        await expect(page).toHaveURL(/.*crear/, { timeout: 20000 });

        // Select dealership
        const trigger = page.locator('button[id="dealershipId"]').first();
        await expect(trigger).toBeVisible({ timeout: 10000 });
        await trigger.click();

        const option = page.getByRole('option', { name: 'Test Dealership' }).first();
        await expect(option).toBeVisible();
        await option.click();

        // Photo Upload mock interaction
        const [fileChooser] = await Promise.all([
            page.waitForEvent('filechooser'),
            page.locator('input[type="file"]').first().click({ force: true }),
        ]);
        await fileChooser.setFiles({
            name: 'plate.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake-image-content'),
        });

        // Wait for OCR mock (manual entry fallback)
        const plateInput = page.locator('input[name="manualPlateNumber"]').first();
        await expect(plateInput).toBeVisible({ timeout: 15000 });
        await plateInput.fill('ABC 123');

        // Submit
        await page.getByRole('button', { name: /crear servicio/i }).click();

        // Redirect back
        await expect(page).toHaveURL(/.*\/messenger/, { timeout: 20000 });
    });
});
