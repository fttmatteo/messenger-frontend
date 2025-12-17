/**
 * AdminDashboard - Página Principal del Administrador
 * 
 * Dashboard con resumen de estadísticas y accesos rápidos.
 */

import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Truck, CheckCircle, Clock, AlertTriangle, Users, Building2 } from 'lucide-react'

/**
 * Estadísticas de ejemplo
 */
const stats = [
    { label: 'Entregas Hoy', value: '24', icon: Truck, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
    { label: 'Completadas', value: '18', icon: CheckCircle, color: 'text-green-400', bgColor: 'bg-green-500/10' },
    { label: 'Pendientes', value: '4', icon: Clock, color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
    { label: 'Con Problemas', value: '2', icon: AlertTriangle, color: 'text-red-400', bgColor: 'bg-red-500/10' },
]

/**
 * AdminDashboard Component
 */
export function AdminDashboard() {
    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-slate-400">Resumen del día</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-slate-800 bg-slate-900 hover:border-blue-500/50 transition-colors cursor-pointer">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-lg">
                                <Users className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="font-medium text-white">Gestionar Empleados</p>
                                <p className="text-sm text-slate-400">12 empleados activos</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-800 bg-slate-900 hover:border-purple-500/50 transition-colors cursor-pointer">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-purple-500/10 rounded-lg">
                                <Building2 className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="font-medium text-white">Gestionar Concesionarios</p>
                                <p className="text-sm text-slate-400">8 concesionarios registrados</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    )
}
