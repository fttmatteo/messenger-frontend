/**
 * Feature: Employees (Empleados)
 * 
 * Módulo completo para gestión de empleados del sistema.
 * Solo accesible para usuarios con rol ADMIN.
 * 
 * Incluye:
 * - Types: Employee, CreateEmployeeRequest
 * - API: CRUD de empleados
 * - Hooks: useEmployees, useCreateEmployee, etc.
 * - Components: EmployeeList, EmployeeForm
 */

// Types
export * from './types'

// API Service
export * from './api/employees.service'

// Hooks
export * from './hooks'

// Components
export * from './components'
