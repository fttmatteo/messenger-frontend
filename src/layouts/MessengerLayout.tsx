import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { LogOut, ChevronLeft, WifiOff, CloudOff, Menu, History, Settings, ClipboardList, HelpCircle, User } from "lucide-react"
import { trackingService } from "@/services/tracking.service"
import { authService } from "@/services/auth.service"
import { showToast } from "@/config/toast-config"
import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import logoHorizontal from "@/assets/logo-horizontal.png"
import { useIsMobile } from "@/hooks/use-mobile"
import { MobileOnlyGuard } from "@/components/guards"
import { useNetwork } from "@/hooks/use-network"
import { useNavigationGuard } from "@/hooks/useNavigationGuard"
import { createLogger } from "@/utils/logger"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { openSupportEmail, APP_CONFIG } from "@/lib/app-config"
import { cn } from "@/lib/utils"
import { isNative } from "@/lib/capacitor"
import { registerPlugin } from "@capacitor/core"

interface LocationServicePlugin {
    startService(options: { messengerId: number; backendUrl: string; authCookie: string }): Promise<{ started: boolean }>;
    stopService(): Promise<{ stopped: boolean }>;
}
const LocationService = registerPlugin<LocationServicePlugin>("LocationService")

const logger = createLogger('MessengerLayout')
/**
 * Layout principal para la aplicación móvil del mensajero.
 * Gestiona el ciclo de vida del rastreo GPS en tiempo real, el estado de conexión (offline)
 * y proporciona la navegación jerárquica optimizada para dispositivos táctiles.
 */
