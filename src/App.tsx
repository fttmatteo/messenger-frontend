/**
 * Componente Principal de la Aplicación E-PLACA
 * 
 * Este es el componente raíz que contiene la estructura principal
 * y el enrutamiento de la aplicación.
 * 
 * Características:
 * - PWA con soporte offline
 * - Prompt de actualización automática
 * - Landing page con información del sistema
 * 
 * TODO: Integrar React Router para navegación
 * TODO: Agregar AuthProvider para estado de autenticación
 */

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PWAPrompt } from '@/components/PWAPrompt'
import { MapPin, Bike, Users } from 'lucide-react'

/**
 * App - Componente raíz de la aplicación
 * 
 * Renderiza la landing page con el diseño principal.
 * Usa un fondo con gradiente oscuro y componentes de Shadcn/UI.
 * Incluye el componente PWAPrompt para notificaciones de actualización.
 * 
 * @returns JSX.Element - Página de bienvenida
 */
function App() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <main className="flex flex-col items-center justify-center min-h-screen p-8">
                {/* Encabezado con logo y título */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/25">
                            <Bike className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                            E-PLACA
                        </h1>
                    </div>
                    <p className="text-slate-400 text-lg">
                        Sistema de gestión de entregas y tracking en tiempo real
                    </p>
                </div>

                {/* Cards de características principales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
                    {/* Card: Tracking en Vivo */}
                    <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1">
                        <CardHeader>
                            <div className="p-2 w-fit bg-blue-500/10 rounded-lg mb-2">
                                <MapPin className="w-5 h-5 text-blue-400" />
                            </div>
                            <CardTitle className="text-white">Tracking en Vivo</CardTitle>
                            <CardDescription className="text-slate-400">
                                Monitoreo en tiempo real con Google Maps
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-500 text-sm">
                                Visualiza la ubicación de todos los mensajeros en un mapa interactivo.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Card: Gestión de Entregas */}
                    <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1">
                        <CardHeader>
                            <div className="p-2 w-fit bg-purple-500/10 rounded-lg mb-2">
                                <Bike className="w-5 h-5 text-purple-400" />
                            </div>
                            <CardTitle className="text-white">Gestión de Entregas</CardTitle>
                            <CardDescription className="text-slate-400">
                                Control completo del ciclo de entrega
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-500 text-sm">
                                Desde la asignación hasta la confirmación con firma digital.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Card: Administración */}
                    <Card className="border-slate-700/50 bg-slate-800/50 backdrop-blur-sm hover:border-green-500/50 transition-all duration-300 hover:-translate-y-1">
                        <CardHeader>
                            <div className="p-2 w-fit bg-green-500/10 rounded-lg mb-2">
                                <Users className="w-5 h-5 text-green-400" />
                            </div>
                            <CardTitle className="text-white">Administración</CardTitle>
                            <CardDescription className="text-slate-400">
                                Panel de control para administradores
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-500 text-sm">
                                Gestiona concesionarios, empleados y reportes.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Botones de Acción */}
                <div className="mt-12 flex gap-4">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25">
                        Iniciar Sesión
                    </Button>
                    <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white">
                        Ver Demo
                    </Button>
                </div>

                {/* Pie de página */}
                <p className="text-slate-600 text-sm mt-16">
                    © 2025 E-PLACA. Todos los derechos reservados.
                </p>
            </main>

            {/* Componente PWA para actualizaciones y estado offline */}
            <PWAPrompt />
        </div>
    )
}

export default App
