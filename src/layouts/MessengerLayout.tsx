import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { LogOut, MapPin, MapPinOff, Plus, ArrowUp, ChevronLeft } from "lucide-react"
import { trackingService } from "@/services/tracking.service"
import { toast } from "sonner"
import { useEffect, useRef, useState, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import logo from "@/assets/logo.png"
import { useIsMobile } from "@/hooks/use-mobile"
import { MobileOnlyGuard } from "@/components/MobileOnlyGuard"

export default function MessengerLayout() {
    const { user, logout, updateUser } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [showLogoutDialog, setShowLogoutDialog] = useState(false)
    const [showScrollTop, setShowScrollTop] = useState(false)
    const [keyboardVisible, setKeyboardVisible] = useState(false)
    const isOnline = user?.isOnline || false
    const watchIdRef = useRef<number | null>(null)
    const wakeLockRef = useRef<any>(null)
    const mainRef = useRef<HTMLElement>(null)
    const isMobile = useIsMobile()

    // Determine if we are in a sub-page
    const isSubPage = location.pathname.includes('/historial') || location.pathname.includes('/estadisticas')

    // Get page title based on path
    const getPageTitle = () => {
        if (location.pathname.includes('historial-estadisticas')) return 'Historial Stats'
        if (location.pathname.includes('historial-recorrido')) return 'Historial Ruta'
        if (location.pathname.includes('estadisticas')) return 'Estadísticas'
        return 'PLAK'
    }

    // Hide FAB on create page, update page, AND sub-pages
    const showFab = !location.pathname.includes('/crear') && !location.pathname.includes('/actualizar') && !isSubPage

    // Detect keyboard visibility (via visual viewport API)
    useEffect(() => {
        const handleResize = () => {
            if (window.visualViewport) {
                const isKeyboard = window.visualViewport.height < window.innerHeight * 0.75
                setKeyboardVisible(isKeyboard)
            }
        }

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleResize)
            return () => window.visualViewport?.removeEventListener('resize', handleResize)
        }
    }, [])

    // Track scroll position for "scroll to top" button
    const handleScroll = useCallback(() => {
        if (mainRef.current) {
            setShowScrollTop(mainRef.current.scrollTop > 300)
        }
    }, [])

    useEffect(() => {
        const main = mainRef.current
        if (main) {
            main.addEventListener('scroll', handleScroll)
            return () => main.removeEventListener('scroll', handleScroll)
        }
    }, [handleScroll])

    const scrollToTop = () => {
        mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
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
                            messengerId: user?.id,
                            latitude,
                            longitude,
                            speed: speed || 0,
                            heading: heading || 0,
                            status: 'ACTIVE'
                        })
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

    // Block desktop users from accessing the messenger
    if (!isMobile) {
        return <MobileOnlyGuard />
    }

    // Calculate FAB bottom position based on keyboard
    const fabBottomClass = keyboardVisible ? 'bottom-2' : 'bottom-6'

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Dynamic Header */}
            <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background px-4 shadow-sm">

                {isSubPage ? (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="h-9 w-9 -ml-2"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <span className="font-semibold text-lg">{getPageTitle()}</span>
                    </div>
                ) : (
                    // Default Header with Logo
                    <div className="flex items-center gap-2">
                        <img src={logo} alt="PLAK" className="h-8 w-8 object-contain" />
                        <span className="font-semibold text-lg">PLAK</span>
                    </div>
                )}

                {/* Right side: Status + Actions */}
                <div className="flex items-center gap-2">
                    {/* Dev-only tracking toggle button */}
                    {import.meta.env.DEV && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateUser({ isOnline: !isOnline })}
                            className={`h-8 px-2 text-xs ${isOnline
                                ? "border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                : "border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
                                }`}
                        >
                            {isOnline ? (
                                <><MapPinOff className="h-3.5 w-3.5 mr-1" /> Stop</>
                            ) : (
                                <><MapPin className="h-3.5 w-3.5 mr-1" /> GPS</>
                            )}
                        </Button>
                    )}

                    <Badge
                        variant="default"
                        className={`text-xs px-2 py-0.5 ${isOnline ? "bg-green-500 hover:bg-green-600" : "bg-muted text-muted-foreground"}`}
                    >
                        {isOnline ? '🟢 ACTIVO' : '⚫ OFFLINE'}
                    </Badge>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLogout}
                        className="h-9 w-9 text-muted-foreground hover:text-red-500"
                    >
                        <LogOut className="h-5 w-5" />
                    </Button>
                </div>
            </header>

            {/* Main Content Area */}
            <main ref={mainRef} className="flex-1 overflow-auto">
                <Outlet />
            </main>

            {/* Floating Action Buttons Container */}
            <div className={`fixed ${fabBottomClass} left-0 right-0 flex justify-center items-center gap-3 z-50 pointer-events-none transition-all duration-200`}>
                {/* Scroll to Top Button - Left position, shows when scrolled */}
                {showScrollTop && showFab && (
                    <Button
                        onClick={scrollToTop}
                        variant="secondary"
                        size="icon"
                        className="h-12 w-12 rounded-full shadow-lg pointer-events-auto bg-muted/90 backdrop-blur-sm hover:bg-muted"
                    >
                        <ArrowUp className="h-5 w-5" />
                    </Button>
                )}

                {/* Create Service FAB - Center, primary action */}
                {showFab && (
                    <Button
                        onClick={() => navigate('/messenger/crear')}
                        className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all pointer-events-auto bg-primary hover:bg-primary/90"
                        size="icon"
                    >
                        <Plus className="h-6 w-6" />
                    </Button>
                )}
            </div>

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
