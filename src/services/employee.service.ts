import apiClient from './api-client'
import type { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '@/types/employee.types'

export const employeeService = {
    async getAll(): Promise<Employee[]> {
        const response = await apiClient.get('/employees/allEmployees')
        return response.data
    },

    async getById(id: number): Promise<Employee> {
        const response = await apiClient.get(`/employees/findByEmployeeId/${id}`)
        return response.data
    },

    async create(data: CreateEmployeeRequest): Promise<Employee> {
        const response = await apiClient.post('/employees/createEmployee', data)
        return response.data
    },

    async update(id: number, data: UpdateEmployeeRequest): Promise<Employee> {
        const response = await apiClient.put(`/employees/updateEmployee/${id}`, data)
        return response.data
    },

    async delete(id: number): Promise<void> {
        await apiClient.delete(`/employees/deleteEmployee/${id}`)
    },
}
