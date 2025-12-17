/**
 * AuthContext - Contexto de Autenticación
 * 
 * Provee estado global de autenticación para toda la aplicación.
 * Maneja login, logout, y persistencia de sesión.
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { AuthContextType, AuthState, LoginCredentials, User } from '@/features/auth/types'
import { tokenManager } from '@/config/axios-client'
import axiosClient from '@/config/axios-client'

/**
 * Estado inicial de autenticación
 */
const initialState: AuthState = {
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
}

/**
 * Contexto de autenticación
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Props del provider
 */
interface AuthProviderProps {
    children: ReactNode
}

/**
 * Clave para almacenar el usuario en localStorage
 */
const USER_KEY = 'messenger_user'

/**
 * AuthProvider - Componente proveedor de autenticación
 * 
 * Envuelve la aplicación para proveer estado de autenticación.
 * Persiste el usuario en localStorage para mantener la sesión.
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const [state, setState] = useState<AuthState>(initialState)

    /**
     * Cargar usuario desde localStorage al inicio
     */
    useEffect(() => {
        const loadUser = () => {
            try {
                const token = tokenManager.getToken()
                const userJson = localStorage.getItem(USER_KEY)

                if (token && userJson) {
                    const user = JSON.parse(userJson) as User
                    setState({
                        user,
                        isLoading: false,
                        isAuthenticated: true,
                        error: null,
                    })
                } else {
                    setState({
                        ...initialState,
                        isLoading: false,
                    })
                }
            } catch {
                setState({
                    ...initialState,
                    isLoading: false,
                })
            }
        }

        loadUser()
    }, [])

    /**
     * Iniciar sesión con credenciales
     */
    const login = useCallback(async (credentials: LoginCredentials) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }))

        try {
            const response = await axiosClient.post<{
                token: string
                refreshToken: string
                role: string
                username: string
            }>('/auth/login', credentials)

            const { token, refreshToken, role, username } = response.data

            // Guardar tokens
            tokenManager.setTokens(token, refreshToken)

            // Crear objeto de usuario
            const user: User = {
                id: 0, // El backend podría retornar esto
                username: username,
                fullName: username, // Podría venir del backend
                role: role as 'ADMIN' | 'MESSENGER',
            }

            // Guardar usuario
            localStorage.setItem(USER_KEY, JSON.stringify(user))

            setState({
                user,
                isLoading: false,
                isAuthenticated: true,
                error: null,
            })
        } catch (error: unknown) {
            const message = error instanceof Error
                ? error.message
                : 'Error al iniciar sesión'

            setState(prev => ({
                ...prev,
                isLoading: false,
                error: message,
            }))
            throw error
        }
    }, [])

    /**
     * Cerrar sesión
     */
    const logout = useCallback(() => {
        tokenManager.clearTokens()
        localStorage.removeItem(USER_KEY)
        setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,
        })
    }, [])

    /**
     * Limpiar errores
     */
    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }))
    }, [])

    const value: AuthContextType = {
        ...state,
        login,
        logout,
        clearError,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

/**
 * Hook useAuth
 * 
 * Accede al contexto de autenticación.
 * Debe usarse dentro de un AuthProvider.
 * 
 * @returns Contexto de autenticación
 * @throws Error si se usa fuera de AuthProvider
 */
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider')
    }
    return context
}
