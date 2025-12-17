/**
 * Componente Principal de la Aplicación E-PLACA
 * 
 * Punto de entrada que configura:
 * - React Router para navegación
 * - AuthProvider para estado de autenticación
 * - PWAPrompt para actualizaciones
 * 
 * Flujo de autenticación:
 * 1. Usuario entra → Ve página de Login
 * 2. Ingresa credenciales → Se autentica
 * 3. Según rol → Redirige a Admin o Messenger
 */

import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { router } from '@/routes'
import { PWAPrompt } from '@/components/PWAPrompt'

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
 */
function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    )
}

export default App
