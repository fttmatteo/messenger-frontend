import React, { createContext, useContext, useRef, type ReactNode } from 'react';
import { toast } from 'sonner';

interface AdminUIContextType {
    setError: (error: string | null, id?: string) => void;
    setSuccess: (success: string | null, id?: string) => void;
    clearError: () => void;
    clearSuccess: () => void;
}

const AdminUIContext = createContext<AdminUIContextType | undefined>(undefined);

let toastCounter = 0;
const generateUniqueId = (prefix: string): string => {
    return `${prefix}-${Date.now()}-${++toastCounter}`;
};

export const AdminUIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const lastErrorIdRef = useRef<string | null>(null);
    const lastSuccessIdRef = useRef<string | null>(null);

    const setError = (msg: string | null, id?: string) => {
        if (!msg) return;
        
        const toastId = id || generateUniqueId('admin-error');
        
        if (lastErrorIdRef.current) {
            toast.dismiss(lastErrorIdRef.current);
        }
        
        toast.error(msg, {
            id: toastId,
            position: 'top-center',
            duration: 3000,
            className: 'bg-red-500 text-white border-red-600',
            descriptionClassName: 'text-white/90'
        });
        
        lastErrorIdRef.current = toastId;
    };

    const setSuccess = (msg: string | null, id?: string) => {
        if (!msg) return;
        
        const toastId = id || generateUniqueId('admin-success');
        
        if (lastSuccessIdRef.current) {
            toast.dismiss(lastSuccessIdRef.current);
        }
        
        toast.success(msg, {
            id: toastId,
            position: 'top-center',
            duration: 3000,
            className: 'bg-green-500 text-white border-green-600',
            descriptionClassName: 'text-white/90'
        });
        
        lastSuccessIdRef.current = toastId;
    };

    const clearError = () => {
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

export const useAdminUI = () => {
    const context = useContext(AdminUIContext);
    if (context === undefined) {
        throw new Error('useAdminUI must be used within an AdminUIProvider');
    }
    return context;
};
