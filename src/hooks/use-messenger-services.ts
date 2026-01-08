import { useState, useEffect, useCallback, useMemo } from 'react'
import { serviceDeliveryService } from '@/services/service.service'
import type { ServiceDelivery } from '@/types/service.types'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/error-utils'
import { offlineCacheService } from '@/services/offline-cache.service'

interface UseMessengerServicesReturn {
    services: ServiceDelivery[]
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
    pendingServices: ServiceDelivery[]
    completedServices: ServiceDelivery[]
    stats: {
        total: number
        pending: number
        delivered: number
        returned: number
    }
    /** Whether the data is from cache (offline mode) */
    isFromCache: boolean
}

/**
 * Hook para gestionar servicios del mensajero.
 * Filtra automáticamente por pendientes/completados y calcula estadísticas.
 * Implementa offline-first: carga del cache primero, luego sincroniza con el servidor.
 */
export function useMessengerServices(): UseMessengerServicesReturn {
    const [services, setServices] = useState<ServiceDelivery[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isFromCache, setIsFromCache] = useState(false)

    // Load cached data on mount (before network request)
    useEffect(() => {
        const loadCachedData = async () => {
            try {
                const cached = await offlineCacheService.getCachedServices()
                if (cached.length > 0) {
                    setServices(cached)
                    setIsFromCache(true)
                }
            } catch {
                // Failed to load cached services, continuing anyway
            }
        }
        loadCachedData()
    }, [])

    const fetchServices = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await serviceDeliveryService.getAll()
            // Sort by creation date (newest first)
            const sorted = data.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            setServices(sorted)
            setIsFromCache(false)

            // Cache the fresh data for offline use
            await offlineCacheService.cacheServices(sorted)
        } catch (err) {
            const message = getErrorMessage(err)

            // If offline and we have cached data, don't show error
            if (!navigator.onLine) {
                const cached = await offlineCacheService.getCachedServices()
                if (cached.length > 0) {
                    setServices(cached)
                    setIsFromCache(true)
                    setError(null)
                    return
                }
            }

            setError(message)
            toast.error('Error al cargar servicios', {
                description: message,
                id: 'error-fetch-services'
            })
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchServices()
    }, [fetchServices])

    // Filter services by status - memoized for performance
    const pendingServices = useMemo(() =>
        services.filter(s =>
            s.currentStatus === 'ASSIGNED'
        ),
        [services]
    )

    const completedServices = useMemo(() =>
        services.filter(s =>
            s.currentStatus === 'PENDING' ||
            s.currentStatus === 'DELIVERED' ||
            s.currentStatus === 'RETURNED' ||
            s.currentStatus === 'RESOLVED' ||
            s.currentStatus === 'CANCELED'
        ),
        [services]
    )

    // Calculate stats
    const stats = useMemo(() => ({
        total: services.length,
        pending: services.filter(s => s.currentStatus === 'ASSIGNED').length,
        delivered: services.filter(s => s.currentStatus === 'DELIVERED').length,
        returned: services.filter(s => s.currentStatus === 'RETURNED').length,
    }), [services])

    return {
        services,
        loading,
        error,
        refetch: fetchServices,
        pendingServices,
        completedServices,
        stats,
        isFromCache
    }
}

