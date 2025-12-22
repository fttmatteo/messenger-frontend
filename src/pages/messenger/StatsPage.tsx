import { useMessengerServices } from "@/hooks/useMessengerServices"
import { StatsBar } from "@/components/messenger/StatsBar"
import { AlertCircle } from "lucide-react"

export default function StatsPage() {
    const {
        loading,
        stats,
        error
    } = useMessengerServices()

    if (error) {
        return (
            <div className="flex items-center justify-center p-8 text-red-500">
                <AlertCircle className="mr-2 h-4 w-4" />
                <p>{error}</p>
            </div>
        )
    }

    return (
        <div className="p-4 space-y-6">
            <div className="space-y-2">
                <h2 className="text-lg font-semibold">Resumen de Hoy</h2>
                <p className="text-sm text-muted-foreground">
                    Estadísticas de tus servicios asignados, entregados y devueltos.
                </p>
            </div>

            <div className="pt-4">
                {/* Reusing StatsBar but maybe we can make it more detailed here later */}
                <StatsBar stats={stats} loading={loading} />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Eficiencia</p>
                    <p className="text-2xl font-bold mt-1">
                        {stats ? Math.round((stats.delivered / (stats.total || 1)) * 100) : 0}%
                    </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Pendientes</p>
                    <p className="text-2xl font-bold mt-1">{stats?.pending || 0}</p>
                </div>
            </div>
        </div>
    )
}
