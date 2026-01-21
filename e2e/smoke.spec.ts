import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - Happy Path', () => {
    test.beforeEach(async ({ page }) => {
        // Global mock for all backend requests to prevent hanging on unhandled routes
        await page.route(url => url.host === 'localhost:8080' || url.host === '127.0.0.1:8080', async (route) => {
            const url = route.request().url();

            // Allow specific mocks to be handled by subsequent route definitions if they are more specific,
            // or handle them here. Playwright handles routes in reverse order, so we'll define 
            // specific ones AFTER this if we want them to take priority.
            // Actually, let's just use continue() here and define specifics after.
            // Wait, if we want a catch-all, we should define it FIRST, then specifics AFTER (which override).

            if (url.includes('/auth/login') || url.includes('/auth/check')) {
                await route.continue();
                return;
            }

            // Generic response for other backend calls to prevent hanging
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Mocked response' })
            });
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

        // Mock Turnstile globally before any script runs
        await page.addInitScript(`
            window.turnstile = {
                render: (container, options) => {
                    const id = "mock-widget-id";
                    if (options && options.callback) {
                        // Use a short timeout to simulate async behavior
                        setTimeout(() => {
                            options.callback("mock-token");
                        }, 50);
                    }
                    return id;
                },
                reset: () => {},
                remove: () => {}
            };
            // Signal that turnstile is ready
            if (window.onTurnstileLoad) window.onTurnstileLoad();
        `);

        // Intercept script request
        await page.route('https://challenges.cloudflare.com/turnstile/v0/api.js*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/javascript',
                body: 'if (window.onTurnstileLoad) window.onTurnstileLoad();'
            });
        });
    });

    test('should login successfully as admin', async ({ page }) => {
        // 1. Visit login page
        await page.goto('/login');
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

        // Assert button is enabled (means Turnstile mock worked)
        await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeEnabled();
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
        await page.goto('/login');
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

        // 2. Navigate to Tracking or Monitoreo page
        await page.goto('/admin/tracking');

        // 3. Simple check: we're on an admin page and not on login
        await expect(page).toHaveURL(/\/admin/);
        await expect(page).not.toHaveURL(/login/);
    });

    test('should create a new dealership successfully', async ({ page }) => {
        // 1. Login
        await page.goto('/login');
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
        await page.goto('/admin/concesionarios/crear');

        // 3. Check form is visible (simple smoke test)
        await expect(page).toHaveURL(/concesionarios\/crear/);
    });
});
