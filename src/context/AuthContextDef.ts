import { createContext } from 'react'
import type { LoginCredentials, User } from '@/types'

/**
 * Estructura del contexto de autenticación.
 */
export interface AuthContextType {
    /** Usuario actualmente autenticado. */
    user: User | null
    /** Función para iniciar sesión con credenciales. */
    login: (credentials: LoginCredentials) => Promise<void>
    /** Función para cerrar la sesión actual. */
    logout: () => void
    /** Indica si el usuario está autenticado. */
    isAuthenticated: boolean
    /** Indica si hay un proceso de carga de sesión en curso. */
    isLoading: boolean
    /** Actualiza parcialmente los datos del usuario local. */
    updateUser: (data: Partial<User>) => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
