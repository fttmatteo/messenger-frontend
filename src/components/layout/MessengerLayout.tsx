/**
 * MessengerLayout - Layout para Mensajeros (Mobile PWA)
 * 
 * Diseño optimizado para uso móvil con navegación inferior.
 * Los botones son grandes para facilitar el uso con el pulgar.
 * 
 * Características:
 * - Header compacto con estado y notificaciones
 * - Bottom Navigation Bar con botones grandes
 * - Área de contenido scrollable
 * - Diseño touch-friendly para una mano
 */

import { useState } from 'react'
import { cn } from '@/utils/cn'
import {
    Home,
    Truck,
    MapPin,
    User,
    Bell,
    Wifi,
    WifiOff
} from 'lucide-react'

/**
 * Props del MessengerLayout
 */
interface MessengerLayoutProps {
    children: React.ReactNode
}

/**
 * Items de navegación inferior
 */
const navItems = [
    { icon: Home, label: 'Inicio', href: '/messenger' },
    { icon: Truck, label: 'Entregas', href: '/messenger/deliveries' },
    { icon: MapPin, label: 'Ruta', href: '/messenger/route' },
    { icon: User, label: 'Perfil', href: '/messenger/profile' },
]

/**
 * MessengerLayout Component
 */
export function MessengerLayout({ children }: MessengerLayoutProps) {
    const [activeItem, setActiveItem] = useState('/messenger/deliveries')
    const [isOnline] = useState(navigator.onLine)

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            {/* Header móvil */}
            <header className="bg-slate-900 border-b border-slate-800 safe-area-top">
                <div className="h-14 px-4 flex items-center justify-between">
                    {/* Logo y estado */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Truck className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <span className="font-bold text-white text-sm">E-PLACA</span>
                            <div className="flex items-center gap-1">
                                {isOnline ? (
                                    <>
                                        <Wifi className="w-3 h-3 text-green-400" />
                                        <span className="text-[10px] text-green-400">En línea</span>
                                    </>
                                ) : (
                                    <>
                                        <WifiOff className="w-3 h-3 text-amber-400" />
                                        <span className="text-[10px] text-amber-400">Sin conexión</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-3">
                        {/* Notificaciones */}
                        <button className="relative p-2 text-slate-400 hover:text-white">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        </button>

                        {/* Avatar */}
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">M</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Área de contenido con scroll */}
            <main className="flex-1 overflow-y-auto pb-20">
                {children}
            </main>

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 safe-area-bottom z-50">
                <div className="h-16 flex items-center justify-around px-2">
                    {navItems.map((item) => (
                        <button
                            key={item.href}
                            onClick={() => setActiveItem(item.href)}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-xl transition-all",
                                "min-w-[72px] active:scale-95",
                                activeItem === item.href
                                    ? "bg-blue-600 text-white"
                                    : "text-slate-400"
                            )}
                        >
                            <item.icon className={cn(
                                "w-6 h-6",
                                activeItem === item.href && "animate-bounce-subtle"
                            )} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    )
}