export default function MessengerLayout() {
    const { user, logout, updateUser } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [showLogoutDialog, setShowLogoutDialog] = useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const sidebarBlockedRef = useRef(false)
    const previousPathnameRef = useRef(location.pathname)
    const wasSubPageRef = useRef(false)
    const isOnline = user?.isOnline || false
    const watchIdRef = useRef<number | string | null>(null)
    const { isOnline: isNetworkOnline, pendingActionsCount } = useNetwork()


    const mainRef = useRef<HTMLElement>(null)
    const isMobile = useIsMobile()

    const isSubPage = location.pathname.includes('/servicio/') ||
        location.pathname.includes('/historial') ||
        location.pathname.includes('/actualizar') ||
        location.pathname.includes('/configuracion/')


    useEffect(() => {
        document.documentElement.style.height = '100%'
        document.body.style.height = '100%'
        document.body.style.overflow = 'hidden'

        return () => {
            document.documentElement.style.height = ''
            document.body.style.height = ''
            document.body.style.overflow = ''
        }
    }, [])

    const getPageTitle = () => {
        if (location.pathname.includes('configuracion/apariencia')) return 'Apariencia'
        if (location.pathname.includes('configuracion')) return 'Configuración'
        if (location.pathname.includes('perfil')) return 'Perfil'
        if (location.pathname.includes('actualizar')) return 'Actualizar servicio'
        return null
    }

    const pageTitle = getPageTitle()



    useEffect(() => {
        if (isOnline) {
            const userId = user?.id || user?.document

            if (!userId) {
                logger.error('❌ No se puede iniciar tracking: ni user.id ni user.document están disponibles', user)
                showToast.error('Error: ID de usuario no disponible', { id: 'user-id-missing' })
                return
            }

            if (!user?.id) {
                // Usando document como fallback para messengerId
            }



            const startTracking = async () => {
                if (trackingService.isCurrentlyConnected()) {
                    logger.debug('WebSocket ya conectado, omitiendo reconexión')
                    return
                }

                try {
                    const token = await authService.getWsToken()
                    trackingService.connect(token, () => {
                        trackingService.sendUpdate({
                            messengerId: userId,
                            status: 'ACTIVE'
                        })
                    })
                } catch {
                    logger.debug('Token WS no disponible, usando fallback de cookie (normal en Safari)')
                    trackingService.connect(undefined, () => {
                        trackingService.sendUpdate({
                            messengerId: userId,
                            status: 'ACTIVE'
                        })
                    })
                }
            }

            startTracking()

            if (isNative()) {
                const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
                const authToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken') || '';

                LocationService.startService({
                    messengerId: userId,
                    backendUrl: backendUrl,
                    authCookie: `Bearer ${authToken}`
                }).then(() => {
                    logger.info('Servicio de ubicación nativo iniciado');
                    watchIdRef.current = 'native-service';
                }).catch((error) => {
                    logger.error('Error iniciando servicio de ubicación nativo:', error);
                    showToast.error('Error iniciando rastreo de ubicación');
                });

            } else if ('geolocation' in navigator) {
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
                            showToast.error('GPS devolvió coordenadas inválidas. Esperando señal válida...', { id: 'invalid-coords' })
                        }
                    },
                    () => { /* error al obtener ubicación inicial */ },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                )

                watchIdRef.current = navigator.geolocation.watchPosition(
                    (position) => {
                        const { latitude, longitude, speed, heading, accuracy } = position.coords

                        if (latitude && longitude && latitude !== 0 && longitude !== 0) {
                            if (accuracy && accuracy > 50) return;

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
                        }
                    },
                    (error) => {
                        logger.warn('Error parcial de geolocalización:', error.message)

                        if (error.code === 1) {
                            showToast.error('La ubicación es obligatoria para trabajar. Cerrando sesión...', { id: 'messenger-location-required' })
                            logout()
                            navigate("/login")
                        } else if (error.code === 2) {
                            navigator.geolocation.getCurrentPosition(
                                (fallbackPos) => {
                                    const { latitude, longitude, speed, heading, accuracy } = fallbackPos.coords
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
                                    }
                                },
                                () => {
                                    showToast.warning('Señal GPS débil. Buscando ubicación...', { id: 'messenger-gps-weak' })
                                },
                                { enableHighAccuracy: false, timeout: 10000, maximumAge: 30000 }
                            )
                        } else if (error.code === 3) {
                            showToast.warning('GPS tardando en responder. Reintentando...', { id: 'messenger-gps-timeout' })
                        }
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 15000,
                        maximumAge: 0
                    }
                )
            } else {
                showToast.error('Geolocalización no soportada', { id: 'messenger-geolocation-unsupported' })
                updateUser({ isOnline: false })
            }
        } else {

            if (watchIdRef.current !== null) {
                if (watchIdRef.current === 'native-service') {
                    LocationService.stopService().catch(e => logger.warn('Error deteniendo servicio nativo:', e));
                } else if (typeof watchIdRef.current === 'number') {
                    navigator.geolocation.clearWatch(watchIdRef.current)
                }
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
                if (watchIdRef.current === 'native-service') {
                    // No detener el servicio en cleanup del efecto — solo en logout explícito
                } else if (typeof watchIdRef.current === 'number') {
                    navigator.geolocation.clearWatch(watchIdRef.current)
                }
            }
        }
    }, [isOnline, user, logout, navigate, updateUser])

    useEffect(() => {
        if (!isOnline || !user?.id) return

        const userId = user.id

        const heartbeatInterval = setInterval(() => {
            trackingService.sendHeartbeat(userId)
        }, 30000)

        return () => clearInterval(heartbeatInterval)
    }, [isOnline, user?.id])

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && isOnline) {
                const userId = user?.id || user?.document
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



    useNavigationGuard();

    useEffect(() => {
        const previousPath = previousPathnameRef.current;
        const currentPath = location.pathname;

        queueMicrotask(() => setIsSidebarOpen(false));

        const cameFromSubPage = previousPath.includes('/servicio/') ||
            previousPath.includes('/historial') ||
            previousPath.includes('/actualizar') ||
            previousPath.includes('/configuracion/');

        const isNowMainPage = !currentPath.includes('/servicio/') &&
            !currentPath.includes('/historial') &&
            !currentPath.includes('/actualizar') &&
            !currentPath.includes('/configuracion/');

        wasSubPageRef.current = cameFromSubPage && isNowMainPage;

        sidebarBlockedRef.current = true;

        const blockDuration = wasSubPageRef.current ? 500 : 300;

        const timer = setTimeout(() => {
            sidebarBlockedRef.current = false;
            wasSubPageRef.current = false;
        }, blockDuration);

        previousPathnameRef.current = currentPath;

        return () => clearTimeout(timer);
    }, [location.pathname]);

    const handleSidebarOpenChange = (open: boolean) => {
        if (open && sidebarBlockedRef.current) {
            return;
        }
        setIsSidebarOpen(open);
    };

    const [isSheetBlocked, setIsSheetBlocked] = useState(false);

    useEffect(() => {
        const startTimer = setTimeout(() => {
            setIsSheetBlocked(true);
        }, 0);

        const endTimer = setTimeout(() => {
            setIsSheetBlocked(false);
        }, 400);

        return () => {
            clearTimeout(startTimer);
            clearTimeout(endTimer);
        };
    }, [location.pathname]);

    const confirmLogout = () => {
        if (isOnline && user?.id) {
            trackingService.sendUpdate({
                messengerId: user.id,
                status: 'OFFLINE'
            })
        }
        if (isNative()) {
            LocationService.stopService().catch(e => logger.warn('Error deteniendo servicio al cerrar sesión:', e));
        }
        logout()
        navigate("/login")
    }

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

    if (!isMobile) {
        return <MobileOnlyGuard />
    }

    return (
        <div className="flex flex-col h-[100dvh] w-full bg-background relative overflow-hidden transform-gpu">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:outline-none"
            >
                 Saltar al contenido principal
            </a>
            <header
                className="sticky top-0 left-0 right-0 z-40 flex flex-col border-b bg-background shadow-sm pt-safe"
                role="banner"
            >
                <div className="relative flex h-12 items-center justify-between px-4 w-full">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full pointer-events-none">
                        {pageTitle ? (
                            <div className="flex items-center justify-center gap-2">
                                <span className="font-semibold text-sm">{pageTitle}</span>
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
                                                En línea
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
                                <SheetContent side="left" className={cn("w-[280px] p-0 border-r bg-background flex flex-col pt-safe", isSheetBlocked && "pointer-events-none")}>
                                    <SheetHeader className="p-4 pb-1 text-left">
                                        <div className="flex flex-col items-center gap-1 mb-4">
                                            <img src={logoHorizontal} alt="PLAK" className="h-6 w-auto object-contain" />
                                            <SheetTitle className="sr-only">{APP_CONFIG.name}</SheetTitle>
                                            <SheetDescription className="sr-only">Menú de navegación del transportista</SheetDescription>
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
                                            onClick={() => { navigate('/messenger/perfil'); setIsSidebarOpen(false); }}
                                        >
                                            <User className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                            <span className="font-medium text-sm">Perfil</span>
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



                    <div className="flex-1 flex justify-end items-center gap-1 z-10" />
                </div>
            </header>

            <main
                id="main-content"
                ref={mainRef}
                className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden overscroll-none custom-scrollbar pb-safe"
                style={{ scrollPaddingTop: 'calc(3rem + var(--safe-area-top))' }}
                role="main"
            >
                <Outlet />
            </main>

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

