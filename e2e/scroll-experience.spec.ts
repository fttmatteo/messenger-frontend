import { test, expect } from '@playwright/test';

/**
 * Pruebas de navegación y experiencia de usuario (UX) relacionadas con el scroll.
 * Verifica que las optimizaciones de scroll, barras de desplazamiento y 
 * comportamiento dinámico del botón flotante (FAB) funcionen correctamente.
 */
test.describe('Experiencia de Scroll y UX Premium', () => {
    test.beforeEach(async ({ page }) => {
        // Ignorar Turnstile de Cloudflare en tests
        await page.route('https://challenges.cloudflare.com/**', route => route.abort());

        // Mock de sesión para entrar al messenger (Usando llaves correctas de AuthContext)
        await page.addInitScript(() => {
            const userObj = { 
                id: 1, 
                uuid: 'umessenger-1', 
                document: 12345678, 
                role: 'MESSENGER', 
                name: 'Test Messenger',
                isOnline: true 
            };
            
            localStorage.setItem('role', 'MESSENGER');
            localStorage.setItem('user', JSON.stringify(userObj));
            
            // Mock de Turnstile global
            // @ts-expect-error - Mocking global object
            window.turnstile = {
                render: (_container: HTMLElement, options: { callback?: (token: string) => void }) => {
                    setTimeout(() => { if (options && options.callback) options.callback('mock-token'); }, 50);
                    return 'mock-id';
                },
                reset: () => { },
                remove: () => { }
            };
        });

        // Mock de servicios pendientes para habilitar el scroll en el Dashboard (40 servicios para asegurar scroll)
        await page.route('**/services/messenger/pending', async route => {
            const mockServices = Array.from({ length: 40 }, (_, i) => ({
                uuid: `service-${i}`,
                plate: { plateNumber: `ABC-${i}23`, plateType: 'PARTICULAR' },
                dealership: { idDealership: 1, name: 'Concesionario Test' },
                currentStatus: 'PENDING',
                createdAt: new Date().toISOString()
            }));
            await route.fulfill({ json: mockServices });
        });

        // Mock de datos de usuario/perfil
        await page.route('**/users/me', async route => {
            await route.fulfill({ json: { id: 1, role: 'MESSENGER', name: 'Test Messenger' } });
        });

        // Mock de WebSocket token
        await page.route('**/auth/ws-token', async route => {
            await route.fulfill({ json: { token: 'mock-ws-token' } });
        });

        await page.goto('/messenger');
        
        // Asegurar que estamos en la página correcta y no hubo redirección a /login
        await expect(page).toHaveURL(/.*\/messenger/);
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

        // Esperar a que la lista cargue
        await expect(page.locator('text=Concesionario Test').first()).toBeVisible();

        // El FAB debería ser visible inicialmente
        await expect(fab).toBeVisible();

        // Scroll profundo hacia abajo (800px)
        await mainContent.evaluate((el) => el.scrollTo({ top: 800, behavior: 'auto' }));
        
        // Playwright reintenta automáticamente hasta que el elemento se oculte por framer-motion
        await expect(fab).toBeHidden({ timeout: 5000 });

        // Scroll hacia arriba
        await mainContent.evaluate((el) => el.scrollTo({ top: 0, behavior: 'auto' }));
        
        // Verificar reaparición
        await expect(fab).toBeVisible({ timeout: 5000 });
    });

    test('los contenedores de scroll deben tener suavizado de scroll habilitado', async ({ page }) => {
        const mainContent = page.locator('#main-content');
        // Verificamos que tenga las clases de scroll o el comportamiento esperado
        await expect(mainContent).toHaveClass(/overflow-y-auto/);
        await expect(mainContent).toHaveClass(/custom-scrollbar/);
    });

    test('el contenedor del dashboard debe tener padding inferior suficiente para el scroll final', async ({ page }) => {
        // Buscamos el contenedor principal del dashboard (clase relativa pb-20)
        const dashboard = page.locator('div.flex.flex-col.p-3.gap-3.relative.min-h-full');
        const paddingBottom = await dashboard.evaluate((el) => getComputedStyle(el).paddingBottom);
        
        const paddingPx = parseInt(paddingBottom, 10);
        // pb-20 es 80px. Permitimos un margen si hay safe-areas.
        expect(paddingPx).toBeGreaterThanOrEqual(80);
    });
});
