export type EmployeeRole = 'ADMIN' | 'MESSENGER'

export interface Employee {
    idEmployee: number
    document: number
    fullName: string
    phone: string
    role: EmployeeRole
}

export interface CreateEmployeeRequest {
    document: string
    fullName: string
    phone: string
    password: string
    role: EmployeeRole
}

export type UpdateEmployeeRequest = CreateEmployeeRequest
