/**
 * MessengerDashboard - Página Principal del Mensajero
 * 
 * Dashboard móvil con entregas asignadas usando datos reales del backend.
 * Incluye tracking GPS y acciones de entrega.
 */

import { MessengerLayout } from '@/components/layout/MessengerLayout'
import { DeliveryCard, DeliveryCardSkeleton } from '@/components/DeliveryCard'
import { useMyServices } from '@/hooks/useServices'
import { useAuth } from '@/context/AuthContext'
import { MapPin, AlertCircle, Package } from 'lucide-react'

/**
 * MessengerDashboard Component
 */
export function MessengerDashboard() {
    const { user } = useAuth()

    // Obtener entregas del mensajero actual
    // Nota: El ID del mensajero viene del usuario autenticado
    const messengerId = user?.id || 0
    const { data: services, isLoading, error, refetch } = useMyServices(messengerId)

    // Filtrar solo entregas activas (no completadas ni canceladas)
    const activeServices = services?.filter(s =>
        s.status !== 'COMPLETED' && s.status !== 'CANCELLED'
    ) ?? []

    const completedToday = services?.filter(s => s.status === 'COMPLETED').length ?? 0

    return (
        <MessengerLayout>
            <div className="p-4 space-y-4">
                {/* Header de entregas */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">Mis Entregas</h2>
                        <p className="text-slate-400 text-sm">
                            {isLoading ? 'Cargando...' : `${activeServices.length} pendientes`}
                            {completedToday > 0 && ` • ${completedToday} completadas hoy`}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-green-400 text-xs font-medium">GPS activo</span>
                    </div>
                </div>

                {/* Botón de ver mapa */}
                <button className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium transition-colors">
                    <MapPin className="w-5 h-5" />
                    Ver Ruta en Mapa
                </button>

                {/* Estados de carga y error */}
                {isLoading && (
                    <div className="space-y-4">
                        <DeliveryCardSkeleton />
                        <DeliveryCardSkeleton />
                    </div>
                )}

                {error && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="p-3 bg-red-500/10 rounded-full mb-3">
                            <AlertCircle className="w-8 h-8 text-red-400" />
                        </div>
                        <p className="text-red-400 font-medium">Error al cargar entregas</p>
                        <p className="text-slate-500 text-sm mt-1">{error.message}</p>
                        <button
                            onClick={() => refetch()}
                            className="mt-3 text-blue-400 text-sm hover:underline"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {/* Lista vacía */}
                {!isLoading && !error && activeServices.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="p-4 bg-slate-800 rounded-full mb-4">
                            <Package className="w-10 h-10 text-slate-500" />
                        </div>
                        <p className="text-white font-medium">Sin entregas pendientes</p>
                        <p className="text-slate-500 text-sm mt-1">
                            Las nuevas entregas aparecerán aquí
                        </p>
                    </div>
                )}

                {/* Lista de entregas */}
                {!isLoading && !error && activeServices.length > 0 && (
                    <div className="space-y-4">
                        {activeServices.map((service) => (
                            <DeliveryCard
                                key={service.id}
                                service={service}
                                onViewDetails={() => console.log('Ver detalles', service.id)}
                                onNavigate={() => {
                                    // Abrir Google Maps con la dirección
                                    if (service.dealershipAddress) {
                                        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(service.dealershipAddress)}`
                                        window.open(url, '_blank')
                                    }
                                }}
                                onCompleted={() => refetch()}
                            />
                        ))}
                    </div>
                )}
            </div>
        </MessengerLayout>
    )
}
