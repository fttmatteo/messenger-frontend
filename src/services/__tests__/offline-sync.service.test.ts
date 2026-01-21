import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { offlineSyncService, type OfflineAction } from '../offline-sync.service'
import { get, set } from 'idb-keyval'

// Mock de idb-keyval
vi.mock('idb-keyval', () => ({
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
}))

// Mock de crypto.randomUUID
vi.stubGlobal('crypto', {
    randomUUID: () => '550e8400-e29b-41d4-a716-446655440000',
    // Hacemos el cast a unknown y luego a Crypto para evitar errores de tipo mientras proporcionamos un mock simple
} as unknown as Crypto)

/**
 * Suite de pruebas unitarias para OfflineSyncService.
 * Verifica la puesta en cola, recuperación, sincronización y reintento de acciones offline utilizando IndexedDB mockeado.
 */
describe('OfflineSyncService', () => {
    beforeEach(async () => {
        vi.clearAllMocks()
        vi.useFakeTimers()
        await offlineSyncService.clearAll()

        // Mock de navigator.onLine (por defecto true en setup.ts, pero lo aseguramos)
        Object.defineProperty(navigator, 'onLine', {
            configurable: true,
            value: true,
        })
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    /**
     * Verifica que una acción se agregue correctamente a la cola de pendientes en IndexedDB.
     */
    it('should queue an action correctly', async () => {
        vi.mocked(get).mockResolvedValue([])

        await offlineSyncService.queueAction('UPDATE_STATUS', { id: 1, status: 'DONE' })

        expect(set).toHaveBeenCalledWith('pending_offline_actions', expect.arrayContaining([
            expect.objectContaining({
                type: 'UPDATE_STATUS',
                payload: { id: 1, status: 'DONE' },
                retryCount: 0
            })
        ]))
    })

    /**
     * Verifica que la actualización optimista se ejecute al encolar.
     */
    it('should execute optimistic update when queuing', async () => {
        vi.mocked(get).mockResolvedValue([])
        const optimisticUpdate = vi.fn().mockResolvedValue(undefined)

        await offlineSyncService.queueAction('UPDATE_STATUS', { id: 1 }, { optimisticUpdate })

        expect(optimisticUpdate).toHaveBeenCalled()
    })

    /**
     * Verifica la recuperación de todas las acciones pendientes.
     */
    it('should retrieve pending actions', async () => {
        const mockActions: OfflineAction[] = [
            { id: '1', type: 'UPDATE_STATUS', payload: {}, timestamp: Date.now(), retryCount: 0 }
        ]
        vi.mocked(get).mockResolvedValue(mockActions)

        const actions = await offlineSyncService.getPendingActions()
        expect(actions).toEqual(mockActions)
    })

    /**
     * Verifica que una acción específica se elimine correctamente de la cola.
     */
    it('should remove an action', async () => {
        const mockActions: OfflineAction[] = [
            { id: '1', type: 'UPDATE_STATUS', payload: {}, timestamp: Date.now(), retryCount: 0 },
            { id: '2', type: 'CREATE_SERVICE', payload: {}, timestamp: Date.now(), retryCount: 0 }
        ]
        vi.mocked(get).mockResolvedValue(mockActions)

        await offlineSyncService.removeAction('1')

        expect(set).toHaveBeenCalledWith('pending_offline_actions', [mockActions[1]])
    })

    /**
     * Verifica el proceso completo de sincronización cuando las acciones son procesadas exitosamente por sus handlers.
     */
    it('should handle syncAll with registered handlers', async () => {
        const handler = vi.fn().mockResolvedValue(true)
        offlineSyncService.registerHandler('UPDATE_STATUS', handler)

        const mockActions: OfflineAction[] = [
            { id: '1', type: 'UPDATE_STATUS', payload: { foo: 'bar' }, timestamp: Date.now(), retryCount: 0 }
        ]
        vi.mocked(get).mockResolvedValue(mockActions)

        const syncedCount = await offlineSyncService.syncAll()

        expect(handler).toHaveBeenCalledWith(mockActions[0])
        expect(syncedCount).toBe(1)
        expect(set).toHaveBeenCalledWith('pending_offline_actions', [])
    })

    /**
     * Verifica que el contador de reintentos se incremente y se establezca nextRetryAfter si un handler falla.
     */
    it('should increment retry count and set backoff on failure', async () => {
        const handler = vi.fn().mockResolvedValue(false)
        offlineSyncService.registerHandler('UPDATE_STATUS', handler)

        const startTime = Date.now()
        const mockActions: OfflineAction[] = [
            { id: '1', type: 'UPDATE_STATUS', payload: {}, timestamp: startTime, retryCount: 0 }
        ]
        vi.mocked(get).mockResolvedValue(mockActions)

        await offlineSyncService.syncAll()

        expect(set).toHaveBeenCalledWith('pending_offline_actions', expect.arrayContaining([
            expect.objectContaining({
                id: '1',
                retryCount: 1,
                nextRetryAfter: startTime + (1 * 60 * 1000) // 1 minuto de backoff inicial
            })
        ]))
    })

    /**
     * Verifica que no se intente sincronizar una acción si aún no ha pasado su tiempo de reintento.
     */
    it('should skip actions that are still in backoff period', async () => {
        const handler = vi.fn()
        offlineSyncService.registerHandler('UPDATE_STATUS', handler)

        const now = Date.now()
        const mockActions: OfflineAction[] = [
            {
                id: '1',
                type: 'UPDATE_STATUS',
                payload: {},
                timestamp: now - 10000,
                retryCount: 1,
                nextRetryAfter: now + 30000 // Faltan 30 segundos
            }
        ]
        vi.mocked(get).mockResolvedValue(mockActions)

        const syncedCount = await offlineSyncService.syncAll()

        expect(syncedCount).toBe(0)
        expect(handler).not.toHaveBeenCalled()
    })

    /**
     * Verifica que se sincronice después de que haya pasado el tiempo de backoff.
     */
    it('should sync action after backoff period has passed', async () => {
        const handler = vi.fn().mockResolvedValue(true)
        offlineSyncService.registerHandler('UPDATE_STATUS', handler)

        const now = Date.now()
        const mockActions: OfflineAction[] = [
            {
                id: '1',
                type: 'UPDATE_STATUS',
                payload: {},
                timestamp: now - 70000,
                retryCount: 1,
                nextRetryAfter: now - 10000 // Pasó hace 10 segundos
            }
        ]
        vi.mocked(get).mockResolvedValue(mockActions)

        const syncedCount = await offlineSyncService.syncAll()

        expect(syncedCount).toBe(1)
        expect(handler).toHaveBeenCalled()
    })

    /**
     * Verifica que una acción se elimine permanentemente después de exceder el número máximo de reintentos.
     */
    it('should remove action after max retries', async () => {
        const handler = vi.fn().mockResolvedValue(false)
        offlineSyncService.registerHandler('UPDATE_STATUS', handler)

        const mockActions: OfflineAction[] = [
            { id: '1', type: 'UPDATE_STATUS', payload: {}, timestamp: Date.now(), retryCount: 3 }
        ]
        vi.mocked(get).mockResolvedValue(mockActions)

        await offlineSyncService.syncAll()

        expect(set).toHaveBeenCalledWith('pending_offline_actions', [])
    })

    /**
     * Verifica que la sincronización no se intente si el navegador está offline.
     */
    it('should not sync when offline', async () => {
        Object.defineProperty(navigator, 'onLine', {
            configurable: true,
            value: false,
        })

        const handler = vi.fn()
        offlineSyncService.registerHandler('UPDATE_STATUS', handler)

        const syncedCount = await offlineSyncService.syncAll()

        expect(syncedCount).toBe(0)
        expect(handler).not.toHaveBeenCalled()
    })
})
