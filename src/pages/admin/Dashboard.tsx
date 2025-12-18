import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Store, Truck, TrendingUp } from "lucide-react"

export default function AdminDashboard() {

    const stats = [
        { title: "Empleados", value: "24", icon: Users, change: "+2 este mes" },
        { title: "Concesionarios", value: "12", icon: Store, change: "+1 este mes" },
        { title: "Entregas Hoy", value: "156", icon: Truck, change: "+23% vs ayer" },
        { title: "Tasa de Éxito", value: "98.5%", icon: TrendingUp, change: "+0.5%" },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Panel de Control</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {stat.change}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Actividad Reciente</CardTitle>
                        <CardDescription>
                            Últimas acciones en el sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            No hay actividad reciente para mostrar.
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Entregas Pendientes</CardTitle>
                        <CardDescription>
                            Entregas que requieren atención
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Todas las entregas están al día.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
