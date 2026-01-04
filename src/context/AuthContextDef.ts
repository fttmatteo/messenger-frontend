import { createContext } from 'react'
import type { LoginCredentials, User } from '@/types'

/**
 * Authentication context type definition.
 * Separated from implementation to prevent circular dependencies.
 */
export interface AuthContextType {
    /** Current authenticated user or null */
    user: User | null
    /** Login function with credentials */
    login: (credentials: LoginCredentials) => Promise<void>
    /** Logout function to clear session */
    logout: () => void
    /** Whether user is authenticated */
    isAuthenticated: boolean
    /** Whether auth state is loading */
    isLoading: boolean
    /** Update user data partially */
    updateUser: (data: Partial<User>) => void
}

/**
 * Auth context instance.
 * Use useAuth hook to consume this context.
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined)
