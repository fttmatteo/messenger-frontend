/**
 * MessengerDashboard - Página Principal del Mensajero
 * 
 * Dashboard móvil con entregas del día y estado de tracking.
 */

import { MessengerLayout } from '@/components/layout/MessengerLayout'
import { DeliveryCard } from '@/features/service-delivery/components/DeliveryCard'
import { MapPin } from 'lucide-react'

/**
 * Entregas de ejemplo
 */
const mockDeliveries = [
    {
        id: 1,
        plateNumber: 'ABC-123',
        dealershipName: 'Toyota Centro',
        address: 'Av. Principal 123, Col. Centro',
        status: 'ASSIGNED' as const,
        createdAt: 'Hoy 09:30',
        phone: '555-0001'
    },
    {
        id: 2,
        plateNumber: 'XYZ-789',
        dealershipName: 'Honda Norte',
        address: 'Calle Norte 456, Col. Industrial',
        status: 'PENDING' as const,
        createdAt: 'Hoy 10:15',
        phone: '555-0002'
    },
    {
        id: 3,
        plateNumber: 'DEF-456',
        dealershipName: 'Nissan Sur',
        address: 'Av. Sur 789, Col. Residencial',
        status: 'ASSIGNED' as const,
        createdAt: 'Hoy 11:00'
    },
]

/**
 * MessengerDashboard Component
 */
export function MessengerDashboard() {
    return (
        <MessengerLayout>
            <div className="p-4 space-y-4">
                {/* Header de entregas */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">Mis Entregas</h2>
                        <p className="text-slate-400 text-sm">{mockDeliveries.length} pendientes hoy</p>
                    </div>
                    <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-green-400 text-xs font-medium">GPS activo</span>
                    </div>
                </div>

                {/* Botón de ver mapa */}
                <button className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium transition-colors">
                    <MapPin className="w-5 h-5" />
                    Ver Ruta en Mapa
                </button>

                {/* Lista de entregas */}
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
        </MessengerLayout>
    )
}
