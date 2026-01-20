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
    isFromCache: boolean
}

/**
 * Hook para gestionar los servicios del mensajero actual.
 * Maneja la carga, caché offline, estadísticas y filtrado de servicios.
 */
export function useMessengerServices(): UseMessengerServicesReturn {
    const [services, setServices] = useState<ServiceDelivery[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isFromCache, setIsFromCache] = useState(false)

    useEffect(() => {
        const loadCachedData = async () => {
            try {
                const cached = await offlineCacheService.getCachedServices()
                if (cached.length > 0) {
                    setServices(cached)
                    setIsFromCache(true)
                }
            } catch { }
        }
        loadCachedData()
    }, [])

    const fetchServices = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await serviceDeliveryService.getAll()
            const sorted = data.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            setServices(sorted)
            setIsFromCache(false)

            await offlineCacheService.cacheServices(sorted)
        } catch (err) {
            const message = getErrorMessage(err)

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

