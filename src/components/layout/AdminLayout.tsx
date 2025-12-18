/**
 * AdminLayout - Layout para Administradores (Web)
 * 
 * Diseño con sidebar fijo para navegación y área principal de contenido.
 * Optimizado para pantallas grandes (desktop/tablet).
 * 
 * Características:
 * - Sidebar fijo a la izquierda con navegación
 * - Header con información del usuario
 * - Área de contenido principal con scroll
 * - Responsive: sidebar colapsable en tablet
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { useAuth } from '@/context/AuthContext'
import {
    LayoutDashboard,
    Building2,
    Users,
    Truck,
    MapPin,
    Settings,
    LogOut,
    Menu,
    X,
    Bell
} from 'lucide-react'

/**
 * Props del AdminLayout
 */
interface AdminLayoutProps {
    children: React.ReactNode
}

/**
 * Items de navegación del sidebar
 */
const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Truck, label: 'Entregas', href: '/admin/services' },
    { icon: MapPin, label: 'Tracking', href: '/admin/tracking' },
    { icon: Building2, label: 'Concesionarios', href: '/admin/dealerships' },
    { icon: Users, label: 'Empleados', href: '/admin/employees' },
    { icon: Settings, label: 'Configuración', href: '/admin/settings' },
]

/**
 * AdminLayout Component
 */
export function AdminLayout({ children }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [activeItem, setActiveItem] = useState('/admin')
    const { logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Overlay para móvil cuando sidebar está abierto */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 border-r border-slate-800",
                "transform transition-transform duration-300 ease-in-out",
                "lg:translate-x-0",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Truck className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-white text-lg">E-PLACA</span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-slate-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navegación */}
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.href}
                            onClick={() => {
                                setActiveItem(item.href)
                                navigate(item.href)
                            }}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                activeItem === item.href
                                    ? "bg-blue-600 text-white"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Botón de cerrar sesión */}
                <div className="absolute bottom-4 left-4 right-4">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Contenido Principal */}
            <div className="lg:pl-64">
                {/* Header */}
                <header className="h-16 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-30">
                    <div className="h-full px-4 flex items-center justify-between">
                        {/* Botón de menú móvil */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-slate-400 hover:text-white"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        {/* Título de la página */}
                        <h1 className="text-lg font-semibold text-white lg:block hidden">
                            Panel de Administración
                        </h1>

                        {/* Acciones del header */}
                        <div className="flex items-center gap-4">
                            {/* Notificaciones */}
                            <button className="relative text-slate-400 hover:text-white">
                                <Bell className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                                    3
                                </span>
                            </button>

                            {/* Avatar del usuario */}
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">A</span>
                                </div>
                                <div className="hidden md:block">
                                    <p className="text-sm font-medium text-white">Admin</p>
                                    <p className="text-xs text-slate-400">Administrador</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Área de contenido */}
                <main className="p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
