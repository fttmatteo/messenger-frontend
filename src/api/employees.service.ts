/**
 * Servicio API de Empleados
 * 
 * Funciones para comunicarse con el backend:
 * - GET /employees
 * - GET /employees/{id}
 * - POST /employees
 * - PUT /employees/{id}
 * - DELETE /employees/{id}
 */

import axiosClient from '@/config/axios-client'
import { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '@/types'

/**
 * Base URL para endpoints de empleados
 */
const EMPLOYEES_URL = '/employees'

/**
 * Obtiene todos los empleados
 * @returns Lista de empleados
 */
export async function getEmployees(): Promise<Employee[]> {
    const response = await axiosClient.get<Employee[]>(EMPLOYEES_URL)
    return response.data
}

/**
 * Obtiene un empleado por ID
 * @param id - ID del empleado
 * @returns Empleado encontrado
 */
export async function getEmployeeById(id: number): Promise<Employee> {
    const response = await axiosClient.get<Employee>(`${EMPLOYEES_URL}/${id}`)
    return response.data
}

/**
 * Crea un nuevo empleado
 * @param data - Datos del empleado
 * @returns Empleado creado
 */
export async function createEmployee(data: CreateEmployeeRequest): Promise<Employee> {
    const response = await axiosClient.post<Employee>(EMPLOYEES_URL, data)
    return response.data
}

/**
 * Actualiza un empleado existente
 * @param id - ID del empleado
 * @param data - Datos actualizados
 * @returns Empleado actualizado
 */
export async function updateEmployee(id: number, data: UpdateEmployeeRequest): Promise<Employee> {
    const response = await axiosClient.put<Employee>(`${EMPLOYEES_URL}/${id}`, data)
    return response.data
}

/**
 * Elimina un empleado
 * @param id - ID del empleado a eliminar
 */
export async function deleteEmployee(id: number): Promise<void> {
    await axiosClient.delete(`${EMPLOYEES_URL}/${id}`)
}
