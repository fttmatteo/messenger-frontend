import apiClient from './api-client'
import type { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '@/types/employee.types'

/**
 * Servicio encargado de la gestión de empleados (Administradores y Mensajeros).
 * Permite realizar operaciones CRUD sobre el personal del sistema.
 */
export const employeeService = {
    /**
     * Recupera la lista completa de empleados registrados.
     */
    async getAll(): Promise<Employee[]> {
        const response = await apiClient.get('/employees/allEmployees')
        return response.data
    },

    /**
     * Obtiene la información detallada de un empleado por su UUID.
     * @param uuid - UUID público del empleado.
     */
    async getById(uuid: string): Promise<Employee> {
        const response = await apiClient.get(`/employees/findByEmployeeId/${uuid}`)
        return response.data
    },

    /**
     * Registra un nuevo empleado en el sistema.
     * @param data - Datos para la creación del empleado.
     */
    async create(data: CreateEmployeeRequest): Promise<Employee> {
        const response = await apiClient.post('/employees/createEmployee', data)
        return response.data
    },

    /**
     * Actualiza la información de un empleado existente.
     * @param uuid - UUID público del empleado a actualizar.
     * @param data - Nuevos datos para el empleado.
     */
    async update(uuid: string, data: UpdateEmployeeRequest): Promise<Employee> {
        const response = await apiClient.put(`/employees/updateEmployee/${uuid}`, data)
        return response.data
    },

    /**
     * Elimina un empleado del sistema.
     * @param uuid - UUID público del empleado a eliminar.
     */
    async delete(uuid: string): Promise<void> {
        await apiClient.delete(`/employees/deleteEmployee/${uuid}`)
    },
}
