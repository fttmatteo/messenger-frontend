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
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await authService.getCurrentUserAsync() as User | null;
                setUser(currentUser);
            } catch (e) {
                logger.error("Error al cargar usuario inicial", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadUser();

        // Escuchar evento de sesión expirada para limpiar el estado
        const handleSessionExpired = () => {
            setUser(null);
        };
        window.addEventListener('session-expired', handleSessionExpired);

        return () => {
            window.removeEventListener('session-expired', handleSessionExpired);
        };
    }, []);

    const login = React.useCallback(async (credentials: LoginCredentials) => {
        const data = await authService.login(credentials);
        
        const userObj: User = {
            document: credentials.document,
            role: data.role,
            id: data.user?.id,
            name: data.user?.name,
            dealershipName: data.user?.dealershipName,
            isOnline: data.role === 'MESSENGER'
        };

        setUser(userObj);
    }, []);

    const updateUser = React.useCallback(async (data: Partial<User>) => {
        if (!user) return;
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);

        // Persistir cambio
        const role = await authService.getRoleAsync();
        if (role) {
            await authService.saveSession(updatedUser, role);
        }
    }, [user]);

    const logout = React.useCallback(async () => {
        await authService.logout();
        setUser(null);
    }, []);

    const contextValue = React.useMemo(() => ({
        user,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user,
        isLoading
    }), [user, login, logout, updateUser, isLoading]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Hook para acceder al estado y funciones de autenticación.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};
