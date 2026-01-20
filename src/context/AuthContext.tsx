import React, { useContext, useState } from 'react'
import { authService } from '@/services/auth.service'
import { logger } from '@/utils/logger'
import type { LoginCredentials, User } from '@/types'
import { AuthContext } from './AuthContextDef'

/**
 * Proveedor de contexto de autenticación.
 * Gestiona el estado de sesión del usuario, login, logout y persistencia en storage.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (storedUser) {
            try {
                return JSON.parse(storedUser);
            } catch (e) {
                logger.error("Error al parsear usuario almacenado", e);
                return null;
            }
        }
        return null;
    });
    const [isLoading] = useState(false);

    const login = async (credentials: LoginCredentials) => {
        const data = await authService.login(credentials);
        const storage = credentials.rememberMe ? localStorage : sessionStorage;


        const oppositeStorage = credentials.rememberMe ? sessionStorage : localStorage;
        oppositeStorage.removeItem('role');
        oppositeStorage.removeItem('user');

        const userObj: User = {
            document: credentials.document,
            role: data.role,
            id: data.user?.id,
            name: data.user?.name,
            dealershipName: data.user?.dealershipName,
            isOnline: data.role === 'MESSENGER'
        };


        storage.setItem('role', data.role);
        storage.setItem('user', JSON.stringify(userObj));

        setUser(userObj);
    };

    const updateUser = (data: Partial<User>) => {
        if (!user) return;
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);

        if (localStorage.getItem('user')) {
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        if (sessionStorage.getItem('user')) {
            sessionStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    const logout = () => {
        authService.logout();
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('role');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            updateUser,
            isAuthenticated: !!user,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Hook para acceder al estado y funciones de autenticación.
 * @returns {AuthContextType} Contexto de autenticación.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
