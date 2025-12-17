/**
 * DeliveryCard - Tarjeta de Entrega para Mensajeros
 * 
 * Tarjeta optimizada para visualización móvil de entregas.
 * Integrada con tipos del backend y mutations de React Query.
 */

import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ServiceDelivery, SERVICE_STATUS_CONFIG } from '../types'
import { useCompleteService } from '../hooks'
import {
    MapPin,
    Phone,
    Navigation,
    Clock,
    CheckCircle2,
    ChevronRight
} from 'lucide-react'

/**
 * Props de DeliveryCard
 */
interface DeliveryCardProps {
    /** Datos del servicio de entrega */
    service: ServiceDelivery
    /** Handler para ver detalles */
    onViewDetails?: () => void
    /** Handler para navegar */
    onNavigate?: () => void
    /** Handler para llamar */
    onCall?: () => void
    /** Callback al completar exitosamente */
    onCompleted?: () => void
}

/**
 * Formatea la fecha para mostrar
 */
function formatDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    
    if (isToday) {
        return `Hoy ${date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}`
    }
    return date.toLocaleDateString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

/**
 * DeliveryCard Component
 */
export function DeliveryCard({
    service,
    onViewDetails,
    onNavigate,
    onCall,
    onCompleted,
}: DeliveryCardProps) {
    const { mutate: completeService, isPending: isCompleting } = useCompleteService()
    
    const statusConfig = SERVICE_STATUS_CONFIG[service.status] || SERVICE_STATUS_CONFIG.PENDING

    // Determinar si se puede completar (solo ASSIGNED o IN_PROGRESS)
    const canComplete = service.status === 'ASSIGNED' || service.status === 'IN_PROGRESS'

    const handleComplete = () => {
        completeService(service.id, {
            onSuccess: () => {
                onCompleted?.()
            }
        })
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden active:scale-[0.98] transition-transform">
            {/* Header con placa y estado */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                    {/* Número de placa destacado */}
                    <div className="bg-slate-800 px-3 py-1.5 rounded-lg">
                        <span className="font-mono font-bold text-white text-lg">
                            {service.licensePlate}
                        </span>
                    </div>
                    <span className="text-slate-500 text-sm">#{service.id}</span>
                </div>

                {/* Badge de estado */}
                <div className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
                    statusConfig.bgColor
                )}>
                    <span className={cn("text-xs font-medium", statusConfig.color)}>
                        {statusConfig.label}
                    </span>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="p-4 space-y-3">
                {/* Concesionario */}
                <div>
                    <p className="text-slate-400 text-xs mb-0.5">Concesionario</p>
                    <p className="text-white font-medium">{service.dealershipName || 'Sin asignar'}</p>
                </div>

                {/* Dirección */}
                {service.dealershipAddress && (
                    <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                        <p className="text-slate-300 text-sm leading-tight">{service.dealershipAddress}</p>
                    </div>
                )}

                {/* Observaciones si hay */}
                {service.observations && (
                    <div className="bg-amber-500/10 px-3 py-2 rounded-lg">
                        <p className="text-amber-400 text-xs">{service.observations}</p>
                    </div>
                )}

                {/* Hora */}
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDate(service.createdAt)}</span>
                </div>
            </div>

            {/* Acciones rápidas */}
            <div className="px-4 pb-4 space-y-2">
                {/* Botón de completar si es posible */}
                {canComplete && (
                    <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        onClick={handleComplete}
                        disabled={isCompleting}
                    >
                        {isCompleting ? (
                            <>
                                <Spinner size="sm" className="mr-2" />
                                Completando...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Marcar como Entregado
                            </>
                        )}
                    </Button>
                )}

                {/* Acciones secundarias */}
                <div className="flex gap-2">
                    {onCall && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                            onClick={onCall}
                        >
                            <Phone className="w-4 h-4 mr-2" />
                            Llamar
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                        onClick={onNavigate}
                    >
                        <Navigation className="w-4 h-4 mr-2" />
                        Navegar
                    </Button>
                    <Button
                        size="sm"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={onViewDetails}
                    >
                        Detalles
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

/**
 * DeliveryCardSkeleton - Skeleton para loading state
 */
export function DeliveryCardSkeleton() {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden animate-pulse">
            <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-800 w-24 h-8 rounded-lg" />
                    <div className="bg-slate-800 w-8 h-4 rounded" />
                </div>
                <div className="bg-slate-800 w-20 h-6 rounded-full" />
            </div>
            <div className="p-4 space-y-3">
                <div className="space-y-1">
                    <div className="bg-slate-800 w-20 h-3 rounded" />
                    <div className="bg-slate-800 w-40 h-5 rounded" />
                </div>
                <div className="bg-slate-800 w-full h-4 rounded" />
                <div className="bg-slate-800 w-24 h-3 rounded" />
            </div>
            <div className="px-4 pb-4">
                <div className="bg-slate-800 w-full h-10 rounded" />
            </div>
        </div>
    )
}
