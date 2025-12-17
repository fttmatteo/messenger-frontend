/**
 * LoginPage - Página de Inicio de Sesión Universal
 * 
 * Página de login que sirve para todos los usuarios.
 * Después del login, redirige según el rol:
 * - ADMIN → Panel de administrador (/admin)
 * - MESSENGER → App de mensajero (/messenger)
 */

import { useState, FormEvent, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bike, Loader2, AlertCircle } from 'lucide-react'

/**
 * LoginPage Component
 */
export function LoginPage() {
    const { login, isLoading, error, clearError, isAuthenticated, user } = useAuth()
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    /**
     * Redirigir al usuario cuando se autentica exitosamente
     */
    useEffect(() => {
        if (isAuthenticated && user) {
            // Redirigir según el rol del usuario
            const redirectPath = user.role === 'ADMIN' ? '/admin' : '/messenger'
            navigate(redirectPath, { replace: true })
        }
    }, [isAuthenticated, user, navigate])

    /**
     * Manejar envío del formulario
     */
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        clearError()

        try {
            await login({ userName: username, password })
            // La redirección se manejará en el useEffect de arriba
        } catch {
            // El error ya está en el estado del contexto
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            {/* Tarjeta de Login */}
            <Card className="w-full max-w-md border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
                <CardHeader className="text-center pb-2">
                    {/* Logo */}
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/25">
                            <Bike className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">
                        E-PLACA
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        Ingresa tus credenciales para continuar
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Error message */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>Usuario o contraseña incorrectos</span>
                            </div>
                        )}

                        {/* Campo de usuario */}
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-slate-300">
                                Usuario
                            </Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Ingresa tu usuario"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
                                required
                                disabled={isLoading}
                                autoComplete="username"
                            />
                        </div>

                        {/* Campo de contraseña */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-300">
                                Contraseña
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Ingresa tu contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
                                required
                                disabled={isLoading}
                                autoComplete="current-password"
                            />
                        </div>

                        {/* Botón de submit */}
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Iniciando sesión...
                                </>
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </Button>
                    </form>

                    {/* Información adicional */}
                    <div className="mt-6 pt-6 border-t border-slate-700">
                        <p className="text-center text-slate-500 text-sm">
                            Sistema de gestión de entregas y tracking
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Versión */}
            <p className="fixed bottom-4 text-slate-600 text-xs">
                E-PLACA v1.0.0
            </p>
        </div>
    )
}
