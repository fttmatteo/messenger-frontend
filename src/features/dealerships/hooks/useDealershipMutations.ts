/**
 * Hook useDealershipMutations
 * 
 * React Query mutations para crear, actualizar, eliminar y geocodificar concesionarios.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createDealership, updateDealership, deleteDealership, geocodeDealership } from '../api'
import { dealershipsKeys } from './useDealerships'
import type { CreateDealershipRequest, UpdateDealershipRequest, Dealership } from '../types'

/**
 * Hook para crear un nuevo concesionario
 */
export function useCreateDealership() {
    const queryClient = useQueryClient()

    return useMutation<Dealership, Error, CreateDealershipRequest>({
        mutationFn: createDealership,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: dealershipsKeys.lists() })
        },
    })
}

/**
 * Hook para actualizar un concesionario
 */
export function useUpdateDealership() {
    const queryClient = useQueryClient()

    return useMutation<Dealership, Error, { id: number; data: UpdateDealershipRequest }>({
        mutationFn: ({ id, data }) => updateDealership(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: dealershipsKeys.lists() })
            queryClient.invalidateQueries({ queryKey: dealershipsKeys.detail(variables.id) })
        },
    })
}

/**
 * Hook para eliminar un concesionario
 */
export function useDeleteDealership() {
    const queryClient = useQueryClient()

    return useMutation<void, Error, number>({
        mutationFn: deleteDealership,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: dealershipsKeys.lists() })
        },
    })
}

/**
 * Hook para geocodificar un concesionario
 */
export function useGeocodeDealership() {
    const queryClient = useQueryClient()

    return useMutation<Dealership, Error, number>({
        mutationFn: geocodeDealership,
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: dealershipsKeys.lists() })
            queryClient.invalidateQueries({ queryKey: dealershipsKeys.detail(id) })
        },
    })
}
