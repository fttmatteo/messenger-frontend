import { useEffect, useState, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Map as MapComponent } from "@/components/Map"
import { useGoogleMap, OverlayView, Polyline } from "@react-google-maps/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { trackingApiService } from "@/services/tracking-api.service"
import { trackingService, type LiveTrackingUpdate } from "@/services/tracking.service"
import { RefreshCw, Users, Wifi, WifiOff, Clock, Navigation, ChevronRight, ChevronLeft, ExternalLink, Locate } from "lucide-react"
import { useAdminUI } from "@/context/AdminUIContext"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { formatDisplayName } from "@/lib/format-utils"
import { employeeService } from "@/services/employee.service"
import { getErrorMessage, isAxiosError } from "@/lib/error-utils"
import { MessengerSidePanel } from "./MessengerSidePanel"

// Componente para manejar AdvancedMarkerElement con efecto de pulso
function AdvancedMarker({ position, onClick, title, color = '#4f46e5', isActive = false }: {
    position: google.maps.LatLngLiteral,
    onClick?: () => void,
    title?: string,
    color?: string,
    isActive?: boolean
}) {
    const map = useGoogleMap()
    const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null)

    useEffect(() => {
        if (!map || !window.google?.maps?.marker) return

        // Crear contenedor con efecto de pulso para marcadores activos
        const container = document.createElement('div')
        container.style.position = 'relative'

        if (isActive) {
            // Efecto de pulso
            const pulse = document.createElement('div')
            pulse.style.cssText = `
                position: absolute;
                width: 40px;
                height: 40px;
                background: ${color}40;
                border-radius: 50%;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                animation: pulse 2s infinite;
            `
            container.appendChild(pulse)

            // Añadir keyframes si no existen
            if (!document.getElementById('pulse-keyframes')) {
                const style = document.createElement('style')
                style.id = 'pulse-keyframes'
                style.textContent = `
                    @keyframes pulse {
                        0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                        100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
                    }
                `
                document.head.appendChild(style)
            }
        }

        const pinElement = new google.maps.marker.PinElement({
            background: color,
            borderColor: 'white',
            glyphColor: 'white',
            scale: isActive ? 1.2 : 1,
        })
        container.appendChild(pinElement.element)

        const marker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position,
            title,
            content: container
        })

        marker.addListener('click', () => {
            if (onClick) onClick()
        })

        markerRef.current = marker

        return () => {
            if (markerRef.current) {
                markerRef.current.map = null
            }
        }
    }, [map, color, onClick, position, title, isActive])

    useEffect(() => {
        if (markerRef.current) {
            markerRef.current.position = position
        }
    }, [position])

    return null
}

