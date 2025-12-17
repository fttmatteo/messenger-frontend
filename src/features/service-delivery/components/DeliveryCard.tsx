/**
 * DeliveryCard - Tarjeta Grande de Entrega para Mensajeros
 * 
 * Tarjeta optimizada para visualización móvil de entregas.
 * Diseño grande y táctil para fácil interacción.
 * 
 * Características:
 * - Información clara de la entrega
 * - Badge de estado con colores
 * - Acciones rápidas (llamar, navegar, actualizar)
 * - Swipe actions (futuro)
 */

import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'
import {
    MapPin,
    Phone,
    Navigation,
    Clock,
    CheckCircle2,
    AlertCircle,
    Truck,
    ChevronRight
} from 'lucide-react'

/**
 * Estados posibles de una entrega
 */
type DeliveryStatus = 'ASSIGNED' | 'PENDING' | 'DELIVERED' | 'FAILED' | 'RETURNED'

/**
 * Props de DeliveryCard
 */
interface DeliveryCardProps {
    /** ID del servicio */
    id: number
    /** Número de placa */
    plateNumber: string
    /** Nombre del concesionario */
    dealershipName: string
    /** Dirección de entrega */
    address: string
    /** Estado actual */
    status: DeliveryStatus
    /** Hora de creación */
    createdAt: string
    /** Teléfono de contacto (opcional) */
    phone?: string
    /** Handler para ver detalles */
    onViewDetails?: () => void
    /** Handler para navegar */
    onNavigate?: () => void
    /** Handler para llamar */
    onCall?: () => void
}

/**
 * Configuración de colores y labels por estado
 */
const statusConfig: Record<DeliveryStatus, {
    label: string
    color: string
    bgColor: string
    icon: React.ElementType
}> = {
    ASSIGNED: {
        label: 'Asignado',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        icon: Truck
    },
    PENDING: {
        label: 'En Proceso',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10',
        icon: Clock
    },
    DELIVERED: {
        label: 'Entregado',
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        icon: CheckCircle2
    },
    FAILED: {
        label: 'Fallido',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        icon: AlertCircle
    },
    RETURNED: {
        label: 'Devuelto',
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
        icon: Truck
    },
}

/**
 * DeliveryCard Component
 */
export function DeliveryCard({
    id,
    plateNumber,
    dealershipName,
    address,
    status,
    createdAt,
    phone,
    onViewDetails,
    onNavigate,
    onCall,
}: DeliveryCardProps) {
    const config = statusConfig[status]
    const StatusIcon = config.icon

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden active:scale-[0.98] transition-transform">
            {/* Header con placa y estado */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                    {/* Número de placa destacado */}
                    <div className="bg-slate-800 px-3 py-1.5 rounded-lg">
                        <span className="font-mono font-bold text-white text-lg">
                            {plateNumber}
                        </span>
                    </div>
                    <span className="text-slate-500 text-sm">#{id}</span>
                </div>

                {/* Badge de estado */}
                <div className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
                    config.bgColor
                )}>
                    <StatusIcon className={cn("w-3.5 h-3.5", config.color)} />
                    <span className={cn("text-xs font-medium", config.color)}>
                        {config.label}
                    </span>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="p-4 space-y-3">
                {/* Concesionario */}
                <div>
                    <p className="text-slate-400 text-xs mb-0.5">Concesionario</p>
                    <p className="text-white font-medium">{dealershipName}</p>
                </div>

                {/* Dirección */}
                <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                    <p className="text-slate-300 text-sm leading-tight">{address}</p>
                </div>

                {/* Hora */}
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{createdAt}</span>
                </div>
            </div>

            {/* Acciones rápidas */}
            <div className="px-4 pb-4 flex gap-2">
                {phone && (
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
    )
}
