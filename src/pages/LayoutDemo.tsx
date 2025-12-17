/**
 * Página de Demo de Layouts
 * 
 * Página para demostrar ambos layouts:
 * - AdminLayout para administradores (desktop)
 * - MessengerLayout para mensajeros (mobile)
 * 
 * Usar con ?role=admin o ?role=messenger en la URL
 */

import { AdminLayout } from '@/components/layout/AdminLayout'
import { MessengerLayout } from '@/components/layout/MessengerLayout'
import { DeliveryCard } from '@/features/service-delivery/components/DeliveryCard'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'

/**
 * Datos de ejemplo para la tabla de concesionarios
 */
const mockDealerships = [
    { id: 1, name: 'Toyota Centro', address: 'Av. Principal 123', phone: '555-0001', services: 45 },
    { id: 2, name: 'Honda Norte', address: 'Calle Norte 456', phone: '555-0002', services: 32 },
    { id: 3, name: 'Nissan Sur', address: 'Av. Sur 789', phone: '555-0003', services: 28 },
    { id: 4, name: 'Mazda Este', address: 'Calle Este 321', phone: '555-0004', services: 51 },
    { id: 5, name: 'Ford Oeste', address: 'Av. Oeste 654', phone: '555-0005', services: 19 },
]

/**
 * Datos de ejemplo para las tarjetas de entregas
 */
const mockDeliveries = [
    { id: 1, plateNumber: 'ABC-123', dealershipName: 'Toyota Centro', address: 'Av. Principal 123, Col. Centro', status: 'ASSIGNED' as const, createdAt: 'Hoy 09:30', phone: '555-0001' },
    { id: 2, plateNumber: 'XYZ-789', dealershipName: 'Honda Norte', address: 'Calle Norte 456, Col. Industrial', status: 'PENDING' as const, createdAt: 'Hoy 10:15', phone: '555-0002' },
    { id: 3, plateNumber: 'DEF-456', dealershipName: 'Nissan Sur', address: 'Av. Sur 789, Col. Residencial', status: 'DELIVERED' as const, createdAt: 'Ayer 14:45' },
]

/**
 * DemoAdminContent - Contenido para el layout de Admin
 */
function DemoAdminContent() {
    return (
        <div className="space-y-6">
            {/* Header de la sección */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Concesionarios</h2>
                    <p className="text-slate-400 text-sm">Gestiona los concesionarios del sistema</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Concesionario
                </Button>
            </div>

            {/* Barra de búsqueda y filtros */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Buscar concesionarios..."
                        className="pl-10 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
                    />
                </div>
                <Button variant="outline" className="border-slate-700 text-slate-300">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                </Button>
            </div>

            {/* Tabla de datos */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-800 hover:bg-slate-800/50">
                            <TableHead className="text-slate-400">ID</TableHead>
                            <TableHead className="text-slate-400">Nombre</TableHead>
                            <TableHead className="text-slate-400">Dirección</TableHead>
                            <TableHead className="text-slate-400">Teléfono</TableHead>
                            <TableHead className="text-slate-400 text-right">Servicios</TableHead>
                            <TableHead className="text-slate-400 text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockDealerships.map((dealership) => (
                            <TableRow key={dealership.id} className="border-slate-800">
                                <TableCell className="font-mono text-slate-500">#{dealership.id}</TableCell>
                                <TableCell className="font-medium text-white">{dealership.name}</TableCell>
                                <TableCell className="text-slate-300">{dealership.address}</TableCell>
                                <TableCell className="text-slate-300">{dealership.phone}</TableCell>
                                <TableCell className="text-right">
                                    <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full text-xs font-medium">
                                        {dealership.services}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                                        Editar
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Mostrando 1-5 de 24 resultados</span>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-slate-700" disabled>
                        Anterior
                    </Button>
                    <Button size="sm" variant="outline" className="border-slate-700">
                        Siguiente
                    </Button>
                </div>
            </div>
        </div>
    )
}

/**
 * DemoMessengerContent - Contenido para el layout de Mensajero
 */
function DemoMessengerContent() {
    return (
        <div className="p-4 space-y-4">
            {/* Header de entregas */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white">Mis Entregas</h2>
                    <p className="text-slate-400 text-sm">3 pendientes hoy</p>
                </div>
                <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400 text-xs font-medium">Tracking activo</span>
                </div>
            </div>

            {/* Lista de tarjetas de entrega */}
            <div className="space-y-4">
                {mockDeliveries.map((delivery) => (
                    <DeliveryCard
                        key={delivery.id}
                        {...delivery}
                        onViewDetails={() => console.log('Ver detalles', delivery.id)}
                        onNavigate={() => console.log('Navegar a', delivery.address)}
                        onCall={() => delivery.phone && console.log('Llamar a', delivery.phone)}
                    />
                ))}
            </div>
        </div>
    )
}

/**
 * LayoutDemo - Página principal de demo
 */
export function LayoutDemo() {
    const [role, setRole] = useState<'admin' | 'messenger'>('admin')

    // Detectar rol desde URL
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        const urlRole = params.get('role')
        if (urlRole === 'messenger' && role !== 'messenger') {
            setRole('messenger')
        } else if (urlRole === 'admin' && role !== 'admin') {
            setRole('admin')
        }
    }

    if (role === 'messenger') {
        return (
            <MessengerLayout>
                <DemoMessengerContent />
            </MessengerLayout>
        )
    }

    return (
        <AdminLayout>
            <DemoAdminContent />
        </AdminLayout>
    )
}
