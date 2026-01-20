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
     * Obtiene la información detallada de un empleado por su ID.
     * @param id - ID único del empleado.
     */
    async getById(id: number): Promise<Employee> {
        const response = await apiClient.get(`/employees/findByEmployeeId/${id}`)
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
     * @param id - ID único del empleado a actualizar.
     * @param data - Nuevos datos para el empleado.
     */
    async update(id: number, data: UpdateEmployeeRequest): Promise<Employee> {
        const response = await apiClient.put(`/employees/updateEmployee/${id}`, data)
        return response.data
    },

    /**
     * Elimina un empleado del sistema.
     * @param id - ID único del empleado a eliminar.
     */
    async delete(id: number): Promise<void> {
        await apiClient.delete(`/employees/deleteEmployee/${id}`)
    },
}
