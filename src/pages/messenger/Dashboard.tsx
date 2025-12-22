import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, CheckCircle, Clock, MapPin, Navigation, ChevronRight } from "lucide-react"

export default function MessengerDashboard() {

    const todayStats = [
        { title: "Pendientes", value: "5", icon: Clock, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
        { title: "Completadas", value: "12", icon: CheckCircle, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
        { title: "En Ruta", value: "2", icon: MapPin, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    ]

    return (
        <div className="flex flex-col gap-3 sm:gap-4 min-h-0">
            {/* Welcome Header - Responsive */}
            <header className="flex-shrink-0">
                <h1 className="text-lg sm:text-xl font-bold leading-tight">¡Bienvenido!</h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Tu resumen de entregas de hoy
                </p>
            </header>

            {/* Stats Grid - Flexible for all screen sizes */}
            <section className="grid grid-cols-3 gap-2 sm:gap-3 flex-shrink-0">
                {todayStats.map((stat) => (
                    <Card
                        key={stat.title}
                        className={`text-center ${stat.bg} border-0 shadow-sm`}
                    >
                        <CardContent className="p-2.5 sm:p-3">
                            <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 ${stat.color}`} />
                            <div className="text-lg sm:text-xl font-bold leading-tight">{stat.value}</div>
                            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                                {stat.title}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </section>

            {/* Next Delivery Card - Touch-friendly */}
            <Card className="border-2 border-primary/20 shadow-md flex-shrink-0">
                <CardHeader className="pb-2 pt-3 sm:pt-4 px-3 sm:px-4">
                    <div className="flex items-center justify-between gap-2">
                        <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                            <div className="p-1 sm:p-1.5 bg-primary/10 rounded-md sm:rounded-lg flex-shrink-0">
                                <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                            </div>
                            <span className="truncate">Próxima Entrega</span>
                        </CardTitle>
                        <span className="text-[10px] sm:text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-1.5 sm:px-2 py-0.5 rounded-full font-medium whitespace-nowrap flex-shrink-0">
                            Pendiente
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2 sm:space-y-3">
                    <div className="min-w-0">
                        <p className="font-semibold text-sm sm:text-base truncate">Toyota Bogotá Norte</p>
                        <p className="text-xs sm:text-sm text-muted-foreground flex items-start gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">Calle 127 # 15-20, Bogotá</span>
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                            Entrega estimada: <span className="font-medium text-foreground">10:30 AM</span>
                        </p>
                    </div>
                    <Button className="w-full h-11 text-sm gap-2 touch-manipulation">
                        <Navigation className="h-4 w-4" />
                        Iniciar Navegación
                    </Button>
                </CardContent>
            </Card>

            {/* Today's Deliveries Link - Touch-optimized */}
            <Card className="active:bg-muted/50 active:scale-[0.98] transition-all cursor-pointer touch-manipulation flex-shrink-0">
                <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className="p-1.5 sm:p-2 bg-muted rounded-md sm:rounded-lg flex-shrink-0">
                                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-medium text-sm truncate">Entregas de Hoy</p>
                                <p className="text-xs text-muted-foreground">
                                    Ver lista completa
                                </p>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

