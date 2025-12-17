/**
 * Hook useServices
 * 
 * React Query hooks para obtener entregas de servicio.
 */

import { useQuery } from '@tanstack/react-query'
import { getServices, getServiceById, getServicesByStatus, getServicesByMessenger } from '../api'
import type { ServiceDelivery, ServiceStatus } from '../types'

/**
 * Query keys para entregas
 */
export const servicesKeys = {
    all: ['services'] as const,
    lists: () => [...servicesKeys.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...servicesKeys.lists(), filters] as const,
    byStatus: (status: ServiceStatus) => [...servicesKeys.lists(), { status }] as const,
    byMessenger: (document: string) => [...servicesKeys.lists(), { messenger: document }] as const,
    details: () => [...servicesKeys.all, 'detail'] as const,
    detail: (id: number) => [...servicesKeys.details(), id] as const,
}

/**
 * Hook para obtener todas las entregas
 */
export function useServices() {
    return useQuery<ServiceDelivery[], Error>({
        queryKey: servicesKeys.lists(),
        queryFn: getServices,
    })
}

/**
 * Hook para obtener una entrega por ID
 */
export function useService(id: number) {
    return useQuery<ServiceDelivery, Error>({
        queryKey: servicesKeys.detail(id),
        queryFn: () => getServiceById(id),
        enabled: id > 0,
    })
}

/**
 * Hook para obtener entregas por estado
 */
export function useServicesByStatus(status: ServiceStatus) {
    return useQuery<ServiceDelivery[], Error>({
        queryKey: servicesKeys.byStatus(status),
        queryFn: () => getServicesByStatus(status),
    })
}

/**
 * Hook para obtener entregas de un mensajero (para MESSENGER role)
 */
export function useMyServices(document: string) {
    return useQuery<ServiceDelivery[], Error>({
        queryKey: servicesKeys.byMessenger(document),
        queryFn: () => getServicesByMessenger(document),
        enabled: !!document,
    })
}
