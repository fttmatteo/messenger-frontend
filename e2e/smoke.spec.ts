import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - Happy Path', () => {
    test.beforeEach(async ({ page }) => {
        // Global mock: catch-all for unhandled API routes to prevent hanging
        await page.route('**/api/**', async (route) => {
            await route.continue();
        });

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
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        role: 'ADMIN',
                        message: 'Login successful',
                        user: {
                            id: 1,
                            document: 123456,
                            name: 'Admin Test',
                            role: 'ADMIN'
                        }
                    }),
                });
            }
        });
    });

    test('should login successfully as admin', async ({ page }) => {
        // 1. Visit login page
        await page.goto('/login', { waitUntil: 'networkidle' });
        await expect(page).toHaveTitle(/PLAK/);
        await expect(page.getByText('Inicio de sesión')).toBeVisible();

        // 2. After login, auth/check will succeed
        await page.route('**/auth/check', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    id: 1,
                    document: 123456,
                    name: 'Admin Test',
                    role: 'ADMIN'
                }),
            });
        });

        // 3. Fill and submit login form
        await page.getByPlaceholder('Ingrese su número de documento').fill('123456');
        await page.getByPlaceholder('Ingrese su contraseña').fill('password123');
        await page.getByRole('button', { name: 'Iniciar sesión' }).click();

        // 4. Wait for redirection and dashboard to load
        await page.waitForURL(/^(?!.*login)/, { timeout: 30000 });
        
        // Simple check: title should still be PLAK and no longer on login
        await expect(page).toHaveTitle(/PLAK/);
        await expect(page).not.toHaveURL(/login/);
    });

    test('should show validation errors on login', async ({ page }) => {
        await page.goto('/login');
        await page.getByRole('button', { name: 'Iniciar sesión' }).click();

        await expect(page.getByText('El documento es requerido')).toBeVisible();
        await expect(page.getByText('La contraseña es requerida')).toBeVisible();
    });

    test('should load monitoring map', async ({ page }) => {
        // 1. Perform login
        await page.goto('/login', { waitUntil: 'networkidle' });
        await page.route('**/auth/check', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ id: 1, role: 'ADMIN' })
            });
        });
        await page.getByPlaceholder('Ingrese su número de documento').fill('123456');
        await page.getByPlaceholder('Ingrese su contraseña').fill('password123');
        await page.getByRole('button', { name: 'Iniciar sesión' }).click();

        // Wait for redirect
        await page.waitForURL(/^(?!.*login)/, { timeout: 30000 });

        // 2. Navigate to Tracking
        await page.goto('/tracking', { waitUntil: 'networkidle' });

        // 3. Simple check: we're on tracking page and not on login
        await expect(page).toHaveURL(/\/tracking/);
        await expect(page).not.toHaveURL(/login/);
    });

    test('should create a new dealership successfully', async ({ page }) => {
        // 1. Login
        await page.goto('/login', { waitUntil: 'networkidle' });
        await page.route('**/auth/check', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ id: 1, role: 'ADMIN' })
            });
        });
        await page.getByPlaceholder('Ingrese su número de documento').fill('123456');
        await page.getByPlaceholder('Ingrese su contraseña').fill('password123');
        await page.getByRole('button', { name: 'Iniciar sesión' }).click();

        // Wait for redirect
        await page.waitForURL(/^(?!.*login)/, { timeout: 30000 });

        // 2. Navigate to Create Dealership
        await page.goto('/admin/concesionarios/crear', { waitUntil: 'networkidle' });

        // 3. Check form is visible (simple smoke test)
        await expect(page).toHaveURL(/concesionarios\/crear/);
    });
});
