/**
 * Hook useEmployeeMutations
 * 
 * React Query mutations para crear, actualizar y eliminar empleados.
 * Invalida automáticamente el caché después de mutaciones exitosas.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createEmployee, updateEmployee, deleteEmployee } from '../api/employees.service'
import { employeesKeys } from './useEmployees'
import type { CreateEmployeeRequest, UpdateEmployeeRequest, Employee } from '../types'

/**
 * Hook para crear un nuevo empleado
 * 
 * @example
 * const { mutate: create, isPending } = useCreateEmployee()
 * create({ document: '123', fullName: 'Juan', ... })
 */
export function useCreateEmployee() {
    const queryClient = useQueryClient()

    return useMutation<Employee, Error, CreateEmployeeRequest>({
        mutationFn: createEmployee,
        onSuccess: () => {
            // Invalidar lista de empleados para refrescar
            queryClient.invalidateQueries({ queryKey: employeesKeys.lists() })
        },
    })
}

/**
 * Hook para actualizar un empleado
 * 
 * @example
 * const { mutate: update } = useUpdateEmployee()
 * update({ id: 1, data: { fullName: 'Juan Updated', ... } })
 */
export function useUpdateEmployee() {
    const queryClient = useQueryClient()

    return useMutation<Employee, Error, { id: number; data: UpdateEmployeeRequest }>({
        mutationFn: ({ id, data }) => updateEmployee(id, data),
        onSuccess: (_, variables) => {
            // Invalidar lista y detalle específico
            queryClient.invalidateQueries({ queryKey: employeesKeys.lists() })
            queryClient.invalidateQueries({ queryKey: employeesKeys.detail(variables.id) })
        },
    })
}

/**
 * Hook para eliminar un empleado
 * 
 * @example
 * const { mutate: remove } = useDeleteEmployee()
 * remove(1)
 */
export function useDeleteEmployee() {
    const queryClient = useQueryClient()

    return useMutation<void, Error, number>({
        mutationFn: deleteEmployee,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: employeesKeys.lists() })
        },
    })
}
