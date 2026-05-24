/**
 * Definición de los roles de usuario permitidos en la aplicación.
 */
export type EmployeeRole = 'ADMIN' | 'MESSENGER'

/**
 * Información de perfil detallada de un empleado (personal administrativo o operativo).
 */
export interface Employee {
    idEmployee: number
    uuid: string
    document: number
    fullName: string
    phone: string
    role: EmployeeRole
}

/**
 * Datos necesarios para el registro de un nuevo empleado, incluyendo credenciales iniciales.
 */
export interface CreateEmployeeRequest {
    document: string
    fullName: string
    phone: string
    password: string
    role: EmployeeRole
}

export type UpdateEmployeeRequest = CreateEmployeeRequest
