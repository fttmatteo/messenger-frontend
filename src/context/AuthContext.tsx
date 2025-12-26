import React, { createContext, useContext, useState } from 'react';
import { authService } from '../services/auth.service';
import type { LoginCredentials, User } from '../types/auth.types';

interface AuthContextType {
    user: User | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
    updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (storedUser && token) {
            try {
                return JSON.parse(storedUser);
            } catch (e) {
                console.error("Error parsing stored user", e);
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

        // Store data
        storage.setItem('token', data.token);
        storage.setItem('refreshToken', data.refreshToken);
        storage.setItem('role', data.role);

        // Try to get ID from token payload (robust decode for JWT/Base64URL)
        let userId: number | undefined;
        try {
            const base64Url = data.token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            const payload = JSON.parse(jsonPayload);
            if (payload.id) userId = payload.id;
        } catch (e) {
            console.error("Error decoding token", e);
        }

        const userObj = {
            document: credentials.document,
            role: data.role,
            id: userId,
            isOnline: data.role === 'MESSENGER'
        };
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

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
