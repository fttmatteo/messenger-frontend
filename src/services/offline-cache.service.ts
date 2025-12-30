import { get, set, del } from 'idb-keyval'
import type { ServiceDelivery } from '@/types/service.types'

const KEYS = {
    MESSENGER_SERVICES: 'messenger_services',
    CACHE_METADATA: 'cache_metadata',
} as const

interface CacheMetadata {
    lastSync: string
    version: number
}

/**
 * Service for caching data locally using IndexedDB via idb-keyval.
 * Provides offline-first data access for critical app data.
 */
class OfflineCacheService {
    private readonly CACHE_VERSION = 1
    private readonly MAX_CACHE_AGE_MS = 24 * 60 * 60 * 1000 // 24 hours

    /**
     * Cache services for the messenger
     */
    async cacheServices(services: ServiceDelivery[]): Promise<void> {
        try {
            await set(KEYS.MESSENGER_SERVICES, services)
            await this.updateCacheMetadata()
        } catch (error) {
            console.error('Error caching services:', error)
        }
    }

    /**
     * Get cached services (returns empty array if no cache)
     */
    async getCachedServices(): Promise<ServiceDelivery[]> {
        try {
            const services = await get<ServiceDelivery[]>(KEYS.MESSENGER_SERVICES)
            return services || []
        } catch (error) {
            console.error('Error reading cached services:', error)
            return []
        }
    }

    /**
     * Get cached services synchronously from memory if available
     * Falls back to empty array
     */
    getCachedServicesSync(): ServiceDelivery[] {
        // For initial render, we can't use async, so return empty
        // The hook will update state after async load
        return []
    }

    /**
     * Clear all cached services
     */
    async clearServices(): Promise<void> {
        try {
            await del(KEYS.MESSENGER_SERVICES)
        } catch (error) {
            console.error('Error clearing cached services:', error)
        }
    }

    /**
     * Check if cache is valid (not expired)
     */
    async isCacheValid(): Promise<boolean> {
        try {
            const metadata = await get<CacheMetadata>(KEYS.CACHE_METADATA)

            if (!metadata) return false
            if (metadata.version !== this.CACHE_VERSION) return false

            const lastSync = new Date(metadata.lastSync).getTime()
            const now = Date.now()

            return (now - lastSync) < this.MAX_CACHE_AGE_MS
        } catch {
            return false
        }
    }

    /**
     * Get the last sync timestamp
     */
    async getLastSyncTime(): Promise<Date | null> {
        try {
            const metadata = await get<CacheMetadata>(KEYS.CACHE_METADATA)
            return metadata ? new Date(metadata.lastSync) : null
        } catch {
            return null
        }
    }

    /**
     * Update cache metadata with current timestamp
     */
    private async updateCacheMetadata(): Promise<void> {
        const metadata: CacheMetadata = {
            lastSync: new Date().toISOString(),
            version: this.CACHE_VERSION,
        }
        await set(KEYS.CACHE_METADATA, metadata)
    }

    /**
     * Clear all cached data
     */
    async clearAll(): Promise<void> {
        try {
            await del(KEYS.MESSENGER_SERVICES)
            await del(KEYS.CACHE_METADATA)
        } catch (error) {
            console.error('Error clearing cache:', error)
        }
    }
}

export const offlineCacheService = new OfflineCacheService()
