/**
 * AdminDashboard - Página Principal del Administrador
 * 
 * Dashboard con estadísticas reales y gestión de empleados.
 * Usa React Query para cargar datos del backend.
 */

import { useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { EmployeeList, EmployeeForm, Employee, useEmployees } from '@/features/employees'
import { useDealerships } from '@/features/dealerships'
import { useServices } from '@/features/service-delivery'
import { useActiveMessengers } from '@/features/tracking'
import { 
    Truck, CheckCircle, Clock, AlertTriangle, Users, Building2, 
    MapPin, X, Plus
} from 'lucide-react'

/**
 * Modal simple para empleados
 */
function EmployeeModal({ 
    isOpen, 
    onClose, 
    employee 
}: { 
    isOpen: boolean
    onClose: () => void
    employee?: Employee | null 
}) {
    if (!isOpen) return null
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            
            {/* Modal */}
            <div className="relative z-10">
                <button 
                    onClick={onClose}
                    className="absolute -top-3 -right-3 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"
                >
                    <X className="w-4 h-4" />
                </button>
                <EmployeeForm 
                    employee={employee} 
                    onSuccess={onClose}
                    onCancel={onClose}
                />
            </div>
        </div>
    )
}

/**
 * AdminDashboard Component
 */
export function AdminDashboard() {
    const [showEmployeeModal, setShowEmployeeModal] = useState(false)
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
    const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'tracking'>('overview')

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

    const handleEditEmployee = (employee: Employee) => {
        setEditingEmployee(employee)
        setShowEmployeeModal(true)
    }

    const handleCreateEmployee = () => {
        setEditingEmployee(null)
        setShowEmployeeModal(true)
    }

    const handleCloseModal = () => {
        setShowEmployeeModal(false)
        setEditingEmployee(null)
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header con tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                        <p className="text-slate-400">Panel de administración</p>
                    </div>
                    <div className="flex gap-2">
                        {(['overview', 'employees', 'tracking'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    activeTab === tab 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                            >
                                {tab === 'overview' && 'Resumen'}
                                {tab === 'employees' && 'Empleados'}
                                {tab === 'tracking' && 'Tracking'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab: Overview */}
                {activeTab === 'overview' && (
                    <>
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
                                onClick={() => setActiveTab('employees')}
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
                            
                            <Card className="border-slate-800 bg-slate-900 hover:border-purple-500/50 transition-colors cursor-pointer">
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
                                onClick={() => setActiveTab('tracking')}
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
                    </>
                )}

                {/* Tab: Employees */}
                {activeTab === 'employees' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-white">Gestión de Empleados</h2>
                            <Button onClick={handleCreateEmployee} className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Nuevo Empleado
                            </Button>
                        </div>
                        <EmployeeList onEdit={handleEditEmployee} />
                    </div>
                )}

                {/* Tab: Tracking */}
                {activeTab === 'tracking' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-white">Tracking en Vivo</h2>
                        
                        {/* Placeholder para mapa - requiere Google Maps API key */}
                        <Card className="border-slate-800 bg-slate-900">
                            <CardContent className="p-0">
                                <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                        <p className="text-slate-400 font-medium">Mapa de Tracking</p>
                                        <p className="text-slate-500 text-sm mt-1">
                                            Requiere configurar VITE_GOOGLE_MAPS_API_KEY
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Lista de mensajeros activos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {loadingTracking ? (
                                <div className="col-span-full flex justify-center py-8">
                                    <Spinner size="lg" />
                                </div>
                            ) : activeMessengers?.length === 0 ? (
                                <div className="col-span-full text-center py-8 text-slate-500">
                                    No hay mensajeros activos en este momento
                                </div>
                            ) : (
                                activeMessengers?.map((messenger) => (
                                    <Card key={messenger.messengerId} className="border-slate-800 bg-slate-900">
                                        <CardContent className="p-4 flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white font-medium">{messenger.messengerName}</p>
                                                <p className="text-slate-500 text-xs">
                                                    {messenger.speed ? `${messenger.speed.toFixed(0)} km/h` : 'Detenido'}
                                                    {messenger.activeDeliveries ? ` • ${messenger.activeDeliveries} entregas` : ''}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de empleados */}
            <EmployeeModal 
                isOpen={showEmployeeModal}
                onClose={handleCloseModal}
                employee={editingEmployee}
            />
        </AdminLayout>
    )
}
