/**
 * AdminDashboard - Página Principal del Administrador
 * 
 * Dashboard con estadísticas reales.
 * Usa React Query para cargar datos del backend.
 */

import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useEmployees } from '@/hooks/useEmployees'
import { useDealerships } from '@/hooks/useDealerships'
import { useServices } from '@/hooks/useServices'
import { useActiveMessengers } from '@/hooks/useTracking'
import {
    Truck, CheckCircle, Clock, AlertTriangle, Users, Building2,
    MapPin
} from 'lucide-react'

/**
 * AdminDashboard Component
 */
export function AdminDashboard() {
    const navigate = useNavigate()

    // Cargar datos reales
    const { data: employees, isLoading: loadingEmployees } = useEmployees()
    const { data: dealerships, isLoading: loadingDealerships } = useDealerships()
    const { data: services, isLoading: loadingServices } = useServices()
    const { data: activeMessengers, isLoading: loadingTracking } = useActiveMessengers()

    // Calcular estadísticas
    const todayServices = services ?? []
    const completedToday = todayServices.filter(s => s.status === 'COMPLETED').length
    const pendingToday = todayServices.filter(s => s.status === 'PENDING' || s.status === 'ASSIGNED').length
    const inProgressToday = todayServices.filter(s => s.status === 'IN_PROGRESS').length

    const stats = [
        {
            label: 'Entregas Hoy',
            value: loadingServices ? '-' : todayServices.length.toString(),
            icon: Truck,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10'
        },
        {
            label: 'Completadas',
            value: loadingServices ? '-' : completedToday.toString(),
            icon: CheckCircle,
            color: 'text-green-400',
            bgColor: 'bg-green-500/10'
        },
        {
            label: 'Pendientes',
            value: loadingServices ? '-' : pendingToday.toString(),
            icon: Clock,
            color: 'text-amber-400',
            bgColor: 'bg-amber-500/10'
        },
        {
            label: 'En Progreso',
            value: loadingServices ? '-' : inProgressToday.toString(),
            icon: AlertTriangle,
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10'
        },
    ]

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-slate-400">Panel de administración</p>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <Card key={stat.label} className="border-slate-800 bg-slate-900">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">
                                    {stat.label}
                                </CardTitle>
                                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-white">{stat.value}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Accesos rápidos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card
                        className="border-slate-800 bg-slate-900 hover:border-blue-500/50 transition-colors cursor-pointer"
                        onClick={() => navigate('/admin/employees')}
                    >
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-lg">
                                <Users className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="font-medium text-white">Empleados</p>
                                <p className="text-sm text-slate-400">
                                    {loadingEmployees ? <Spinner size="sm" /> : `${employees?.length ?? 0} registrados`}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className="border-slate-800 bg-slate-900 hover:border-purple-500/50 transition-colors cursor-pointer"
                        onClick={() => navigate('/admin/dealerships')}
                    >
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-purple-500/10 rounded-lg">
                                <Building2 className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="font-medium text-white">Concesionarios</p>
                                <p className="text-sm text-slate-400">
                                    {loadingDealerships ? <Spinner size="sm" /> : `${dealerships?.length ?? 0} registrados`}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className="border-slate-800 bg-slate-900 hover:border-green-500/50 transition-colors cursor-pointer"
                        onClick={() => navigate('/admin/tracking')}
                    >
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-green-500/10 rounded-lg">
                                <MapPin className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <p className="font-medium text-white">Mensajeros Activos</p>
                                <p className="text-sm text-slate-400">
                                    {loadingTracking ? <Spinner size="sm" /> : `${activeMessengers?.length ?? 0} en línea`}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    )
}
