/**
 * Hook useEmployees
 * 
 * React Query hook para obtener la lista de empleados.
 * Proporciona loading, error, y refetch automáticos.
 */

import { useQuery } from '@tanstack/react-query'
import { getEmployees, getEmployeeById } from '../api/employees.service'
import type { Employee } from '../types'

/**
 * Query key para empleados
 */
export const employeesKeys = {
    all: ['employees'] as const,
    lists: () => [...employeesKeys.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...employeesKeys.lists(), filters] as const,
    details: () => [...employeesKeys.all, 'detail'] as const,
    detail: (id: number) => [...employeesKeys.details(), id] as const,
}

/**
 * Hook para obtener todos los empleados
 * 
 * @example
 * const { data: employees, isLoading, error } = useEmployees()
 */
export function useEmployees() {
    return useQuery<Employee[], Error>({
        queryKey: employeesKeys.lists(),
        queryFn: getEmployees,
    })
}

/**
 * Hook para obtener un empleado por ID
 * 
 * @param id - ID del empleado
 * @example
 * const { data: employee, isLoading } = useEmployee(1)
 */
export function useEmployee(id: number) {
    return useQuery<Employee, Error>({
        queryKey: employeesKeys.detail(id),
        queryFn: () => getEmployeeById(id),
        enabled: id > 0, // Solo ejecutar si hay ID válido
    })
}
