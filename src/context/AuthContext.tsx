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

        import('@capacitor/preferences').then(({ Preferences }) => {
            Preferences.set({ key: 'role', value: data.role });
            Preferences.set({ key: 'user', value: JSON.stringify(userObj) });
        }).catch(() => { });

        setUser(userObj);
    }, []);

    const updateUser = React.useCallback((data: Partial<User>) => {
        if (!user) return;
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);

        const updatedUserStr = JSON.stringify(updatedUser);

        if (localStorage.getItem('user')) {
            localStorage.setItem('user', updatedUserStr);
        }
        if (sessionStorage.getItem('user')) {
            sessionStorage.setItem('user', updatedUserStr);
        }

        import('@capacitor/preferences').then(({ Preferences }) => {
            Preferences.set({ key: 'user', value: updatedUserStr });
        }).catch(() => { });
    }, [user]);

    const logout = React.useCallback(() => {
        authService.logout();
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('role');
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
