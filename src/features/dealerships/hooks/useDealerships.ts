/**
 * Hook useDealerships
 * 
 * React Query hook para obtener la lista de concesionarios.
 */

import { useQuery } from '@tanstack/react-query'
import { getDealerships, getDealershipById } from '../api'
import type { Dealership } from '../types'

/**
 * Query key para concesionarios
 */
export const dealershipsKeys = {
    all: ['dealerships'] as const,
    lists: () => [...dealershipsKeys.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...dealershipsKeys.lists(), filters] as const,
    details: () => [...dealershipsKeys.all, 'detail'] as const,
    detail: (id: number) => [...dealershipsKeys.details(), id] as const,
}

/**
 * Hook para obtener todos los concesionarios
 * 
 * @example
 * const { data: dealerships, isLoading } = useDealerships()
 */
export function useDealerships() {
    return useQuery<Dealership[], Error>({
        queryKey: dealershipsKeys.lists(),
        queryFn: getDealerships,
    })
}

/**
 * Hook para obtener un concesionario por ID
 * 
 * @param id - ID del concesionario
 */
export function useDealership(id: number) {
    return useQuery<Dealership, Error>({
        queryKey: dealershipsKeys.detail(id),
        queryFn: () => getDealershipById(id),
        enabled: id > 0,
    })
}
