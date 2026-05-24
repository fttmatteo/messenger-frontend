import { get, set, del } from 'idb-keyval'
import type { ServiceDelivery } from '@/features/delivery/types/service.types'
import { logger } from '@/shared/utils/logger'

const KEYS = {
    MESSENGER_SERVICES: 'messenger_services',
    CACHE_METADATA: 'cache_metadata',
} as const

interface CacheMetadata {
    lastSync: string
    version: number
}

/**
 * Servicio encargado de la gestión de la persistencia local de datos.
 * Utiliza IndexedDB (vía idb-keyval) para almacenar información de los servicios,
 * permitiendo un enfoque de "vistas sin conexión" (read-only offline views).
 */
class OfflineCacheService {
    private readonly CACHE_VERSION = 1
    private readonly MAX_CACHE_AGE_MS = 24 * 60 * 60 * 1000 // 24 hours

    /**
     * Guarda la lista de servicios del mensajero en el almacenamiento local.
     * @param services - Lista de servicios a persistir.
     */
    async cacheServices(services: ServiceDelivery[]): Promise<void> {
        try {
            await set(KEYS.MESSENGER_SERVICES, services)
            await this.updateCacheMetadata()
        } catch {
            // Error al cachear servicios, continuando de todos modos
        }
    }

    /**
     * Recupera los servicios almacenados localmente.
     * @returns Una promesa que resuelve a la lista de servicios o un array vacío si no hay datos.
     */
    async getCachedServices(): Promise<ServiceDelivery[]> {
        try {
            const services = await get<ServiceDelivery[]>(KEYS.MESSENGER_SERVICES)
            return services || []
        } catch (error) {
            logger.error('Error al leer los servicios en caché:', error)
            return []
        }
    }

    /**
     * Obtener servicios cacheados sincrónicamente desde la memoria si están disponibles.
     * Si no, devuelve un array vacío.
     */
    getCachedServicesSync(): ServiceDelivery[] {
        // Para el renderizado inicial no podemos usar async, así que devolvemos vacío.
        // El hook actualizará el estado después de la carga asíncrona.
        return []
    }

    /**
     * Elimina exclusivamente la lista de servicios de la caché.
     */
    async clearServices(): Promise<void> {
        try {
            await del(KEYS.MESSENGER_SERVICES)
        } catch {
            // Error al limpiar servicios cacheados, continuando de todos modos
        }
    }

    /**
     * Verifica si los datos en caché siguen siendo válidos según la versión y el tiempo de expiración.
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
     * Obtiene la fecha y hora de la última sincronización guardada.
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
     * Actualizar metadatos de caché con el timestamp actual
     */
    private async updateCacheMetadata(): Promise<void> {
        const metadata: CacheMetadata = {
            lastSync: new Date().toISOString(),
            version: this.CACHE_VERSION,
        }
        await set(KEYS.CACHE_METADATA, metadata)
    }

    /**
     * Borra por completo toda la información almacenada en el caché local.
     */
    async clearAll(): Promise<void> {
        try {
            await del(KEYS.MESSENGER_SERVICES)
            await del(KEYS.CACHE_METADATA)
        } catch {
            // Error al limpiar caché, continuando de todos modos
        }
    }
}

export const offlineCacheService = new OfflineCacheService()
