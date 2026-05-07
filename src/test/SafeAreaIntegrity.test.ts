/** @vitest-environment node */
import { describe, it, expect } from 'vitest'
// @ts-expect-error: Built-in Node.js modules are not in the browser tsconfig
import fs from 'fs'
// @ts-expect-error: Built-in Node.js modules are not in the browser tsconfig
import path from 'path'
// @ts-expect-error: Built-in Node.js modules are not in the browser tsconfig
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Este test asegura la integridad del sistema de Safe Areas.
 * Si alguien borra accidentalmente las variables CSS o las clases de utilidad,
 * este test fallará en el CI.
 */
describe('Safe Area Integrity Audit', () => {
    
    it('debe tener las variables safe-area definidas en tokens.css', () => {
        const tokensPath = path.resolve(__dirname, '../styles/tokens.css')
        const content = fs.readFileSync(tokensPath, 'utf-8')
        
        expect(content).toContain('--safe-area-top')
        expect(content).toContain('--safe-area-bottom')
        expect(content).toContain('env(safe-area-inset-top')
        expect(content).toContain('env(safe-area-inset-bottom')
    })

    it('debe tener las utilidades pt-safe y pb-safe en utilities.css', () => {
        const utilsPath = path.resolve(__dirname, '../styles/utilities.css')
        const content = fs.readFileSync(utilsPath, 'utf-8')
        
        expect(content).toContain('.pt-safe')
        expect(content).toContain('.pb-safe')
        expect(content).toContain('padding-top: var(--safe-area-top)')
        expect(content).toContain('padding-bottom: var(--safe-area-bottom)')
    })

    it('MessengerLayout debe aplicar pt-safe en el header y pb-safe en el main', () => {
        const layoutPath = path.resolve(__dirname, '../layouts/MessengerLayout.tsx')
        const content = fs.readFileSync(layoutPath, 'utf-8')
        
        expect(content).toContain('pt-safe')
        expect(content).toContain('pb-safe')
        expect(content).toMatch(/<header[^>]*pt-safe/)
        expect(content).toMatch(/<main[^>]*pb-safe/)
    })

    it('AdminLayout debe aplicar pt-safe y pb-safe', () => {
        const layoutPath = path.resolve(__dirname, '../layouts/AdminLayout.tsx')
        const content = fs.readFileSync(layoutPath, 'utf-8')
        
        expect(content).toContain('pt-safe')
        expect(content).toContain('pb-safe')
        expect(content).toMatch(/SidebarHeader[^>]*pt-safe/)
        expect(content).toMatch(/id="main-content"[^>]*pb-safe/)
    })

    it('No debe haber paddings duplicados en páginas estándar', () => {
        const messengerPagesDir = path.resolve(__dirname, '../pages/messenger')
        const pages = ['ServiceDetails.tsx', 'ServiciosPage.tsx', 'ConfiguracionPage.tsx', 'AppearancePage.tsx']
        
        pages.forEach(page => {
            const content = fs.readFileSync(path.join(messengerPagesDir, page), 'utf-8')
            expect(content).not.toContain('pb-safe')
        })
    })

    it('index.html debe tener viewport-fit=cover', () => {
        const htmlPath = path.resolve(__dirname, '../../index.html')
        const content = fs.readFileSync(htmlPath, 'utf-8')
        expect(content).toContain('viewport-fit=cover')
    })

    it('base.css debe tener fondo consistente y fill-available', () => {
        const cssPath = path.resolve(__dirname, '../styles/base.css')
        const content = fs.readFileSync(cssPath, 'utf-8')
        expect(content).toContain('background-color: var(--background)')
        expect(content).toContain('-webkit-fill-available')
    })

    it('Sonner toaster debe usar el offset dinámico con safe-area-bottom', () => {
        const sonnerPath = path.resolve(__dirname, '../components/ui/sonner.tsx')
        const content = fs.readFileSync(sonnerPath, 'utf-8')
        expect(content).toContain('calc(var(--safe-area-bottom) + 16px)')
    })

    it('Páginas con elementos fijos deben mantener el cálculo de seguridad', () => {
        const dashboardPath = path.resolve(__dirname, '../pages/messenger/Dashboard.tsx')
        const dashboardContent = fs.readFileSync(dashboardPath, 'utf-8')
        expect(dashboardContent).toContain('bottom-[calc(0.75rem+var(--safe-area-bottom))]')

        const statusPath = path.resolve(__dirname, '../pages/messenger/UpdateStatus.tsx')
        const statusContent = fs.readFileSync(statusPath, 'utf-8')
        expect(statusContent).toContain('pb-[calc(6rem+var(--safe-area-bottom))]')
    })
})
