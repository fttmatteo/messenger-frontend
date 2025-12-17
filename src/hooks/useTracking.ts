/**
 * Hook useTracking
 * 
 * React Query hooks para tracking de mensajeros.
 */

import { useQuery } from '@tanstack/react-query'
import { getActiveMessengers, getLastLocation, getLocationHistory, getServiceLocationHistory } from '@/api/tracking.service'
import type { ActiveMessenger, LocationHistory } from '@/types'

/**
 * Query keys para tracking
 */
export const trackingKeys = {
    all: ['tracking'] as const,
    active: () => [...trackingKeys.all, 'active'] as const,
    messenger: (id: number) => [...trackingKeys.all, 'messenger', id] as const,
    history: (messengerId: number, date: string) => [...trackingKeys.all, 'history', messengerId, date] as const,
    serviceHistory: (serviceId: number) => [...trackingKeys.all, 'service', serviceId] as const,
}

/**
 * Hook para obtener todos los mensajeros activos
 * Útil para mostrar el mapa con los mensajeros en tiempo real
 */
export function useActiveMessengers() {
    return useQuery<ActiveMessenger[], Error>({
        queryKey: trackingKeys.active(),
        queryFn: getActiveMessengers,
        refetchInterval: 30000, // Refrescar cada 30 segundos
    })
}

/**
 * Hook para obtener la última ubicación de un mensajero
 */
export function useMessengerLocation(messengerId: number) {
    return useQuery<ActiveMessenger, Error>({
        queryKey: trackingKeys.messenger(messengerId),
        queryFn: () => getLastLocation(messengerId),
        enabled: messengerId > 0,
        refetchInterval: 10000, // Refrescar cada 10 segundos
    })
}

/**
 * Hook para obtener historial de ubicaciones de un mensajero
 */
export function useLocationHistory(messengerId: number, date: string) {
    return useQuery<LocationHistory[], Error>({
        queryKey: trackingKeys.history(messengerId, date),
        queryFn: () => getLocationHistory(messengerId, date),
        enabled: messengerId > 0 && !!date,
    })
}

/**
 * Hook para obtener historial de ubicaciones de un servicio
 */
export function useServiceLocationHistory(serviceId: number) {
    return useQuery<LocationHistory[], Error>({
        queryKey: trackingKeys.serviceHistory(serviceId),
        queryFn: () => getServiceLocationHistory(serviceId),
        enabled: serviceId > 0,
    })
}
