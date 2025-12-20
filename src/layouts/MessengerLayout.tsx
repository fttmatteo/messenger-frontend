import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import {
    Home,
    Package,
    User,
    LogOut,
    ArrowLeft,
} from "lucide-react"
import { trackingService } from "@/services/tracking.service"
import { toast } from "sonner"
import { useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import logo from "@/assets/logo.png"
import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"

const navItems = [
    { title: "Inicio", icon: Home, url: "/messenger" },
    { title: "Entregas", icon: Package, url: "/messenger/entregas" },
    { title: "Perfil", icon: User, url: "/messenger/perfil" },
]

export default function MessengerLayout() {
    const { user, logout, updateUser } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [showLogoutDialog, setShowLogoutDialog] = useState(false)
    const isOnline = user?.isOnline || false
    const watchIdRef = useRef<number | null>(null)
    const wakeLockRef = useRef<any>(null)
    const isMobile = useIsMobile()

    // Detect if we're on a nested page
    const isNestedPage = location.pathname.includes('/detalles') ||
        location.pathname.includes('/entrega/')

    const handleBack = () => {
        navigate(-1)
    }

    const requestWakeLock = async () => {
        try {
            if ('wakeLock' in navigator) {
                wakeLockRef.current = await (navigator as any).wakeLock.request('screen')
                console.log('Wake Lock activo: la pantalla no se apagará')

                wakeLockRef.current.addEventListener('release', () => {
                    console.log('Wake Lock liberado')
                })
            }
        } catch (err: any) {
            console.warn(`No se pudo activar el Wake Lock: ${err.name}, ${err.message}`)
        }
    }

    const releaseWakeLock = () => {
        if (wakeLockRef.current) {
            wakeLockRef.current.release().then(() => {
                wakeLockRef.current = null
            })
        }
    }

    useEffect(() => {
        if (isOnline) {
            requestWakeLock()

            trackingService.connect(() => {
                toast.success("Conectado al servidor de rastreo")
            })

            if ('geolocation' in navigator) {
                watchIdRef.current = navigator.geolocation.watchPosition(
                    (position) => {
                        const { latitude, longitude, speed, heading } = position.coords
                        trackingService.sendUpdate({
                            messengerId: user?.id, // Send ID!
                            latitude,
                            longitude,
                            speed: speed || 0,
                            heading: heading || 0,
                            status: 'ACTIVE'
                        })
                    },
                    (error) => {
                        console.warn('Geolocation partial error:', error.message)

                        if (error.code === 1) { // PERMISSION_DENIED
                            toast.error('La ubicación es obligatoria para trabajar. Cerrando sesión...')
                            logout()
                            navigate("/login")
                        } else {
                            // Para TIMEOUT o POSITION_UNAVAILABLE, no apagamos el switch.
                            // Solo mostramos un aviso en consola y dejamos que siga intentando.
                            console.log("Señal GPS débil o agotada. Reintentando...")
                        }
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 30000,
                        maximumAge: 0
                    }
                )
            } else {
                toast.error('Geolocalización no soportada')
                updateUser({ isOnline: false })
            }
        } else {
            releaseWakeLock()

            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current)
                watchIdRef.current = null
            }

            // Notify backend before disconnecting
            if (user?.id) {
                trackingService.sendUpdate({
                    messengerId: user.id,
                    status: 'OFFLINE'
                })
            }

            // Allow a small window for the message to be sent before closing the connection
            const timer = setTimeout(() => {
                trackingService.disconnect()
            }, 500)

            return () => clearTimeout(timer)
        }

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current)
            }
        }
    }, [isOnline, user?.id]) // Add user.id dependency

    const handleLogout = () => {
        setShowLogoutDialog(true)
    }

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && isOnline) {
                requestWakeLock()
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            releaseWakeLock()
        }
    }, [isOnline])

    const confirmLogout = () => {
        if (isOnline && user?.id) {
            trackingService.sendUpdate({
                messengerId: user.id,
                status: 'OFFLINE'
            })
        }
        logout()
        navigate("/login")
    }

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader className="border-b border-sidebar-border">
                    <div className="flex items-center justify-between px-2 py-2">
                        <div className="flex items-center gap-2">
                            <img src={logo} alt="PLAK" className="h-8 w-8 object-contain" />
                            <span className="font-semibold">PLAK</span>
                        </div>
                        <ModeToggle />
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {navItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={location.pathname === item.url || (item.url !== "/messenger" && location.pathname.startsWith(item.url))}
                                            tooltip={item.title}
                                        >
                                            <a href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
            <SidebarInset>
                <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-6 shadow-sm">
                    {isMobile && isNestedPage ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleBack}
                            aria-label="Volver"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    ) : (
                        <SidebarTrigger />
                    )}
                    <div className="flex-1" />

                    <div className="flex items-center gap-3 mr-2">
                        <div className="flex items-center gap-2">
                            <Badge variant="default" className={isOnline ? "bg-green-500 hover:bg-green-600" : ""}>
                                {isOnline ? 'RASTREANDO' : 'DESCONECTADO'}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-black dark:text-white">@{user?.username}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <LogOut className="h-4 w-4" />
                    </Button>
                </header>
                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </SidebarInset>

            <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Estás seguro que deseas cerrar sesión?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmLogout} className="bg-red-500 text-white hover:bg-red-600">
                            Salir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </SidebarProvider>
    )
}
