/**
 * Configuración de Rutas - React Router
 * 
 * Define todas las rutas de la aplicación:
 * - Públicas: Login
 * - Protegidas: Dashboard según rol
 */

import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginPage } from '@/pages/LoginPage'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { MessengerDashboard } from '@/pages/messenger/MessengerDashboard'
import { ProtectedRoute } from '@/components/ProtectedRoute'

/**
 * Componente para redirigir según el rol
 */
function RoleBasedRedirect() {
    // Este componente se usa cuando el usuario está autenticado
    // pero accede a una ruta que necesita redirección basada en rol
    return <Navigate to="/login" replace />
}

/**
 * Router principal de la aplicación
 */
export const router = createBrowserRouter([
    // Ruta de Login
    {
        path: '/login',
        element: <LoginPage />,
    },

    // Rutas de Administrador
    {
        path: '/admin',
        element: (
            <ProtectedRoute requiredRole= "ADMIN" >
            <AdminDashboard />
            </ProtectedRoute>
        ),
    },

// Rutas de Mensajero
{
    path: '/messenger',
        element: (
            <ProtectedRoute requiredRole= "MESSENGER" >
            <MessengerDashboard />
            </ProtectedRoute>
        ),
},

// Ruta raíz - redirige al login
{
    path: '/',
        element: <RoleBasedRedirect />,
},

// Ruta 404 - redirige al login
{
    path: '*',
        element: <Navigate to="/login" replace />,
    },
])
