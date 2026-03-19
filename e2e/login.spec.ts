import { test, expect } from '@playwright/test';

test.describe('Login E2E Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.route('https://challenges.cloudflare.com/**', route => route.abort());

        /* eslint-disable @typescript-eslint/no-explicit-any */
        await page.addInitScript(() => {
            // @ts-expect-error - Mocking global object
            window.turnstile = {
                render: (_container: any, options: any) => {
                    setTimeout(() => { if (options && options.callback) options.callback('mock-playwright-token'); }, 50);
                    return 'mock-widget-id';
                },
                reset: () => { },
                remove: () => { }
            };
        });
        /* eslint-enable @typescript-eslint/no-explicit-any */

        await page.goto('/login');
        await page.route('**/auth/ws-token', async route => {
            await route.fulfill({ json: { token: 'mock-ws-token' } });
        });
    });

    test('should show validation errors on empty submission', async ({ page }) => {
        await page.getByRole('button', { name: /iniciar sesión/i }).click();

        await expect(page.getByText('El documento es requerido')).toBeVisible();
        await expect(page.getByText('La contraseña es requerida')).toBeVisible();
    });

    test('should validate document format', async ({ page }) => {
        await page.getByPlaceholder('Ingrese su número de documento').fill('abc1234');
        await page.getByRole('button', { name: /iniciar sesión/i }).click();

        await expect(page.getByText('Solo se permiten números')).toBeVisible();
    });

    test('should toggle password visibility', async ({ page }) => {
        const passwordInput = page.getByPlaceholder('Ingrese su contraseña');
        await passwordInput.fill('secret');

        await expect(passwordInput).toHaveAttribute('type', 'password');

        await page.getByRole('button', { name: /toggle password visibility/i }).click();

        await expect(passwordInput).toHaveAttribute('type', 'text');
    });

    test('should handle successful login flow with backend mock', async ({ page }) => {
        await page.route('**/auth/login', async route => {
            const json = {
                role: 'ADMIN',
                message: 'Login exitoso',
                user: { id: 1, uuid: 'uadmin-1', document: 12345678, role: 'ADMIN', fullName: 'Test Admin' }
            };
            await route.fulfill({ json });
        });

        await page.getByPlaceholder('Ingrese su número de documento').fill('12345678');
        await page.getByPlaceholder('Ingrese su contraseña').fill('password123');

        await page.getByRole('button', { name: /iniciar sesión/i }).click();
        await expect(page).toHaveURL(/.*\/admin/);

        const role = await page.evaluate(() => sessionStorage.getItem('role'));
        expect(role).toBe('ADMIN');
    });
});
