import { vi, describe, it, expect, beforeEach } from 'vitest'
import { get, set, del } from 'idb-keyval'
import { offlineCacheService } from '../offline-cache.service'

vi.mock('idb-keyval', () => ({
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
}))

describe('OfflineCacheService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('cacheServices', () => {
        it('should cache services and update metadata', async () => {
            const mockServices = [{ idServiceDelivery: 1 } as unknown as import('@/features/delivery/types/service.types').ServiceDelivery]
            await offlineCacheService.cacheServices(mockServices)

            expect(set).toHaveBeenCalledWith('messenger_services', mockServices)
            expect(set).toHaveBeenCalledWith('cache_metadata', expect.objectContaining({
                version: 1,
                lastSync: expect.any(String)
            }))
        })

        it('should handle errors silently', async () => {
            vi.mocked(set).mockRejectedValue(new Error('Write error'))
            await expect(offlineCacheService.cacheServices([])).resolves.not.toThrow()
        })
    })

    describe('getCachedServices', () => {
        it('should return services from DB', async () => {
            const mockServices = [{ id: 1 }]
            vi.mocked(get).mockResolvedValue(mockServices)
            const result = await offlineCacheService.getCachedServices()
            expect(result).toEqual(mockServices)
        })

        it('should return empty array if null in DB', async () => {
            vi.mocked(get).mockResolvedValue(null)
            const result = await offlineCacheService.getCachedServices()
            expect(result).toEqual([])
        })

        it('should return empty array and log error if DB fails', async () => {
            vi.mocked(get).mockRejectedValue(new Error('DB Error'))
            const result = await offlineCacheService.getCachedServices()
            expect(result).toEqual([])
        })
    })

    describe('isCacheValid', () => {
        it('should return false if no metadata', async () => {
            vi.mocked(get).mockResolvedValue(null)
            expect(await offlineCacheService.isCacheValid()).toBe(false)
        })

        it('should return false if version mismatch', async () => {
            vi.mocked(get).mockResolvedValue({ version: 2, lastSync: new Date().toISOString() })
            expect(await offlineCacheService.isCacheValid()).toBe(false)
        })

        it('should return false if expired', async () => {
            const expiredDate = new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString()
            vi.mocked(get).mockResolvedValue({ version: 1, lastSync: expiredDate })
            expect(await offlineCacheService.isCacheValid()).toBe(false)
        })

        it('should return true if valid and recent', async () => {
            vi.mocked(get).mockResolvedValue({ version: 1, lastSync: new Date().toISOString() })
            expect(await offlineCacheService.isCacheValid()).toBe(true)
        })

        it('should return false if get fails', async () => {
            vi.mocked(get).mockRejectedValue(new Error())
            expect(await offlineCacheService.isCacheValid()).toBe(false)
        })
    })

    describe('clear operations', () => {
        it('should clear only services', async () => {
            await offlineCacheService.clearServices()
            expect(del).toHaveBeenCalledWith('messenger_services')
        })

        it('should clear everything', async () => {
            await offlineCacheService.clearAll()
            expect(del).toHaveBeenCalledWith('messenger_services')
            expect(del).toHaveBeenCalledWith('cache_metadata')
        })

        it('should handle clear errors silently', async () => {
            vi.mocked(del).mockRejectedValue(new Error())
            await expect(offlineCacheService.clearAll()).resolves.not.toThrow()
        })
    })

    describe('getLastSyncTime', () => {
        it('should return Date if exists', async () => {
            const now = new Date()
            vi.mocked(get).mockResolvedValue({ lastSync: now.toISOString() })
            const result = await offlineCacheService.getLastSyncTime()
            expect(result?.getTime()).toBe(now.getTime())
        })

        it('should return null if not exists', async () => {
            vi.mocked(get).mockResolvedValue(null)
            expect(await offlineCacheService.getLastSyncTime()).toBeNull()
        })
    })

    describe('getCachedServicesSync', () => {
        it('should return empty array', () => {
            expect(offlineCacheService.getCachedServicesSync()).toEqual([])
        })
    })
})
