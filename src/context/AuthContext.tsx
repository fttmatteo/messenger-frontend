import React, { useContext, useState } from 'react'
import { authService } from '@/services/auth.service'
import { logger } from '@/utils/logger'
import type { LoginCredentials, User } from '@/types'
import { AuthContext } from './AuthContextDef'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (storedUser) {
            try {
                return JSON.parse(storedUser);
            } catch (e) {
                logger.error("Error parsing stored user", e);
                return null;
            }
        }
        return null;
    });
    // Initial loading is handled synchronously by lazy initialization of user
    const [isLoading] = useState(false);

    const login = async (credentials: LoginCredentials) => {
        const data = await authService.login(credentials);
        const storage = credentials.rememberMe ? localStorage : sessionStorage;


        // Limpiar el otro storage para evitar fugas de rol/usuario
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

        // Update in both just in case, or detect which one was used
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

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
