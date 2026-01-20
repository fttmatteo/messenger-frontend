import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { NetworkProvider } from '../NetworkContext'
import { useNetwork } from '@/hooks/use-network'
import { offlineSyncService } from '@/services/offline-sync.service'
import type { OfflineAction } from '@/services/offline-sync.service'
import { toast } from 'sonner'
import type { ReactNode } from 'react'

vi.mock('@/services/offline-sync.service', () => ({
    offlineSyncService: {
        getPendingActions: vi.fn().mockResolvedValue([]),
        syncAll: vi.fn().mockResolvedValue(0),
        registerHandler: vi.fn(),
    },
}))

vi.mock('sonner', () => ({
    toast: Object.assign(vi.fn(), {
        success: vi.fn(),
        warning: vi.fn(),
        error: vi.fn(),
    }),
}))

const wrapper = ({ children }: { children: ReactNode }) => (
    <NetworkProvider>{children}</NetworkProvider>
)

/**
 * Suite de pruebas unitarias para el contexto de red (NetworkContext).
 * Evalúa la detección de estado online/offline, la sincronización automática
 * de acciones pendientes y la gestión de eventos de PWA (Service Worker).
 */
describe('NetworkContext', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        Object.defineProperty(navigator, 'onLine', {
            configurable: true,
            value: true,
        })
    })

    it('should initialize with current navigator.onLine state', () => {
        const { result } = renderHook(() => useNetwork(), { wrapper })
        expect(result.current.isOnline).toBe(true)
    })

    it('should update state and show toast when going offline', async () => {
        const { result } = renderHook(() => useNetwork(), { wrapper })

        await act(async () => {
            window.dispatchEvent(new Event('offline'))
        })

        expect(result.current.isOnline).toBe(false)
        expect(result.current.wasOffline).toBe(true)
        expect(toast.warning).toHaveBeenCalledWith('Sin conexión', expect.any(Object))
    })

    it('should sync actions and show toast when coming back online', async () => {
        const { result } = renderHook(() => useNetwork(), { wrapper })

        await act(async () => {
            window.dispatchEvent(new Event('offline'))
        })

        expect(result.current.isOnline).toBe(false)
        expect(result.current.wasOffline).toBe(true)

        vi.mocked(offlineSyncService.getPendingActions).mockResolvedValue([{ id: '1' } as unknown as OfflineAction])

        await act(async () => {
            window.dispatchEvent(new Event('online'))
        })

        expect(result.current.isOnline).toBe(true)

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('Conexión restaurada', expect.any(Object))
            expect(offlineSyncService.syncAll).toHaveBeenCalled()
        }, { timeout: 1000 })
    })

    it('should handle sw-offline-ready event', async () => {
        const { result } = renderHook(() => useNetwork(), { wrapper })

        await act(async () => {
            window.dispatchEvent(new CustomEvent('sw-offline-ready'))
        })

        expect(result.current.offlineReady).toBe(true)
    })

    it('should handle sw-need-refresh event', async () => {
        const { result } = renderHook(() => useNetwork(), { wrapper })

        await act(async () => {
            window.dispatchEvent(new CustomEvent('sw-need-refresh'))
        })

        expect(result.current.needRefresh).toBe(true)
        expect(toast).toHaveBeenCalledWith('Nueva versión disponible', expect.any(Object))
    })

    it('should call global __updateSW when updateServiceWorker is called', async () => {
        const mockUpdateSW = vi.fn()
        window.__updateSW = mockUpdateSW

        const { result } = renderHook(() => useNetwork(), { wrapper })

        await act(async () => {
            result.current.updateServiceWorker()
        })

        expect(mockUpdateSW).toHaveBeenCalledWith(true)
        expect(result.current.needRefresh).toBe(false)
    })
})
