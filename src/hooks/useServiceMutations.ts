/**
 * Hook useServiceMutations
 * 
 * React Query mutations para crear y actualizar entregas.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createService, updateServiceStatus } from '@/api/services.service'
import { servicesKeys } from './useServices'
import type { CreateServiceRequest, UpdateServiceStatusRequest, ServiceDelivery } from '@/types'

/**
 * Hook para crear una nueva entrega con imagen
 */
export function useCreateService() {
    const queryClient = useQueryClient()

    return useMutation<ServiceDelivery, Error, CreateServiceRequest>({
        mutationFn: createService,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: servicesKeys.lists() })
        },
    })
}

/**
 * Hook para actualizar el estado de una entrega
 */
export function useUpdateServiceStatus() {
    const queryClient = useQueryClient()

    return useMutation<ServiceDelivery, Error, { id: number; data: UpdateServiceStatusRequest }>({
        mutationFn: ({ id, data }) => updateServiceStatus(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: servicesKeys.lists() })
            queryClient.invalidateQueries({ queryKey: servicesKeys.detail(variables.id) })
        },
    })
}
