import { test, expect } from '@playwright/test';

/**
 * Pruebas de navegación y experiencia de usuario (UX) relacionadas con el scroll.
 * Verifica que las optimizaciones de scroll, barras de desplazamiento y 
 * comportamiento dinámico del botón flotante (FAB) funcionen correctamente.
 */
test.describe('Experiencia de Scroll y UX Premium', () => {
    test.beforeEach(async ({ page }) => {
        await page.route('https://challenges.cloudflare.com/**', route => route.abort());

        await page.addInitScript(() => {
            sessionStorage.setItem('role', 'MESSENGER');
            // @ts-expect-error - Mocking global object
            window.turnstile = {
                render: (_container: any, options: any) => {
                    setTimeout(() => { if (options && options.callback) options.callback('mock-token'); }, 50);
                    return 'mock-id';
                },
                reset: () => { },
                remove: () => { }
            };
            
            localStorage.setItem('auth-storage', JSON.stringify({
                state: { 
                    user: { id: 1, uuid: 'umessenger-1', document: 12345678, role: 'MESSENGER', fullName: 'Test Messenger' },
                    isAuthenticated: true 
                }
            }));
        });

        await page.route('**/services/messenger/pending', async route => {
            const mockServices = Array.from({ length: 15 }, (_, i) => ({
                uuid: `service-${i}`,
                plate: { plateNumber: `ABC-${i}23`, plateType: 'PARTICULAR' },
                dealership: { idDealership: 1, name: 'Concesionario Test' },
                currentStatus: 'PENDING',
                createdAt: new Date().toISOString()
            }));
            await route.fulfill({ json: mockServices });
        });

        await page.route('**/users/me', async route => {
            await route.fulfill({ json: { id: 1, role: 'MESSENGER', fullName: 'Test Messenger' } });
        });

        await page.goto('/messenger');
    });

    test('debe aplicar configuraciones de scroll globales (overscroll y smooth)', async ({ page }) => {
        const styles = await page.evaluate(() => {
            const html = getComputedStyle(document.documentElement);
            return {
                overscroll: html.overscrollBehavior,
                scrollBehavior: html.scrollBehavior
            };
        });

        expect(styles.overscroll).toBe('none');
        expect(styles.scrollBehavior).toBe('smooth');
    });

    test('el botón flotante (FAB) debe ocultarse al bajar y aparecer al subir', async ({ page }) => {
        const mainContent = page.locator('#main-content');
        const fab = page.locator('button:has(svg.lucide-plus)');

        await expect(fab).toBeVisible();

        await mainContent.evaluate((el) => el.scrollTop = 300);
        
        await page.waitForTimeout(500);
        await expect(fab).not.toBeVisible();

        await mainContent.evaluate((el) => el.scrollTop = 0);
        
        await page.waitForTimeout(500);
        await expect(fab).toBeVisible();
    });

    test('los contenedores de scroll deben tener suavizado webkit-touch habilitado', async ({ page }) => {
        const hasWebkitTouch = await page.evaluate(() => {
            const el = document.getElementById('main-content');
            return el ? (getComputedStyle(el) as any)['webkitOverflowScrolling'] === 'touch' : false;
        });
        expect(hasWebkitTouch).toBe(true);
    });

    test('el contenedor del dashboard debe tener padding inferior suficiente para el scroll final', async ({ page }) => {
        const dashboard = page.locator('.flex.flex-col.p-3.gap-3.relative.min-h-full');
        const paddingBottom = await dashboard.evaluate((el) => getComputedStyle(el).paddingBottom);
        
        const paddingPx = parseInt(paddingBottom, 10);
        expect(paddingPx).toBeGreaterThanOrEqual(80);
    });
});
