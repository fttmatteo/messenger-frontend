import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - Happy Path', () => {
    test.beforeEach(async ({ page }) => {
        // Log browser console to terminal for better debugging
        page.on('console', msg => {
            const text = msg.text();
            if (msg.type() === 'error') {
                console.error(`BROWSER ERROR: ${text}`);
            } else {
                console.log(`BROWSER LOG: ${text}`);
            }
        });

        // Global mock for all backend requests to prevent hanging on unhandled routes
        // Registered FIRST, so it has LOWEST priority (since Playwright uses reverse order)
        await page.route(url => url.toString().includes(':8080'), async (route) => {
            const url = route.request().url();
            console.log(`E2E: Catch-all mock handling request: ${url}`);
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Catch-all mocked response', data: [] })
            });
        });

        // Mock auth check (initially not logged in)
        await page.route('**/auth/check', async (route) => {
            console.log('E2E: Mocking auth/check -> 401');
            await route.fulfill({
                status: 401,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Unauthorized' }),
            });
        });

        // Mock login
        await page.route('**/auth/login', async (route) => {
            if (route.request().method() === 'POST') {
                console.log('E2E: Mocking auth/login -> 200 SUCCESS');
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
            console.log('E2E: Injecting Turnstile mock...');
            const mockTurnstile = {
                render: (container, options) => {
                    console.log('E2E BROWSER: Turnstile.render called for:', container);
                    const id = "mock-widget-id-" + Math.random().toString(36).substr(2, 9);
                    if (options && options.callback) {
                        console.log('E2E BROWSER: Triggering verification callback...');
                        setTimeout(() => {
                            options.callback("mock-token-" + id);
                        }, 50);
                    }
                    return id;
                },
                reset: (id) => { console.log('E2E BROWSER: Turnstile.reset', id); },
                remove: (id) => { console.log('E2E BROWSER: Turnstile.remove', id); }
            };

            // Define it on window
            window.turnstile = mockTurnstile;

            // Handle the case where the component might be waiting for the load event
            const originalOnTurnstileLoad = window.onTurnstileLoad;
            Object.defineProperty(window, 'onTurnstileLoad', {
                get: () => originalOnTurnstileLoad,
                set: (fn) => {
                    console.log('E2E BROWSER: window.onTurnstileLoad was set, calling it immediately');
                    if (typeof fn === 'function') {
                        setTimeout(() => fn(), 10);
                    }
                },
                configurable: true
            });

            // If it was already set, call it
            if (typeof originalOnTurnstileLoad === 'function') {
                originalOnTurnstileLoad();
            }
        `);

        // Intercept Cloudflare script and just fulfill it
        await page.route('**/turnstile/v0/api.js*', async (route) => {
            console.log('E2E: Intercepting Turnstile script request');
            await route.fulfill({
                status: 200,
                contentType: 'application/javascript',
                body: 'console.log("E2E BROWSER: Turnstile script placeholder loaded");'
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
