/**
 * ProtectedRoute - Componente de Ruta Protegida
 * 
 * Guarda las rutas que requieren autenticación.
 * Opcionalmente filtra por rol de usuario.
 */

import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { UserRole } from '@/types'
import { Loader2 } from 'lucide-react'

/**
 * Props del componente
 */
interface ProtectedRouteProps {
    /** Contenido a renderizar si está autenticado */
    children: React.ReactNode
    /** Rol requerido (opcional) */
    requiredRole?: UserRole
    /** Ruta de redirección si no está autenticado */
    redirectTo?: string
}

/**
 * ProtectedRoute Component
 * 
 * @example
 * // Ruta que requiere autenticación
 * <ProtectedRoute>
 *   <DashboardPage />
 * </ProtectedRoute>
 * 
 * @example
 * // Ruta que requiere rol específico
 * <ProtectedRoute requiredRole="ADMIN">
 *   <AdminPage />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
    children,
    requiredRole,
    redirectTo = '/login'
}: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth()

    // Mostrar loader mientras verifica autenticación
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        )
    }

    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
        return <Navigate to={redirectTo} replace />
    }

    // Si requiere un rol específico y no lo tiene, redirigir
    if (requiredRole && user?.role !== requiredRole) {
        // Redirigir al dashboard correspondiente a su rol
        const roleRedirect = user?.role === 'ADMIN' ? '/admin' : '/messenger'
        return <Navigate to={roleRedirect} replace />
    }

    return <>{children}</>
}
