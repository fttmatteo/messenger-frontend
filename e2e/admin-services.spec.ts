import { test, expect } from '@playwright/test';



test.describe('Service Creation Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Aggressive auth injection
        /* eslint-disable @typescript-eslint/no-explicit-any */
        await page.addInitScript(() => {
            const mockUser = {
                document: 123,
                role: 'ADMIN',
                id: 1,
                uuid: 'a1',
                name: 'E2E Admin',
                isOnline: true
            };
            const userStr = JSON.stringify(mockUser);
            window.localStorage.setItem('role', 'ADMIN');
            window.localStorage.setItem('user', userStr);
            window.localStorage.setItem('accessToken', 'mock-admin-token');

            window.sessionStorage.setItem('role', 'ADMIN');
            window.sessionStorage.setItem('user', userStr);
            window.sessionStorage.setItem('accessToken', 'mock-admin-token');

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
            await route.fulfill({ json: { content: [], totalElements: 0 } });
        });

        await page.route('**/dealerships/allDealerships', async route => {
            await route.fulfill({
                json: [{
                    idDealership: 1,
                    uuid: 'd1',
                    name: 'Test Dealership',
                    address: 'Calle 123',
                    phone: '555-1234',
                    zone: 'Norte'
                }]
            });
        });

        await page.route('**/employees/allEmployees', async route => {
            await route.fulfill({
                json: [{
                    idEmployee: 2,
                    fullName: 'Test Messenger',
                    role: 'MESSENGER',
                    document: 456
                }]
            });
        });

        await page.route('**/services/createService', async route => {
            await route.fulfill({
                json: {
                    idServiceDelivery: 202,
                    uuid: 's202',
                    plate: { idPlate: 1, plateNumber: 'ABC12345678', plateType: 'MOTORCYCLE' },
                    dealership: { idDealership: 1, uuid: 'd1', name: 'Test Dealership', address: 'Calle 123', phone: '555-1234', zone: 'Norte' },
                    currentStatus: 'PENDING',
                    createdAt: new Date().toISOString()
                }
            });
        });

        await page.route('**/auth/ws-token', async route => {
            await route.fulfill({ json: { token: 'mock-ws-token' } });
        });

        await page.goto('/admin/servicios');
        await page.waitForLoadState('networkidle');
    });

    test('should create a new service delivery successfully from admin dashboard', async ({ page }) => {
        await expect(page).not.toHaveURL(/.*login/, { timeout: 15000 });

        const newServiceBtn = page.getByRole('button', { name: /nuevo/i }).first();
        await expect(newServiceBtn).toBeVisible({ timeout: 20000 });
        await newServiceBtn.click();

        await expect(page).toHaveURL(/.*crear/, { timeout: 20000 });

        const plateInput = page.locator('input[name="manualPlateNumber"]').first();
        await expect(plateInput).toBeVisible({ timeout: 15000 });
        await plateInput.fill('ABC1234567890');

        const dealershipTrigger = page.locator('button[id="dealershipId"]').first();
        await expect(dealershipTrigger).toBeVisible({ timeout: 10000 });
        await dealershipTrigger.click();

        const dealershipOption = page.getByRole('option', { name: 'Test Dealership' }).first();
        await expect(dealershipOption).toBeVisible();
        await dealershipOption.click();

        const messengerTrigger = page.locator('button[id="messengerId"]').first();
        await expect(messengerTrigger).toBeVisible({ timeout: 10000 });
        await messengerTrigger.click();

        const messengerOption = page.getByRole('option', { name: 'Test Messenger' }).first();
        await expect(messengerOption).toBeVisible();
        await messengerOption.click();

        await page.getByRole('button', { name: /crear servicio/i }).click();

        await expect(page).toHaveURL(/.*\/admin\/servicios/, { timeout: 20000 });
    });
});
