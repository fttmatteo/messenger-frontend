/**
 * Tipos de Autenticación
 * 
 * Define las interfaces y tipos para el sistema de autenticación.
 */

/**
 * Roles de usuario disponibles en el sistema
 */
export type UserRole = 'ADMIN' | 'MESSENGER'

/**
 * Datos del usuario autenticado
 */
export interface User {
    /** ID único del usuario */
    id: number
    /** Nombre de usuario (para login) */
    userName: string
    /** Nombre completo */
    fullName: string
    /** Rol del usuario */
    role: UserRole
    /** Email (opcional) */
    email?: string
}

/**
 * Credenciales para inicio de sesión
 */
export interface LoginCredentials {
    userName: string
    password: string
}

/**
 * Respuesta del servidor al hacer login
 */
export interface AuthResponse {
    token: string
    refreshToken: string
    user: User
}

/**
 * Estado del contexto de autenticación
 */
export interface AuthState {
    /** Usuario autenticado o null si no hay sesión */
    user: User | null
    /** Indica si está cargando la autenticación */
    isLoading: boolean
    /** Indica si el usuario está autenticado */
    isAuthenticated: boolean
    /** Error de autenticación si existe */
    error: string | null
}

/**
 * Acciones disponibles en el contexto de autenticación
 */
export interface AuthActions {
    /** Iniciar sesión con credenciales */
    login: (credentials: LoginCredentials) => Promise<void>
    /** Cerrar sesión */
    logout: () => void
    /** Limpiar errores */
    clearError: () => void
}

/**
 * Contexto completo de autenticación
 */
export type AuthContextType = AuthState & AuthActions
