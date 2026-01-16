import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { LogOut, ChevronLeft, WifiOff, CloudOff, Menu, History, Settings, ClipboardList, HelpCircle } from "lucide-react"
import { trackingService } from "@/services/tracking.service"
import { authService } from "@/services/auth.service"
import { toast } from "sonner"
import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import logo from "@/assets/logo.png"
import { useIsMobile } from "@/hooks/use-mobile"
import { MobileOnlyGuard } from "@/components/guards"
import { useNetwork } from "@/hooks/use-network"
import { useNavigationGuard } from "@/hooks/useNavigationGuard"

import { createLogger } from "@/utils/logger"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { openSupportEmail, APP_CONFIG } from "@/lib/app-config"
import { cn } from "@/lib/utils"

const logger = createLogger('MessengerLayout')


export default function MessengerLayout() {
    const { user, logout, updateUser } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [showLogoutDialog, setShowLogoutDialog] = useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const sidebarBlockedRef = useRef(false) // Blocks sidebar opening briefly after navigation
    const previousPathnameRef = useRef(location.pathname) // Track previous route for sidebar closing
    const isOnline = user?.isOnline || false
    const watchIdRef = useRef<number | null>(null)
    const { isOnline: isNetworkOnline, pendingActionsCount } = useNetwork()


    const mainRef = useRef<HTMLElement>(null)
    const isMobile = useIsMobile()

    const isSubPage = location.pathname.includes('/servicio/') ||
        location.pathname.includes('/historial') ||
        location.pathname.includes('/actualizar') ||
        location.pathname.includes('/configuracion/')


    // Lock body scroll to prevent browser chrome resizing (gives native app feel)
    useEffect(() => {
        const originalStyle = {
            position: document.body.style.position,
            width: document.body.style.width,
            height: document.body.style.height,
            overflow: document.body.style.overflow
        }

        document.body.style.position = 'fixed'
        document.body.style.width = '100%'
        document.body.style.height = '100%'
        document.body.style.overflow = 'hidden'

        return () => {
            document.body.style.position = originalStyle.position
            document.body.style.width = originalStyle.width
            document.body.style.height = originalStyle.height
            document.body.style.overflow = originalStyle.overflow
        }
    }, [])

    // Get page title based on path
    const getPageTitle = () => {
        if (location.pathname.includes('historial-estadisticas')) return 'Historial estadísticas'

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
                // Skip if already connected to prevent duplicate connections
                if (trackingService.isCurrentlyConnected()) {
                    logger.debug('WebSocket already connected, skipping reconnection')
                    return
                }

                try {
                    const token = await authService.getWsToken()
                    trackingService.connect(token, () => {
                        // Send immediate status update to appear online instantly
                        trackingService.sendUpdate({
                            messengerId: userId,
                            status: 'ACTIVE'
                        })
                    })
                } catch {
                    // Silent fallback - normal behavior on Safari Mobile
                    logger.debug('WS token unavailable, using cookie fallback (normal on Safari)')
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
                        logger.warn('Geolocation partial error:', error.message)

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

    // Visibility change: send heartbeat when returning to app instead of full reconnect
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && isOnline) {
                const userId = user?.id || user?.document
                // Only send heartbeat if already connected, don't trigger full reconnection
                if (userId && trackingService.isCurrentlyConnected()) {
                    trackingService.sendHeartbeat(userId)
                }
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [isOnline, user])

    const handleLogout = () => {
        setShowLogoutDialog(true)
    }



    // Native Navigation Guard: Handle back gesture with hierarchy
    // This is now handled by the useNavigationGuard hook
    useNavigationGuard();

    // Block sidebar opening temporarily when route changes
    // This prevents the back gesture from accidentally triggering the menu button
    // when transitioning from a subpage (ChevronLeft) to the main page (Menu button)
    useEffect(() => {
        sidebarBlockedRef.current = true;

        // Unblock after a short delay to allow touch events to complete
        const timer = setTimeout(() => {
            sidebarBlockedRef.current = false;
        }, 300); // 300ms is enough to clear any residual touch events

        return () => clearTimeout(timer);
    }, [location.pathname]);

    // Safe sidebar opener that respects the block and closes on route change
    const handleSidebarOpenChange = (open: boolean) => {
        // Detect route change and force close
        if (previousPathnameRef.current !== location.pathname) {
            previousPathnameRef.current = location.pathname;
            // Force sidebar closed on route change
            if (isSidebarOpen) {
                setIsSidebarOpen(false);
            }
            return;
        }

        // Only allow opening if not blocked
        if (open && sidebarBlockedRef.current) {
            return; // Block opening during navigation transition
        }
        setIsSidebarOpen(open);
    };

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
        <div className="flex flex-col h-full w-full bg-background overflow-hidden relative">
            {/* Skip link for keyboard navigation */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:outline-none"
            >
                Saltar al contenido principal
            </a>
            {/* Simplified Header */}
            <header className="fixed top-0 left-0 right-0 z-40 flex flex-col border-b bg-background shadow-sm" role="banner">
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
                                <div
                                    className={`inline-flex items-center gap-2.5 px-3 py-1 rounded-full border shadow-sm transition-all duration-300 ${!isNetworkOnline ? "bg-amber-50 dark:bg-amber-950/20 border-amber-500/20" :
                                        isOnline ? "bg-green-50 dark:bg-green-950/20 border-green-500/20" :
                                            "bg-muted border-border/20"
                                        }`}
                                >
                                    {!isNetworkOnline ? (
                                        <>
                                            <div className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                            </div>
                                            <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.18em]">
                                                Sin conexión
                                            </span>
                                        </>
                                    ) : isOnline ? (
                                        <>
                                            <div className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                            </div>
                                            <span className="text-[11px] font-black text-green-600 dark:text-green-400 uppercase tracking-[0.18em]">
                                                En Línea
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                                            <span className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.18em]">
                                                Offline
                                            </span>
                                        </>
                                    )}
                                </div>
                                {/* Pending sync actions indicator */}
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
                            <Sheet open={isSidebarOpen} onOpenChange={handleSidebarOpenChange}>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 -ml-2 rounded-full hover:bg-muted transition-all active:scale-95"
                                        aria-label="Abrir menú"
                                    >
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-[280px] p-0 border-r bg-background flex flex-col">
                                    <SheetHeader className="p-4 pb-1 text-left">
                                        <div className="flex items-center gap-3 mb-4">
                                            <img src={logo} alt="PLAK" className="h-9 w-auto object-contain" />
                                            <div>
                                                <SheetTitle className="text-lg font-bold tracking-tight">{APP_CONFIG.name}</SheetTitle>
                                                <SheetDescription className="text-[10px] font-medium text-muted-foreground">v{APP_CONFIG.version}</SheetDescription>
                                            </div>
                                        </div>

                                        <div className={cn(
                                            "flex flex-col p-4 rounded-2xl border shadow-sm transition-all duration-300",
                                            !isNetworkOnline ? "bg-amber-50 dark:bg-amber-950/20 border-amber-500/20" :
                                                isOnline ? "bg-green-50 dark:bg-green-950/20 border-green-500/20" :
                                                    "bg-muted border-border/20"
                                        )}>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-base font-bold truncate tracking-tight mb-2.5">{user?.name || 'Mensajero'}</span>
                                                <div className="flex items-center gap-2.5">
                                                    {!isNetworkOnline ? (
                                                        <>
                                                            <div className="relative flex h-2 w-2">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                                            </div>
                                                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-[0.15em]">
                                                                Sin conexión
                                                            </span>
                                                        </>
                                                    ) : isOnline ? (
                                                        <>
                                                            <div className="relative flex h-2 w-2">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                            </div>
                                                            <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-[0.15em]">
                                                                En línea
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                                                            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.15em]">
                                                                Desconectado
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </SheetHeader>

                                    <div className="flex-1 px-2 py-2 space-y-0.5">
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-4 h-12 px-4 rounded-xl hover:bg-primary/5 hover:text-primary transition-all group"
                                            onClick={() => { navigate('/messenger'); setIsSidebarOpen(false); }}
                                        >
                                            <ClipboardList className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                            <span className="font-medium text-sm">Asignados</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-4 h-12 px-4 rounded-xl hover:bg-primary/5 hover:text-primary transition-all group"
                                            onClick={() => { navigate('/messenger/servicios'); setIsSidebarOpen(false); }}
                                        >
                                            <History className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                            <span className="font-medium text-sm">Historial</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-4 h-12 px-4 rounded-xl hover:bg-primary/5 hover:text-primary transition-all group"
                                            onClick={() => { navigate('/messenger/configuracion'); setIsSidebarOpen(false); }}
                                        >
                                            <Settings className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                            <span className="font-medium text-sm">Configuración</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-4 h-12 px-4 rounded-xl hover:bg-primary/5 hover:text-primary transition-all group"
                                            onClick={() => { openSupportEmail(); setIsSidebarOpen(false); }}
                                        >
                                            <HelpCircle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                            <span className="font-medium text-sm">Soporte</span>
                                        </Button>
                                    </div>

                                    <div className="p-4 mt-auto">
                                        <Separator className="mb-4 opacity-50" />
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-4 h-12 px-4 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all font-medium"
                                            onClick={() => { handleLogout(); setIsSidebarOpen(false); }}
                                        >
                                            <LogOut className="h-5 w-5" />
                                            <span className="text-sm">Cerrar sesión</span>
                                        </Button>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        )}
                    </div>



                    {/* Right: Spacer to maintain layout balance */}
                    <div className="flex-1 flex justify-end items-center gap-1 z-10" />
                </div>
            </header>

            {/* Main Content Area - with bottom padding for nav */}
            <main
                id="main-content"
                ref={mainRef}
                className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden"
                style={{
                    paddingTop: `calc(48px + env(safe-area-inset-top))`,
                    paddingBottom: `env(safe-area-inset-bottom)`
                }}
                role="main"
            >
                <Outlet />
            </main>

            {/* Logout Confirmation Dialog */}
            <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <AlertDialogContent className="max-w-[90vw] rounded-xl bg-background">
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

