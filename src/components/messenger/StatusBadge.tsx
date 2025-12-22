import { Badge } from "@/components/ui/badge"
import type { ServiceStatus } from "@/types/service.types"

interface StatusBadgeProps {
    status: ServiceStatus
    size?: 'sm' | 'md'
    className?: string
}

const statusConfig: Partial<Record<ServiceStatus, { label: string; className: string; emoji: string }>> = {
    ASSIGNED: {
        label: 'Asignado',
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200',
        emoji: '🚴'
    },
    DELIVERED: {
        label: 'Entregado',
        className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200',
        emoji: '✅'
    },
    RETURNED: {
        label: 'Devuelto',
        className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200',
        emoji: '↩️'
    },
    CANCELED: {
        label: 'Cancelado',
        className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200',
        emoji: '❌'
    },
    RESOLVED: {
        label: 'Resuelto',
        className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200',
        emoji: '✔️'
    }
}

const defaultConfig = {
    label: 'Pendiente',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200',
    emoji: '⏳'
}

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
    const config = statusConfig[status] || defaultConfig

    return (
        <Badge
            variant="outline"
            className={`${config.className} ${size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2 py-0.5'} border font-medium ${className || ''}`}
        >
            {config.emoji} {config.label}
        </Badge>
    )
}
