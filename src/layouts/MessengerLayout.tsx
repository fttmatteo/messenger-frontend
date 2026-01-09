import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { LogOut, ChevronLeft, WifiOff, CloudOff } from "lucide-react"
import { trackingService } from "@/services/tracking.service"
import { authService } from "@/services/auth.service"
import { toast } from "sonner"
import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import logo from "@/assets/logo.png"
import { useIsMobile } from "@/hooks/use-mobile"
import { MobileOnlyGuard } from "@/components/MobileOnlyGuard"
import { BottomNavigation } from "@/components/messenger/BottomNavigation"
import { useNetwork } from "@/hooks/use-network"
import { createLogger } from "@/utils/logger"

const logger = createLogger('MessengerLayout')


export default function MessengerLayout() {
    const { user, logout, updateUser } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [showLogoutDialog, setShowLogoutDialog] = useState(false)
    const isOnline = user?.isOnline || false
    const watchIdRef = useRef<number | null>(null)
    const { isOnline: isNetworkOnline, pendingActionsCount } = useNetwork()

    const mainRef = useRef<HTMLElement>(null)
    const isMobile = useIsMobile()

    const isSubPage = location.pathname.includes('/servicio/') ||
        location.pathname.includes('/historial') ||
        location.pathname.includes('/actualizar') ||
        location.pathname.includes('/configuracion/')

    // Hide bottom nav on create and update pages for cleaner UX
    const hideBottomNav = location.pathname.includes('/crear') || location.pathname.includes('/actualizar')

    // Get page title based on path
    const getPageTitle = () => {
        if (location.pathname.includes('historial-estadisticas')) return 'Historial estadísticas'
        if (location.pathname.includes('historial-recorrido')) return 'Historial ruta'
        if (location.pathname.includes('estadisticas')) return 'Estadísticas'
        if (location.pathname.includes('configuracion/apariencia')) return 'Apariencia'
        if (location.pathname.includes('configuracion')) return 'Configuración'
        if (location.pathname.includes('actualizar')) return 'Actualizar estado'
        if (location.pathname.includes('servicio/')) return 'Detalle servicio'
        if (location.pathname.includes('crear')) return 'Nuevo servicio'
        return null // Will show logo instead
    }

    const pageTitle = getPageTitle()



    useEffect(() => {
        if (isOnline) {
            // Usar user.id si existe, sino usar document como fallback
            const userId = user?.id || user?.document

            if (!userId) {
                logger.error('❌ No se puede iniciar tracking: ni user.id ni user.document están disponibles', user)
                toast.error('Error: ID de usuario no disponible', { id: 'user-id-missing' })
                return
            }

            if (!user?.id) {
                // Using document as fallback for messengerId
            }



            const startTracking = async () => {
                try {
                    const token = await authService.getWsToken()
                    trackingService.connect(token, () => {
                        // Send immediate status update to appear online instantly
                        trackingService.sendUpdate({
                            messengerId: userId,
                            status: 'ACTIVE'
                        })
                    })
                } catch (err) {
                    logger.error('Failed to get WS token, falling back to cookie-only', err)
                    trackingService.connect(undefined, () => {
                        trackingService.sendUpdate({
                            messengerId: userId,
                            status: 'ACTIVE'
                        })
                    })
                }
            }

            startTracking()

            if ('geolocation' in navigator) {
                // Initial fast fix to populate map and status immediately
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude, speed, heading, accuracy } = position.coords

                        if (latitude && longitude && latitude !== 0 && longitude !== 0) {
                            trackingService.sendUpdate({
                                messengerId: userId,
                                latitude,
                                longitude,
                                speed: speed || 0,
                                heading: heading || 0,
                                accuracy,
                                status: 'ACTIVE'
                            })
                            trackingService.setLastLocation(latitude, longitude)
                        } else {
                            toast.error('GPS devolvió coordenadas inválidas. Esperando señal válida...', { id: 'invalid-coords' })
                        }
                    },
                    () => { /* error getting initial location */ },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                )

                watchIdRef.current = navigator.geolocation.watchPosition(
                    (position) => {
                        const { latitude, longitude, speed, heading, accuracy } = position.coords

                        if (latitude && longitude && latitude !== 0 && longitude !== 0) {
                            trackingService.sendUpdate({
                                messengerId: userId,
                                latitude,
                                longitude,
                                speed: speed || 0,
                                heading: heading || 0,
                                accuracy,
                                status: 'ACTIVE'
                            })
                            // Cache locally for instant navigation
                            trackingService.setLastLocation(latitude, longitude)
                        }
                    },
                    (error) => {
                        console.warn('Geolocation partial error:', error.message)

                        if (error.code === 1) {
                            toast.error('La ubicación es obligatoria para trabajar. Cerrando sesión...', { id: 'messenger-location-required' })
                            logout()
                            navigate("/login")
                        } else if (error.code === 2) {
                            // Position unavailable - show warning but don't logout
                            toast.warning('Señal GPS débil. Buscando ubicación...', { duration: 3000, id: 'messenger-gps-weak' })
                        } else if (error.code === 3) {
                            // Timeout - GPS taking too long
                            toast.warning('GPS tardando en responder. Reintentando...', { duration: 3000, id: 'messenger-gps-timeout' })
                        }
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 15000, // Reducido de 30s a 15s para feedback más rápido
                        maximumAge: 5000 // Permitir cache de 5s para mejor rendimiento
                    }
                )
            } else {
                toast.error('Geolocalización no soportada', { id: 'messenger-geolocation-unsupported' })
                updateUser({ isOnline: false })
            }
        } else {

            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current)
                watchIdRef.current = null
            }

            const userId = user?.id || user?.document
            if (userId) {
                trackingService.sendUpdate({
                    messengerId: userId,
                    status: 'OFFLINE'
                })
            }

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
    }, [isOnline, user, logout, navigate, updateUser])

    // Heartbeat timer: envía señal de vida cada 30 segundos independiente del GPS
    useEffect(() => {
        if (!isOnline || !user?.id) return

        const userId = user.id // TypeScript sabe que no es undefined aquí

        // Enviar heartbeat cada 30 segundos
        const heartbeatInterval = setInterval(() => {
            trackingService.sendHeartbeat(userId)
        }, 30000) // 30 segundos

        return () => clearInterval(heartbeatInterval)
    }, [isOnline, user?.id])

    const handleLogout = () => {
        setShowLogoutDialog(true)
    }



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

    // Show loading while detecting device type
    if (isMobile === undefined) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando...</p>
                </div>
            </div>
        );
    }

    // Block desktop users from accessing the messenger
    if (!isMobile) {
        return <MobileOnlyGuard />
    }

    return (
        <div className="relative min-h-[100dvh] bg-background">
            {/* Skip link for keyboard navigation */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:outline-none"
            >
                Saltar al contenido principal
            </a>
            {/* Simplified Header */}
            <header className="fixed top-0 left-0 right-0 z-40 flex flex-col border-b bg-background/80 backdrop-blur-md" role="banner">
                {/* Safe Area Spacer for PWA/Notch */}
                <div className="h-[env(safe-area-inset-top,0px)] w-full" />

                <div className="relative flex h-12 items-center justify-between px-4 w-full">
                    {/* Center: Page title or Status - Absolutely Centered within the h-12 area */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full pointer-events-none">
                        {pageTitle ? (
                            <div className="flex items-center justify-center gap-2">
                                <span className="font-semibold text-sm">{pageTitle}</span>
                                {/* Subtle network offline indicator */}
                                {!isNetworkOnline && (
                                    <Badge
                                        variant="outline"
                                        className="text-[10px] px-1.5 py-0 border-amber-400 text-amber-600 dark:text-amber-400 animate-pulse pointer-events-auto"
                                    >
                                        <WifiOff className="h-2.5 w-2.5 mr-0.5" />
                                        Sin red
                                    </Badge>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2 pointer-events-auto">
                                <Badge
                                    variant="secondary"
                                    className={`text-xs px-3 py-0.5 font-medium border-0 ${isOnline
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-muted text-muted-foreground"
                                        }`}
                                >
                                    {isOnline ? 'ACTIVO' : 'OFFLINE'}
                                </Badge>
                                {/* Subtle network offline indicator */}
                                {!isNetworkOnline && (
                                    <Badge
                                        variant="outline"
                                        className="text-[10px] px-1.5 py-0 border-amber-400 text-amber-600 dark:text-amber-400 animate-pulse"
                                    >
                                        <WifiOff className="h-2.5 w-2.5" />
                                    </Badge>
                                )}
                                {/* Pending sync actions indicator */}
                                {pendingActionsCount > 0 && isNetworkOnline && (
                                    <Badge
                                        variant="outline"
                                        className="text-[10px] px-1.5 py-0 border-blue-400 text-blue-600 dark:text-blue-400"
                                    >
                                        <CloudOff className="h-2.5 w-2.5 mr-0.5" />
                                        {pendingActionsCount}
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Left: Back button or Logo */}
                    <div className="flex-1 flex justify-start z-10">
                        {isSubPage ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(-1)}
                                className="h-9 w-9 -ml-2 rounded-full hover:bg-muted"
                                aria-label="Volver"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                        ) : (
                            <img src={logo} alt="PLAK" className="h-8 w-auto object-contain" />
                        )}
                    </div>



                    {/* Right: Logout */}
                    <div className="flex-1 flex justify-end items-center gap-1 z-10">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleLogout}
                            className="h-9 w-9 -mr-2 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                            aria-label="Cerrar sesión"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content Area - with bottom padding for nav */}
            <main
                id="main-content"
                ref={mainRef}
                className={cn(
                    "pt-[calc(48px+env(safe-area-inset-top,0px))] relative",
                    !hideBottomNav
                        ? "pb-[calc(68px+env(safe-area-inset-bottom,0px))]"
                        : "pb-[env(safe-area-inset-bottom,0px)]"
                )}
                role="main"
            >
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            {!hideBottomNav && <BottomNavigation />}

            {/* Logout Confirmation Dialog */}
            <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <AlertDialogContent className="max-w-[90vw] rounded-xl bg-background/80 backdrop-blur-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Se detendrá el rastreo GPS y cerrarás tu sesión.
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
        </div>
    )
}

