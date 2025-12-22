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

export function StatsBar({ stats, loading }: StatsBarProps) {
    const statItems = [
        {
            title: "Pendientes",
            value: stats.pending,
            icon: Clock,
            color: "text-yellow-500",
            bg: "bg-yellow-50 dark:bg-yellow-900/20"
        },
        {
            title: "Entregados",
            value: stats.delivered,
            icon: CheckCircle,
            color: "text-green-500",
            bg: "bg-green-50 dark:bg-green-900/20"
        },
        {
            title: "Devueltos",
            value: stats.returned,
            icon: CornerDownLeft,
            color: "text-orange-500",
            bg: "bg-orange-50 dark:bg-orange-900/20"
        },
        {
            title: "Total",
            value: stats.total,
            icon: Package,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-900/20"
        },
    ]

    if (loading) {
        return (
            <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="border-0 shadow-sm animate-pulse">
                        <CardContent className="p-2 text-center">
                            <div className="h-5 w-5 bg-muted rounded mx-auto mb-1" />
                            <div className="h-5 w-8 bg-muted rounded mx-auto mb-0.5" />
                            <div className="h-3 w-12 bg-muted rounded mx-auto" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-4 gap-2">
            {statItems.map((stat) => (
                <Card
                    key={stat.title}
                    className={`text-center ${stat.bg} border-0 shadow-sm`}
                >
                    <CardContent className="p-2">
                        <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-0.5 ${stat.color}`} />
                        <div className="text-lg sm:text-xl font-bold leading-tight">{stat.value}</div>
                        <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">
                            {stat.title}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
