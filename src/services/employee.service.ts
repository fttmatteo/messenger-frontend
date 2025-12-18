import type { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '@/types/employee.types'

const API_URL = '/employees'

function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token')
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    }
}

export const employeeService = {
    async getAll(): Promise<Employee[]> {
        const response = await fetch(`${API_URL}/all`, {
            method: 'GET',
            headers: getAuthHeaders(),
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new Error(error.message || 'Error al obtener empleados')
        }

        return response.json()
    },

    async getById(id: number): Promise<Employee> {
        const response = await fetch(`${API_URL}/find/${id}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new Error(error.message || 'Error al obtener empleado')
        }

        return response.json()
    },

    async create(data: CreateEmployeeRequest): Promise<string> {
        const response = await fetch(`${API_URL}/create`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new Error(error.message || 'Error al crear empleado')
        }

        return response.text()
    },

    async update(id: number, data: UpdateEmployeeRequest): Promise<string> {
        const response = await fetch(`${API_URL}/update/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new Error(error.message || 'Error al actualizar empleado')
        }

        return response.text()
    },

    async delete(id: number): Promise<string> {
        const response = await fetch(`${API_URL}/delete/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new Error(error.message || 'Error al eliminar empleado')
        }

        return response.text()
    },
}
