import { describe, it, expect, vi, beforeEach } from 'vitest'
import { offlineSyncService, type OfflineAction } from '../offline-sync.service'
import { get, set } from 'idb-keyval'

// Mock idb-keyval
vi.mock('idb-keyval', () => ({
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
}))

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
    randomUUID: () => '550e8400-e29b-41d4-a716-446655440000',
    // We cast to unknown then Crypto to avoid lint/type errors while providing a simple mock
} as unknown as Crypto)

describe('OfflineSyncService', () => {
    beforeEach(async () => {
        vi.clearAllMocks()
        await offlineSyncService.clearAll()

        // Mock navigator.onLine
        Object.defineProperty(navigator, 'onLine', {
            configurable: true,
            value: true,
        })
    })

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

    it('should retrieve pending actions', async () => {
        const mockActions: OfflineAction[] = [
            { id: '1', type: 'UPDATE_STATUS', payload: {}, timestamp: Date.now(), retryCount: 0 }
        ]
        vi.mocked(get).mockResolvedValue(mockActions)

        const actions = await offlineSyncService.getPendingActions()
        expect(actions).toEqual(mockActions)
    })

    it('should remove an action', async () => {
        const mockActions: OfflineAction[] = [
            { id: '1', type: 'UPDATE_STATUS', payload: {}, timestamp: Date.now(), retryCount: 0 },
            { id: '2', type: 'CREATE_SERVICE', payload: {}, timestamp: Date.now(), retryCount: 0 }
        ]
        vi.mocked(get).mockResolvedValue(mockActions)

        await offlineSyncService.removeAction('1')

        expect(set).toHaveBeenCalledWith('pending_offline_actions', [mockActions[1]])
    })

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

    it('should increment retry count on failure', async () => {
        const handler = vi.fn().mockResolvedValue(false)
        offlineSyncService.registerHandler('UPDATE_STATUS', handler)

        const mockActions: OfflineAction[] = [
            { id: '1', type: 'UPDATE_STATUS', payload: {}, timestamp: Date.now(), retryCount: 0 }
        ]
        vi.mocked(get).mockResolvedValue(mockActions)

        await offlineSyncService.syncAll()

        expect(set).toHaveBeenCalledWith('pending_offline_actions', [
            expect.objectContaining({ id: '1', retryCount: 1 })
        ])
    })

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
