import { Rocket } from "lucide-react"

/**
 * Vista de marcador de posición para el Panel de Control (Dashboard) de administración.
 * Actualmente muestra un mensaje indicando que las estadísticas avanzadas estarán
 * disponibles próximamente.
 */
export default function AdminDashboard() {
    return (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500 overflow-y-auto">
            <div className="rounded-full bg-primary/10 p-6 mb-6">
                <Rocket className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-2">
                Próximamente
            </h1>
            <p className="text-sm text-muted-foreground max-w-[500px]">
                Estamos preparando un nuevo panel de control con estadísticas avanzadas y métricas en tiempo real.
            </p>
        </div>
    )
}
