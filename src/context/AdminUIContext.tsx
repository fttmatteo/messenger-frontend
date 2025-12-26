import React, { createContext, useContext, type ReactNode } from 'react';
import { toast } from 'sonner';

interface AdminUIContextType {
    setError: (error: string | null, id?: string) => void;
    setSuccess: (success: string | null, id?: string) => void;
    clearError: () => void;
    clearSuccess: () => void;
}

const AdminUIContext = createContext<AdminUIContextType | undefined>(undefined);

export const AdminUIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    // Wrapper around sonner toast.error with optional ID to prevent duplicates
    const setError = (msg: string | null, id?: string) => {
        if (!msg) return;
        toast.error(msg, {
            id: id || msg, // Use message as ID if not provided
            position: 'top-center',
            duration: 3000,
            className: 'bg-red-500 text-white border-red-600',
            descriptionClassName: 'text-white/90'
        });
    };

    // Wrapper around sonner toast.success with optional ID to prevent duplicates
    const setSuccess = (msg: string | null, id?: string) => {
        if (!msg) return;
        toast.success(msg, {
            id: id || msg, // Use message as ID if not provided
            position: 'top-center',
            duration: 3000,
            className: 'bg-green-500 text-white border-green-600',
            descriptionClassName: 'text-white/90'
        });
    };

    const clearError = () => {
        // No-op for toast, or could dismiss all
        toast.dismiss();
    };

    const clearSuccess = () => {
        toast.dismiss();
    };

    return (
        <AdminUIContext.Provider value={{
            setError, setSuccess, clearError, clearSuccess
        }}>
            {children}
        </AdminUIContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminUI = () => {
    const context = useContext(AdminUIContext);
    if (context === undefined) {
        throw new Error('useAdminUI must be used within an AdminUIProvider');
    }
    return context;
};
