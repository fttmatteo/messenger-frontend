/** @vitest-environment node */
import { describe, it, expect } from 'vitest'
// @ts-ignore
import fs from 'fs'
// @ts-ignore
import path from 'path'
// @ts-ignore
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

    it('MessengerLayout debe aplicar pt-safe en el header', () => {
        const layoutPath = path.resolve(__dirname, '../layouts/MessengerLayout.tsx')
        const content = fs.readFileSync(layoutPath, 'utf-8')
        
        expect(content).toMatch(/<header[^>]*className=[^>]*pt-safe/)
    })

    it('AdminLayout debe aplicar pt-safe en SidebarHeader y SidebarInset', () => {
        const layoutPath = path.resolve(__dirname, '../layouts/AdminLayout.tsx')
        const content = fs.readFileSync(layoutPath, 'utf-8')
        
        expect(content).toContain('SidebarHeader className="border-b border-sidebar-border pt-safe"')
        expect(content).toContain('SidebarInset className="overflow-hidden flex flex-col h-screen pt-safe"')
    })

    it('Sonner toaster debe usar el offset dinámico con safe-area-bottom', () => {
        const sonnerPath = path.resolve(__dirname, '../components/ui/sonner.tsx')
        const content = fs.readFileSync(sonnerPath, 'utf-8')
        
        expect(content).toContain('calc(var(--safe-area-bottom) + 16px)')
    })

    it('MessengerDashboard debe tener padding inferior dinámico', () => {
        const dashboardPath = path.resolve(__dirname, '../pages/messenger/Dashboard.tsx')
        const content = fs.readFileSync(dashboardPath, 'utf-8')
        
        expect(content).toContain('pb-[calc(6rem+var(--safe-area-bottom))]')
        expect(content).toContain('bottom-[calc(1.5rem+var(--safe-area-bottom))]')
    })
})
