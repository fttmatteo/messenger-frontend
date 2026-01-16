import { createContext } from 'react'
import type { LoginCredentials, User } from '@/types'

export interface AuthContextType {
    user: User | null
    login: (credentials: LoginCredentials) => Promise<void>
    logout: () => void
    isAuthenticated: boolean
    isLoading: boolean
    updateUser: (data: Partial<User>) => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
