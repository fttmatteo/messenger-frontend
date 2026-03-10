import React, { createContext, useContext, type ReactNode } from 'react';
import { showToast } from '@/config/toast-config';

/**
 * Estructura del contexto de UI para administradores.
 */
interface AdminUIContextType {
    setError: (error: string | null, id?: string) => void;
    setSuccess: (success: string | null, id?: string) => void;
    clearError: () => void;
    clearSuccess: () => void;
}

const AdminUIContext = createContext<AdminUIContextType | undefined>(undefined);


/**
 * Proveedor de contexto para la interfaz de administración.
 * Gestiona la visualización de notificaciones de éxito y error de forma centralizada.
 */
export const AdminUIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const setError = (msg: string | null, id?: string) => {
        if (!msg) return;

        showToast.error(msg, {
            id,
            duration: 3000,
            className: 'bg-red-500 text-white border-red-600',
        });
    };

    const setSuccess = (msg: string | null, id?: string) => {
        if (!msg) return;

        showToast.success(msg, {
            id,
            duration: 3000,
            className: 'bg-green-500 text-white border-green-600',
        });
    };

    const clearError = () => {
        showToast.dismiss();
    };

    const clearSuccess = () => {
        showToast.dismiss();
    };

    return (
        <AdminUIContext.Provider value={{
            setError, setSuccess, clearError, clearSuccess
        }}>
            {children}
        </AdminUIContext.Provider>
    );
};

/**
 * Hook para acceder al contexto de UI de administración.
 * Permite mostrar errores y mensajes de éxito desde cualquier componente hijo.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useAdminUI = () => {
    const context = useContext(AdminUIContext);
    if (context === undefined) {
        throw new Error('useAdminUI debe ser usado dentro de un AdminUIProvider');
    }
    return context;
};
