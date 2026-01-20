import { Card, CardContent } from "@/components/ui/card"
import { Clock, CheckCircle, CornerDownLeft, Package } from "lucide-react"

interface StatsBarProps {
    stats: {
        total: number
        pending: number
        delivered: number
        returned: number
    }
    loading?: boolean
}

/**
 * Barra de estadísticas resumidas para el mensajero.
 * Muestra contadores de servicios pendientes, entregados, devueltos y totales.
 */
export function StatsBar({ stats, loading }: StatsBarProps) {
    const statItems = [
        {
            value: stats.pending,
            icon: Clock,
            color: "text-yellow-600 dark:text-yellow-400",
            bg: "bg-yellow-100 dark:bg-yellow-900/30"
        },
        {
            value: stats.delivered,
            icon: CheckCircle,
            color: "text-green-600 dark:text-green-400",
            bg: "bg-green-100 dark:bg-green-900/30"
        },
        {
            value: stats.returned,
            icon: CornerDownLeft,
            color: "text-orange-600 dark:text-orange-400",
            bg: "bg-orange-100 dark:bg-orange-900/30"
        },
        {
            value: stats.total,
            icon: Package,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-100 dark:bg-blue-900/30"
        },
    ]

    if (loading) {
        return (
            <div className="flex gap-2 justify-between">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="flex-1 h-14 bg-muted rounded-xl animate-pulse"
                    />
                ))}
            </div>
        )
    }

    return (
        <div className="flex gap-2 justify-between">
            {statItems.map((stat, index) => (
                <Card
                    key={index}
                    className={`flex-1 ${stat.bg} border-0 shadow-sm`}
                >
                    <CardContent className="p-2 flex flex-col items-center justify-center min-h-[56px]">
                        <stat.icon className={`h-4 w-4 ${stat.color} mb-0.5`} />
                        <span className={`text-xl font-bold leading-none ${stat.color}`}>
                            {stat.value}
                        </span>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
