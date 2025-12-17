/**
 * Tipos de Empleados
 * 
 * Define las interfaces para el módulo de gestión de empleados.
 * Corresponde a los DTOs del backend: EmployeeRequest, Employee.
 */

/**
 * Roles disponibles para empleados
 */
export type EmployeeRole = 'ADMIN' | 'MESSENGER'

/**
 * Estado del empleado
 */
export type EmployeeStatus = 'ACTIVE' | 'INACTIVE'

/**
 * Empleado completo (respuesta del backend)
 */
export interface Employee {
    /** ID único del empleado */
    id: number
    /** Número de documento (cédula) */
    document: string
    /** Nombre completo */
    fullName: string
    /** Teléfono de contacto */
    phone: string
    /** Nombre de usuario para login */
    userName: string
    /** Rol del empleado */
    role: EmployeeRole
    /** Estado activo/inactivo */
    status?: EmployeeStatus
    /** Fecha de creación */
    createdAt?: string
    /** Fecha de última actualización */
    updatedAt?: string
}

/**
 * Request para crear/actualizar empleado
 */
export interface CreateEmployeeRequest {
    /** Número de documento (requerido) */
    document: string
    /** Nombre completo (requerido) */
    fullName: string
    /** Teléfono de contacto (requerido) */
    phone: string
    /** Nombre de usuario (requerido) */
    userName: string
    /** Contraseña (requerido para crear) */
    password: string
    /** Rol del empleado (requerido) */
    role: EmployeeRole
}

/**
 * Request para actualizar empleado (password opcional)
 */
export interface UpdateEmployeeRequest {
    document: string
    fullName: string
    phone: string
    userName: string
    /** Password opcional en actualización */
    password?: string
    role: EmployeeRole
}

/**
 * Filtros para listar empleados
 */
export interface EmployeeFilters {
    role?: EmployeeRole
    status?: EmployeeStatus
    search?: string
}
