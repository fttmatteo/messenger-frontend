/**
 * Componente Principal de la Aplicación E-PLACA
 * 
 * Punto de entrada que configura:
 * - React Query para data fetching con cache
 * - React Router para navegación
 * - AuthProvider para estado de autenticación
 * - ErrorBoundary para captura de errores
 * - PWAPrompt para actualizaciones
 * 
 * Flujo de autenticación:
 * 1. Usuario entra → Ve página de Login
 * 2. Ingresa credenciales → Se autentica
 * 3. Según rol → Redirige a Admin o Messenger
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { router } from '@/routes'
import { PWAPrompt } from '@/components/PWAPrompt'

/**
 * Cliente de React Query con configuración por defecto
 * - staleTime: 5 minutos antes de considerar datos obsoletos
 * - retry: 1 reintento en caso de error
 */
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutos
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
})

/**
 * Contenido principal con router
 */
function AppContent() {
    return (
        <>
            <RouterProvider router={router} />
            <PWAPrompt />
        </>
    )
}

/**
 * App - Componente raíz
 * 
 * Envuelve toda la aplicación con los providers necesarios.
 * ErrorBoundary captura errores para evitar que la app crashee.
 */
function App() {
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <AppContent />
                </AuthProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    )
}

export default App


