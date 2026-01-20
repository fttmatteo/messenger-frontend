import { Badge } from "@/components/ui/badge"
import type { ServiceStatus } from "@/types/service.types"
import { Bike, CheckCircle, CornerDownLeft, XCircle, CheckCheck, Clock, Trash2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface StatusBadgeProps {
    status: ServiceStatus
    size?: 'sm' | 'md'
    className?: string
    showLabel?: boolean
}

const statusConfig: Partial<Record<ServiceStatus, { label: string; className: string; Icon: LucideIcon }>> = {
    ASSIGNED: {
        label: 'Asignado',
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200',
        Icon: Bike
    },
    DELIVERED: {
        label: 'Entregado',
        className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200',
        Icon: CheckCircle
    },
    RETURNED: {
        label: 'Devuelto',
        className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200',
        Icon: CornerDownLeft
    },
    CANCELED: {
        label: 'Cancelado',
        className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200',
        Icon: XCircle
    },
    RESOLVED: {
        label: 'Revisado',
        className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200',
        Icon: CheckCheck
    },
    DELETED: {
        label: 'Eliminado',
        className: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200',
        Icon: Trash2
    }
}

const defaultConfig = {
    label: 'Pendiente',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200',
    Icon: Clock
}

/**
 * Insignia visual (badge) que representa el estado de un servicio.
 * Incluye un icono descriptivo y soporte para temas claro/oscuro.
 */
export function StatusBadge({ status, size = 'md', className, showLabel = false }: StatusBadgeProps) {
    const config = statusConfig[status] || defaultConfig
    const Icon = config.Icon
    const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'

    const badge = (
        <Badge
            variant="outline"
            className={`${config.className} ${size === 'sm' ? 'p-1' : 'p-1.5'} border ${className || ''}`}
        >
            <Icon className={iconSize} />
            {showLabel && <span className="ml-1 text-xs font-medium">{config.label}</span>}
        </Badge>
    )

    if (!showLabel) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    {badge}
                </TooltipTrigger>
                <TooltipContent>
                    <p>{config.label}</p>
                </TooltipContent>
            </Tooltip>
        )
    }

    return badge
}