export default function LiveTracking() {
    const navigate = useNavigate()
    const [messengers, setMessengers] = useState<LiveTrackingUpdate[]>([])
    const [selectedMessenger, setSelectedMessenger] = useState<LiveTrackingUpdate | null>(null)
    const [loading, setLoading] = useState(true)
    const [connected, setConnected] = useState(false)
    const [mapCenter, setMapCenter] = useState({ lat: 6.2442, lng: -75.5812 }) // Medellín
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)
    const [showMessengerDetails, setShowMessengerDetails] = useState(false)
    const [followingMessengerId, setFollowingMessengerId] = useState<number | null>(null)
    const [historyPath, setHistoryPath] = useState<google.maps.LatLngLiteral[]>([])
    const { setSuccess, setError } = useAdminUI()

    // Force re-render periodically to update relative times
    const [, setTick] = useState(0)
    useEffect(() => {
        const timer = setInterval(() => setTick(t => t + 1), 60000)
        return () => clearInterval(timer)
    }, [])

    // Fetch initial data via REST (All messengers + status)
    const fetchMessengers = useCallback(async (manual = false) => {
        try {
            setLoading(true)

            // 1. Get all messengers
            const allEmployees = await employeeService.getAll()
            const messengerEmployees = allEmployees.filter(e => e.role === 'MESSENGER')

            // 2. Get active sessions
            const activeMessengers = await trackingApiService.getActiveMessengers()
            const activeMap = new Map(activeMessengers.map(m => [m.messengerId, m]))

            // 3. Merge data
            const combinedRequests = messengerEmployees.map(async (emp) => {
                const formattedName = formatDisplayName(emp.fullName)

                // If active, use active data
                if (activeMap.has(emp.idEmployee)) {
                    return { ...activeMap.get(emp.idEmployee)!, messengerName: formattedName }
                }

                // If offline, try to get last location
                try {
                    const lastLoc = await trackingApiService.getLastLocation(emp.idEmployee)
                    if (lastLoc) {
                        return { ...lastLoc, status: 'OFFLINE' as const, messengerName: formattedName }
                    }
                } catch (e) {
                    // Ignore 404 errors (mensajero sin ubicación previa), but log other errors
                    if (isAxiosError(e) && e.response?.status !== 404) {
                        console.error(`Error fetching last location for messenger ${emp.idEmployee}:`, e)
                    }
                }

                // Default offline structure without location
                return {
                    messengerId: emp.idEmployee,
                    messengerName: formattedName,
                    latitude: 0,
                    longitude: 0,
                    lastUpdate: new Date().toISOString(),
                    status: 'OFFLINE' as const,
                    speed: 0,
                    heading: 0
                }
            })

            const updatedMessengers = await Promise.all(combinedRequests)
            setMessengers(updatedMessengers)

            // Update selected messenger if exists in new data
            setSelectedMessenger(current => {
                if (!current) return null
                const refreshed = updatedMessengers.find(m => m.messengerId === current.messengerId)
                return refreshed || current
            })

            if (manual) {
                setSuccess(`Monitoreo actualizado`)
            }

            // Center map on first active messenger if available and no manual update
            const firstActive = updatedMessengers.find(m => m.status === 'ACTIVE' && m.latitude !== 0)
            if (!manual && firstActive) {
                setMapCenter({ lat: firstActive.latitude, lng: firstActive.longitude })
            }
        } catch (error) {
            console.error("Error fetching messengers:", error)
            if (isAxiosError(error) && error.response?.status !== 404) {
                setError(getErrorMessage(error))
            }
        } finally {
            setLoading(false)
        }
    }, [setSuccess, setError])

    // Handle history updates from side panel
    const handleHistoryChange = useCallback((id: number, history: any[]) => {
        // Solo actualizar si el ID coincide con el mensajero seleccionado actualmente
        if (selectedMessenger?.messengerId === id) {
            const path = history
                .filter(item => item.latitude && item.longitude)
                .map(item => ({
                    lat: item.latitude,
                    lng: item.longitude
                }))
            setHistoryPath(path)
        }
    }, [selectedMessenger?.messengerId])

    // Clear history when closing or switching messenger
    useEffect(() => {
        if (!showMessengerDetails || !selectedMessenger) {
            setHistoryPath([])
        }
    }, [showMessengerDetails, selectedMessenger])



    // Handle real-time updates
    const handleTrackingUpdate = useCallback((update: LiveTrackingUpdate) => {
        setMessengers(prev => {
            const existingIndex = prev.findIndex(m => m.messengerId === update.messengerId)

            if (existingIndex >= 0) {
                const updatedList = [...prev]
                // Preserve name if update doesn't have it (though update usually has it)
                const existing = prev[existingIndex]
                updatedList[existingIndex] = { ...existing, ...update, messengerName: existing.messengerName || update.messengerName }
                return updatedList
            }

            return [...prev, update]
        })

        setSelectedMessenger(prev => {
            if (prev?.messengerId === update.messengerId) {
                return { ...prev, ...update, messengerName: prev.messengerName || update.messengerName }
            }
            return prev
        })

        // Follow mode: update map center when following a messenger
        if (followingMessengerId === update.messengerId && update.latitude && update.longitude) {
            setMapCenter({ lat: update.latitude, lng: update.longitude })
        }
    }, [followingMessengerId])

    // Connect to WebSocket on mount
    useEffect(() => {
        fetchMessengers()

        trackingService.connect(() => {
            setConnected(true)
            trackingService.subscribeToAll(handleTrackingUpdate)
        })

        return () => {
            trackingService.disconnect()
            setConnected(false)
        }
    }, [fetchMessengers, handleTrackingUpdate])



    const selectMessenger = (messenger: LiveTrackingUpdate) => {
        setHistoryPath([]) // Limpiar ruta anterior inmediatamente
        setSelectedMessenger(messenger)
        setShowMessengerDetails(true)
        if (messenger.latitude && messenger.longitude) {
            setMapCenter({ lat: messenger.latitude, lng: messenger.longitude })
        }
    }

    const deselectMessenger = useCallback(() => {
        setSelectedMessenger(null)
        setShowMessengerDetails(false)
        setFollowingMessengerId(null)
        setHistoryPath([])
    }, [])

    const goToMessengerDetails = (messengerId: number) => {
        navigate(`/admin/tracking/mensajero/${messengerId}`)
    }

    const toggleFollow = (messengerId: number) => {
        if (followingMessengerId === messengerId) {
            setFollowingMessengerId(null)
        } else {
            setFollowingMessengerId(messengerId)
            const messenger = messengers.find(m => m.messengerId === messengerId)
            if (messenger?.latitude && messenger?.longitude) {
                setMapCenter({ lat: messenger.latitude, lng: messenger.longitude })
            }
        }
    }

    return (
        <div className="h-full w-full relative overflow-hidden">
            {/* Fullscreen Map */}
            <div className="absolute inset-0">
                {loading && messengers.length === 0 ? (
                    <Skeleton className="w-full h-full" />
                ) : (
                    <MapComponent className="w-full h-full" center={mapCenter} zoom={13}>
                        {messengers.map((messenger) => (
                            messenger.latitude && messenger.longitude && messenger.latitude !== 0 && (
                                <AdvancedMarker
                                    key={messenger.messengerId}
                                    position={{ lat: messenger.latitude, lng: messenger.longitude }}
                                    onClick={() => selectMessenger(messenger)}
                                    title={messenger.messengerName || `Mensajero #${messenger.messengerId}`}
                                    color={messenger.status === 'ACTIVE' ? '#10b981' : '#6b7280'}
                                />
                            )
                        ))}

                        {/* Custom popup overlay at marker position */}
                        {selectedMessenger && selectedMessenger.latitude !== 0 && selectedMessenger.longitude !== 0 && (
                            <OverlayView
                                position={{ lat: selectedMessenger.latitude, lng: selectedMessenger.longitude }}
                                mapPaneName={OverlayView.FLOAT_PANE}
                            >
                                <div
                                    style={{
                                        position: 'absolute',
                                        transform: 'translate(-50%, -100%)',
                                        marginTop: '-50px'
                                    }}
                                >
                                    <div className="bg-background/80 backdrop-blur-md rounded-lg shadow-lg border px-4 py-2 space-y-2" style={{ minWidth: '180px' }}>
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="font-semibold text-sm whitespace-nowrap">
                                                {selectedMessenger.messengerName || `#${selectedMessenger.messengerId}`}
                                            </p>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={deselectMessenger}
                                                className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground shrink-0"
                                            >
                                                ✕
                                            </Button>
                                        </div>

                                        {selectedMessenger.speed !== undefined && selectedMessenger.speed > 0 && (
                                            <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Navigation className="h-3 w-3" />
                                                {(selectedMessenger.speed * 3.6).toFixed(1)} km/h
                                            </p>
                                        )}

                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => goToMessengerDetails(selectedMessenger.messengerId)}
                                                className="flex-1 h-7 text-xs bg-secondary/50 hover:bg-secondary"
                                            >
                                                Ver detalles
                                                <ExternalLink className="h-3 w-3 ml-1" />
                                            </Button>
                                            <Button
                                                variant={followingMessengerId === selectedMessenger.messengerId ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => toggleFollow(selectedMessenger.messengerId)}
                                                className={cn(
                                                    "h-7 w-7 p-0",
                                                    followingMessengerId === selectedMessenger.messengerId && "bg-green-500 hover:bg-green-600"
                                                )}
                                            >
                                                <Locate className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </OverlayView>
                        )}
                        {/* SIEMPRE renderizar Polyline (si google está listo) para asegurar limpieza vía React */}
                        {window.google?.maps && (
                            <Polyline
                                key="route-current"
                                path={(showMessengerDetails && selectedMessenger && historyPath.length > 1) ? historyPath : []}
                                options={{
                                    strokeColor: '#6366f1',
                                    strokeOpacity: 0.8,
                                    strokeWeight: 4,
                                    icons: [{
                                        icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW },
                                        offset: '100%',
                                        repeat: '100px'
                                    }]
                                }}
                            />
                        )}
                    </MapComponent>
                )}
            </div>

            {/* Floating Header */}
            <div className="absolute top-4 left-4 z-10 pointer-events-auto">
                <div className="flex items-center gap-3 bg-background/90 backdrop-blur-md rounded-lg px-3 shadow-lg border h-10">
                    <h1 className="text-sm font-medium">Monitoreo</h1>
                    <div className="h-4 w-px bg-border" />
                    <Badge
                        variant="outline"
                        className={cn(
                            "gap-1 h-6 justify-center text-xs font-normal",
                            connected
                                ? "bg-green-500/10 text-green-600 border-green-500/30"
                                : "bg-red-500/10 text-red-600 border-red-500/30"
                        )}
                    >
                        {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                        {connected ? "Conectado" : "Desconectado"}
                    </Badge>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchMessengers(true)}
                        disabled={loading}
                        className="h-6 w-6 p-0 hover:bg-muted"
                        title="Actualizar datos"
                    >
                        <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Collapsible Side Panel - Right Side */}
            <div className={cn(
                "absolute right-4 top-4 bottom-4 transition-all duration-300 z-10",
                isPanelCollapsed ? "w-9" : "w-72"
            )}>
                <div className="h-full bg-background/90 backdrop-blur-md rounded-lg shadow-lg border flex flex-col overflow-hidden">
                    {/* ... header ... */}
                    <div className={cn(
                        "flex items-center border-b shrink-0 h-10",
                        isPanelCollapsed ? "justify-center p-0" : "justify-between px-3"
                    )}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
                            className="h-6 w-6 p-0"
                            title={isPanelCollapsed ? "Expandir" : "Colapsar"}
                        >
                            {isPanelCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                        {!isPanelCollapsed && (
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Mensajeros</span>
                            </div>
                        )}
                    </div>

                    {/* Panel Content */}
                    {!isPanelCollapsed && (
                        <ScrollArea className="flex-1">
                            {loading && messengers.length === 0 ? (
                                <div className="space-y-2 p-3">
                                    {[1, 2, 3].map(i => (
                                        <Skeleton key={i} className="h-16 w-full" />
                                    ))}
                                </div>
                            ) : messengers.length === 0 ? (
                                <div className="p-4 text-center text-muted-foreground text-sm">
                                    No hay mensajeros disponibles
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {messengers.map((messenger) => {
                                        const lastUpdateDate = messenger.lastUpdate ? new Date(messenger.lastUpdate) : null
                                        const isRecent = lastUpdateDate && (Date.now() - lastUpdateDate.getTime() < 60000)

                                        return (
                                            <button
                                                key={messenger.messengerId}
                                                className={cn(
                                                    "w-full p-3 text-left hover:bg-muted/50 transition-colors",
                                                    selectedMessenger?.messengerId === messenger.messengerId && "bg-muted",
                                                    followingMessengerId === messenger.messengerId && "ring-2 ring-inset ring-green-500"
                                                )}
                                                onClick={() => selectMessenger(messenger)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-sm truncate">
                                                        {messenger.messengerName ? formatDisplayName(messenger.messengerName) : `#${messenger.messengerId}`}
                                                    </span>
                                                    <div className={cn(
                                                        "w-2 h-2 rounded-full shrink-0",
                                                        messenger.status === 'ACTIVE' ? "bg-green-500" : "bg-gray-400"
                                                    )} />
                                                </div>
                                                {messenger.speed !== undefined && messenger.speed > 0 && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        <Navigation className="h-3 w-3 inline mr-1" />
                                                        {(messenger.speed * 3.6).toFixed(1)} km/h
                                                    </p>
                                                )}
                                                {lastUpdateDate && (
                                                    <p className="text-xs text-muted-foreground">
                                                        <Clock className="h-3 w-3 inline mr-1" />
                                                        {isRecent
                                                            ? "Actualizado ahora"
                                                            : formatDistanceToNow(lastUpdateDate, { addSuffix: true, locale: es })}
                                                    </p>
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </ScrollArea>
                    )}
                </div>
            </div>

            {/* Messenger Detail Panel (Proposal 1) */}
            <MessengerSidePanel
                messenger={selectedMessenger}
                messengerId={selectedMessenger?.messengerId || null}
                isOpen={showMessengerDetails}
                onClose={deselectMessenger}
                onFollow={toggleFollow}
                isFollowing={followingMessengerId === selectedMessenger?.messengerId}
                onHistoryChange={handleHistoryChange}
            />

            {/* Following indicator */}
            {followingMessengerId && (
                <div className="absolute bottom-4 left-4 z-10">
                    <div className="bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm">
                        <Locate className="h-4 w-4 animate-pulse" />
                        <span>Siguiendo mensajero</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFollowingMessengerId(null)}
                            className="h-6 px-2 text-white hover:bg-green-600"
                        >
                            ✕
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
