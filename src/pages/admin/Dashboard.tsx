import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { employeeService } from "@/services/employee.service"
import { dealershipService } from "@/services/dealership.service"
import { Users, Store, Truck, TrendingUp, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface DashboardStats {
    totalEmployees: number
    totalDealerships: number
    geocodedDealerships: number
    adminCount: number
    messengerCount: number
}

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<DashboardStats>({
        totalEmployees: 0,
        totalDealerships: 0,
        geocodedDealerships: 0,
        adminCount: 0,
        messengerCount: 0,
    })

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)

            // Fetch employees and dealerships in parallel
            const [employees, dealerships] = await Promise.all([
                employeeService.getAll(),
                dealershipService.getAll(),
            ])

            // Calculate statistics
            const adminCount = employees.filter(e => e.role === 'ADMIN').length
            const messengerCount = employees.filter(e => e.role === 'MESSENGER').length
            const geocodedDealerships = dealerships.filter(d => d.isGeolocated).length

            setStats({
                totalEmployees: employees.length,
                totalDealerships: dealerships.length,
                geocodedDealerships,
                adminCount,
                messengerCount,
            })
        } catch (error: any) {
            toast.error("Error al cargar estadísticas", {
                description: error.message,
                id: "error-cargar-estadisticas"
            })
        } finally {
            setLoading(false)
        }
    }

    const geolocatedPercentage = stats.totalDealerships > 0
        ? ((stats.geocodedDealerships / stats.totalDealerships) * 100).toFixed(1)
        : '0.0'

    const dashboardCards = [
        {
            title: "Empleados",
            value: stats.totalEmployees.toString(),
            icon: Users,
            description: `${stats.adminCount} admin, ${stats.messengerCount} mensajeros`,
            color: "text-blue-500"
        },
        {
            title: "Concesionarios",
            value: stats.totalDealerships.toString(),
            icon: Store,
            description: `${stats.geocodedDealerships} geocodificados`,
            color: "text-green-500"
        },
        {
            title: "Tasa de Geolocalización",
            value: `${geolocatedPercentage}%`,
            icon: TrendingUp,
            description: `${stats.geocodedDealerships} de ${stats.totalDealerships} ubicados`,
            color: "text-purple-500"
        },
        {
            title: "Entregas Hoy",
            value: "0",
            icon: Truck,
            description: "Módulo en desarrollo",
            color: "text-orange-500"
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Panel de Control</h1>
                    <p className="text-muted-foreground mt-1">
                        Vista general del sistema
                    </p>
                </div>
                {loading && (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-4 rounded" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16 mb-2" />
                                <Skeleton className="h-3 w-32" />
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    dashboardCards.map((card) => (
                        <Card key={card.title} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-medium">
                                    {card.title}
                                </CardTitle>
                                <card.icon className={`h-4 w-4 ${card.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{card.value}</div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {card.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Distribución de Empleados</CardTitle>
                        <CardDescription>
                            Empleados por rol en el sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        ) : stats.totalEmployees === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No hay empleados registrados.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                                        <span className="text-base font-medium">Administradores</span>
                                    </div>
                                    <span className="text-base text-muted-foreground">
                                        {stats.adminCount} ({stats.totalEmployees > 0 ? ((stats.adminCount / stats.totalEmployees) * 100).toFixed(0) : 0}%)
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                        <span className="text-base font-medium">Mensajeros</span>
                                    </div>
                                    <span className="text-base text-muted-foreground">
                                        {stats.messengerCount} ({stats.totalEmployees > 0 ? ((stats.messengerCount / stats.totalEmployees) * 100).toFixed(0) : 0}%)
                                    </span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Estado de Geolocalización</CardTitle>
                        <CardDescription>
                            Concesionarios con ubicación verificada
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        ) : stats.totalDealerships === 0 ? (
                            <p className="text-base text-muted-foreground">
                                No hay concesionarios registrados.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                        <span className="text-base font-medium">Geocodificados</span>
                                    </div>
                                    <span className="text-base text-muted-foreground">
                                        {stats.geocodedDealerships} ({geolocatedPercentage}%)
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-gray-400" />
                                        <span className="text-base font-medium">Sin ubicación</span>
                                    </div>
                                    <span className="text-base text-muted-foreground">
                                        {stats.totalDealerships - stats.geocodedDealerships} ({(100 - parseFloat(geolocatedPercentage)).toFixed(1)}%)
                                    </span>
                                </div>
                                {/* Progress bar */}
                                <div className="mt-4">
                                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 transition-all duration-500"
                                            style={{ width: `${geolocatedPercentage}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
