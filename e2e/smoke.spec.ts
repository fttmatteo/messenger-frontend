import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - Happy Path', () => {
    test.beforeEach(async ({ page }) => {
        // Mock auth check (initially not logged in)
        await page.route('**/auth/check', async (route) => {
            await route.fulfill({
                status: 401,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Unauthorized' }),
            });
        });

        // Mock login
        await page.route('**/auth/login', async (route) => {
            if (route.request().method() === 'POST') {
                // Not parsing body to avoid unused var lint error
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        token: 'fake-jwt-token',
                        refreshToken: 'fake-refresh-token',
                        role: 'ADMIN'
                    }),
                });
            }
        });
    });

    test('should login successfully as admin', async ({ page }) => {
        // 1. Visit login page
        await page.goto('/login');

        // Visual Snapshot Baseline (Commented out for CI stability across OS - Mac vs Linux rendering differs)
        // await expect(page).toHaveScreenshot('login-page.png');

        await expect(page).toHaveTitle(/PLAK/);
        await expect(page.getByText('Inicio de sesión')).toBeVisible();

        // 2. Mock auth check to return success after login call
        await page.route('**/auth/check', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    id: 1,
                    document: 123456,
                    fullName: 'Admin Test',
                    role: 'ADMIN',
                    isOnline: true
                }),
            });
        });

        // 3. Fill form
        await page.getByPlaceholder('Ingrese su número de documento').fill('123456');
        await page.getByPlaceholder('Ingrese su contraseña').fill('password123');
        await page.getByRole('button', { name: 'Iniciar sesión' }).click();

        // 4. Verify redirection to dashboard
        await expect(page).toHaveURL(/\//);

        // Wait for dashboard elements to be visible
        await expect(page.locator('#main-content')).toBeVisible();
        await expect(page.getByPlaceholder('Buscar...').first()).toBeVisible();

        // Check for sidebar menu items
        await expect(page.getByText('Panel', { exact: true })).toBeVisible();
        await expect(page.getByText('Servicios', { exact: true })).toBeVisible();
    });

    test('should show validation errors on login', async ({ page }) => {
        await page.goto('/login');
        await page.getByRole('button', { name: 'Iniciar sesión' }).click();

        await expect(page.getByText('El documento es requerido')).toBeVisible();
        await expect(page.getByText('La contraseña es requerida')).toBeVisible();
    });

    test('should load monitoring map', async ({ page }) => {
        // 1. Perform Login (reuse logic or perform it again for independence)
        await page.goto('/login');
        await page.route('**/auth/check', async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 1, role: 'ADMIN' }) });
        });
        await page.getByPlaceholder('Ingrese su número de documento').fill('123456');
        await page.getByPlaceholder('Ingrese su contraseña').fill('password123');
        await page.getByRole('button', { name: 'Iniciar sesión' }).click();

        // 2. Navigate to Tracking
        await page.getByText('Monitoreo', { exact: true }).click();
        await expect(page).toHaveURL(/\/tracking/);

        // 3. Check for map container (using CSS or role if possible)
        // Adjust this if your Map component has a specific data-testid or role
        await expect(page.locator('div.gm-style, [id^="map-"]')).toBeVisible({ timeout: 10000 });
    });

    test('should create a new dealership successfully', async ({ page }) => {
        // 1. Login
        await page.goto('/login');
        await page.route('**/auth/check', async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 1, role: 'ADMIN' }) });
        });
        await page.getByPlaceholder('Ingrese su número de documento').fill('123456');
        await page.getByPlaceholder('Ingrese su contraseña').fill('password123');
        await page.getByRole('button', { name: 'Iniciar sesión' }).click();

        // 2. Navigate to Create Dealership
        await page.goto('/admin/concesionarios/crear');

        // 3. Mock dealership creation response
        await page.route('**/dealerships/createDealership', async (route) => {
            if (route.request().method() === 'POST') {
                await route.fulfill({
                    status: 201,
                    contentType: 'application/json',
                    body: JSON.stringify({ idDealership: 99, name: 'E2E Dealership' }),
                });
            }
        });

        // Mock geocoding call
        await page.route('**/dealerships/geocodeDealership/*', async (route) => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
        });

        // Mock list call (for after redirection)
        await page.route('**/dealerships/allDealerships', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ idDealership: 99, name: 'E2E Dealership', address: 'Calle Falsa 123', phone: '3004005060', zone: 'NORTE' }]),
            });
        });

        // 4. Fill form
        await page.getByLabel('Nombre del concesionario').fill('E2E Dealership');
        await page.getByLabel('Teléfono').fill('3004005060');
        await page.getByLabel('Dirección completa').fill('Calle Falsa 123');

        // Select zone
        await page.locator('#zone').click();
        await page.getByRole('option', { name: 'Norte' }).click();

        // 5. Submit
        await page.getByRole('button', { name: 'Crear concesionario' }).click();

        // 6. Verify success and redirection
        // In the app, it redirects to /admin/concesionarios
        await expect(page).toHaveURL(/\/concesionarios$/);

        // Check for success toast if possible (toast might be 'Concesionario creado...')
        // await expect(page.getByText(/exitosamente/i)).toBeVisible();
    });
});
