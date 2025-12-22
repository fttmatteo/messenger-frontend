import { useState, useEffect, useCallback, useMemo } from 'react'
import { serviceDeliveryService } from '@/services/service.service'
import type { ServiceDelivery } from '@/types/service.types'
import { toast } from 'sonner'

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
}

/**
 * Hook para gestionar servicios del mensajero.
 * Filtra automáticamente por pendientes/completados y calcula estadísticas.
 */
export function useMessengerServices(): UseMessengerServicesReturn {
    const [services, setServices] = useState<ServiceDelivery[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

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
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || 'Error al cargar servicios'
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
        stats
    }
}
