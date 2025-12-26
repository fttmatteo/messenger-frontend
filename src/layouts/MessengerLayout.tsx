import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { LogOut, ChevronLeft } from "lucide-react"
import { trackingService } from "@/services/tracking.service"
import { toast } from "sonner"
import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import logo from "@/assets/logo.png"
import { useIsMobile } from "@/hooks/use-mobile"
import { MobileOnlyGuard } from "@/components/MobileOnlyGuard"
import { BottomNavigation } from "@/components/messenger/BottomNavigation"

// Type definitions for Wake Lock API
// These provide type safety for the WakeLockSentinel returned by navigator.wakeLock.request()
interface WakeLockSentinel extends EventTarget {
    readonly released: boolean;
    readonly type: 'screen';
    release(): Promise<void>;
}

// Type-safe navigator check for Wake Lock support
const getWakeLock = (): { request: (type: 'screen') => Promise<WakeLockSentinel> } | undefined => {
    if ('wakeLock' in navigator) {
        return navigator.wakeLock as { request: (type: 'screen') => Promise<WakeLockSentinel> };
    }
    return undefined;
}

export default function MessengerLayout() {
    const { user, logout, updateUser } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [showLogoutDialog, setShowLogoutDialog] = useState(false)
    const isOnline = user?.isOnline || false
    const watchIdRef = useRef<number | null>(null)
    const wakeLockRef = useRef<WakeLockSentinel | null>(null)
    const mainRef = useRef<HTMLElement>(null)
    const isMobile = useIsMobile()

    // Determine if we are in a sub-page (detail pages that need back button)
    const isSubPage = location.pathname.includes('/servicio/') ||
        location.pathname.includes('/historial') ||
        location.pathname.includes('/actualizar')

    // Hide bottom nav on create and update pages for cleaner UX
    const hideBottomNav = location.pathname.includes('/crear') || location.pathname.includes('/actualizar')

    // Get page title based on path
    const getPageTitle = () => {
        if (location.pathname.includes('historial-estadisticas')) return 'Historial Stats'
        if (location.pathname.includes('historial-recorrido')) return 'Historial Ruta'
        if (location.pathname.includes('estadisticas')) return 'Estadísticas'
        if (location.pathname.includes('configuracion')) return 'Configuración'
        if (location.pathname.includes('servicio/')) return 'Detalle Servicio'
        if (location.pathname.includes('crear')) return 'Nuevo Servicio'
        if (location.pathname.includes('actualizar')) return 'Actualizar Estado'
        return null // Will show logo instead
    }

    const pageTitle = getPageTitle()

    const requestWakeLock = async () => {
        try {
            const wakeLock = getWakeLock()
            if (wakeLock) {
                wakeLockRef.current = await wakeLock.request('screen')
                console.log('Wake Lock activo: la pantalla no se apagará')

                wakeLockRef.current.addEventListener('release', () => {
                    console.log('Wake Lock liberado')
                })
            }
        } catch (err) {
            // Wake Lock can fail for various reasons (e.g., low battery)
            console.warn('No se pudo activar el Wake Lock:', err)
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
                // Connected silently
            })

            if ('geolocation' in navigator) {
                watchIdRef.current = navigator.geolocation.watchPosition(
                    (position) => {
                        const { latitude, longitude, speed, heading } = position.coords
                        trackingService.sendUpdate({
                            messengerId: user?.id,
                            latitude,
                            longitude,
                            speed: speed || 0,
                            heading: heading || 0,
                            status: 'ACTIVE'
                        })
                        // Cache locally for instant navigation
                        trackingService.setLastLocation(latitude, longitude)
                    },
                    (error) => {
                        console.warn('Geolocation partial error:', error.message)

                        if (error.code === 1) {
                            toast.error('La ubicación es obligatoria para trabajar. Cerrando sesión...')
                            logout()
                            navigate("/login")
                        } else {
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

            if (user?.id) {
                trackingService.sendUpdate({
                    messengerId: user.id,
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
    }, [isOnline, user?.id])

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
        <div className="flex flex-col h-screen bg-background">
            {/* Simplified Header */}
            {/* Simplified Header */}
            <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 backdrop-blur-sm px-4 relative">
                {/* Left: Back button or Logo */}
                <div className="flex-1 flex justify-start z-10">
                    {isSubPage ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="h-9 w-9 -ml-2 rounded-full hover:bg-muted"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    ) : (
                        <img src={logo} alt="PLAK" className="h-8 w-auto object-contain" />
                    )}
                </div>

                {/* Center: Page title or Status - Absolutely Centered */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full pointer-events-none">
                    {pageTitle ? (
                        <span className="font-semibold text-sm block">{pageTitle}</span>
                    ) : (
                        <Badge
                            variant="secondary"
                            className={`text-xs px-3 py-0.5 pointer-events-auto font-medium border-0 ${isOnline
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-muted text-muted-foreground"
                                }`}
                        >
                            {isOnline ? 'ACTIVO' : 'OFFLINE'}
                        </Badge>
                    )}
                </div>

                {/* Right: Logout */}
                <div className="flex-1 flex justify-end items-center gap-1 z-10">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLogout}
                        className="h-9 w-9 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </header>

            {/* Main Content Area - with bottom padding for nav */}
            <main
                ref={mainRef}
                className={`flex-1 overflow-auto ${hideBottomNav ? '' : 'pb-20'}`}
            >
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            {!hideBottomNav && <BottomNavigation />}

            {/* Logout Confirmation Dialog */}
            <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <AlertDialogContent className="max-w-[90vw] rounded-xl">
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

