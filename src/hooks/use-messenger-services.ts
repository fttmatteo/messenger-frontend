import { useState, useEffect, useCallback, useMemo } from 'react'
import { serviceDeliveryService } from '@/services/service.service'
import type { ServiceDelivery } from '@/types/service.types'
import { showToast } from '@/config/toast-config'
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
            } catch {
                // Ignorar error de caché
            }
        }
        loadCachedData()
    }, [])

    const fetchServices = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            // Usamos la versión paginada con un tamaño generoso para el mensajero (ej. 100 últimos servicios)
            // en lugar de traer los miles de registros históricos de una vez.
            const response = await serviceDeliveryService.getAllPaginated({
                page: 0,
                size: 100,
                sortBy: 'createdAt',
                sortDirection: 'desc'
            })

            const data = response.content
            setServices(data)
            setIsFromCache(false)

            await offlineCacheService.cacheServices(data)
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
            showToast.error('Error al cargar servicios', {
                description: message,
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

