import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, CheckCircle, Clock, MapPin } from "lucide-react"

export default function MessengerDashboard() {

    const todayStats = [
        { title: "Pendientes", value: "5", icon: Clock, color: "text-yellow-500" },
        { title: "Completadas", value: "12", icon: CheckCircle, color: "text-green-500" },
        { title: "En Ruta", value: "2", icon: MapPin, color: "text-blue-500" },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">¡Bienvenido!</h1>
                <p className="text-muted-foreground">
                    Tu resumen de entregas de hoy
                </p>
            </div>

            <div className="grid gap-4 grid-cols-3">
                {todayStats.map((stat) => (
                    <Card key={stat.title} className="text-center">
                        <CardContent className="pt-6">
                            <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-sm text-muted-foreground">
                                {stat.title}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Package className="h-5 w-5" />
                        Próxima Entrega
                    </CardTitle>
                    <CardDescription className="text-sm">
                        Tu siguiente destino
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <p className="font-medium text-lg">Toyota Bogotá Norte</p>
                        <p className="text-base text-muted-foreground">
                            Calle 127 # 15-20, Bogotá
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Entrega estimada: 10:30 AM
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Entregas de Hoy</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-4">
                        Ve a la pestaña "Entregas" para ver tu lista completa
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
