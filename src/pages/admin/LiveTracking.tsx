import { useEffect, useState, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Map as MapComponent } from "@/components/Map"
import { useGoogleMap } from "@react-google-maps/api"
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
    const [followingMessengerId, setFollowingMessengerId] = useState<number | null>(null)
    const { setSuccess, setError } = useAdminUI()

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
                // If active, use active data
                if (activeMap.has(emp.idEmployee)) {
                    return activeMap.get(emp.idEmployee)!
                }

                // If offline, try to get last location
                try {
                    const lastLoc = await trackingApiService.getLastLocation(emp.idEmployee)
                    if (lastLoc) {
                        return { ...lastLoc, status: 'OFFLINE' as const, messengerName: emp.fullName }
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
                    messengerName: emp.fullName,
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



    // Handle real-time updates
    const handleTrackingUpdate = useCallback((update: LiveTrackingUpdate) => {
        setMessengers(prev => {
            const existingIndex = prev.findIndex(m => m.messengerId === update.messengerId)

            if (existingIndex >= 0) {
                const updatedList = [...prev]
                // Preserve name if update doesn't have it (though update usually has it)
                const existing = prev[existingIndex]
                updatedList[existingIndex] = { ...existing, ...update, messengerName: update.messengerName || existing.messengerName }
                return updatedList
            }

            return [...prev, update]
        })

        setSelectedMessenger(prev => {
            if (prev?.messengerId === update.messengerId) {
                return { ...prev, ...update }
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
        setSelectedMessenger(messenger)
        if (messenger.latitude && messenger.longitude) {
            setMapCenter({ lat: messenger.latitude, lng: messenger.longitude })
        }
    }

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

    const activeCount = messengers.filter(m => m.status === 'ACTIVE').length
    const inactiveCount = messengers.filter(m => m.status !== 'ACTIVE').length

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
                    </MapComponent>
                )}
            </div>

            {/* Custom Floating Info Card (replaces InfoWindow) */}
            {selectedMessenger && selectedMessenger.latitude && selectedMessenger.longitude && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-72">
                    <div className="bg-background/90 backdrop-blur-md rounded-lg shadow-lg border p-4 space-y-3">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="font-semibold text-sm">
                                    {selectedMessenger.messengerName || `Mensajero #${selectedMessenger.messengerId}`}
                                </p>
                                <Badge
                                    variant={selectedMessenger.status === 'ACTIVE' ? 'default' : 'secondary'}
                                    className={cn(
                                        "mt-1 text-xs",
                                        selectedMessenger.status === 'ACTIVE' && "bg-green-500 hover:bg-green-600"
                                    )}
                                >
                                    {selectedMessenger.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                                </Badge>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedMessenger(null)}
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                            >
                                ✕
                            </Button>
                        </div>

                        <div className="space-y-1 text-xs text-muted-foreground">
                            {selectedMessenger.speed !== undefined && selectedMessenger.speed > 0 && (
                                <p className="flex items-center gap-1">
                                    <Navigation className="h-3 w-3" />
                                    {(selectedMessenger.speed * 3.6).toFixed(1)} km/h
                                </p>
                            )}
                            {selectedMessenger.lastUpdate && (
                                <p className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDistanceToNow(new Date(selectedMessenger.lastUpdate), { addSuffix: true, locale: es })}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-2 pt-1">
                            <Button
                                size="sm"
                                onClick={() => goToMessengerDetails(selectedMessenger.messengerId)}
                                className="flex-1 h-8 text-xs"
                            >
                                Ver detalles
                                <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                            <Button
                                variant={followingMessengerId === selectedMessenger.messengerId ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleFollow(selectedMessenger.messengerId)}
                                className={cn(
                                    "h-8 w-8 p-0",
                                    followingMessengerId === selectedMessenger.messengerId && "bg-green-500 hover:bg-green-600"
                                )}
                            >
                                <Locate className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Header */}
            <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-3 bg-background/80 backdrop-blur-md rounded-lg px-4 py-2 shadow-lg border">
                    <h1 className="text-lg font-bold tracking-tight">Monitoreo en vivo</h1>
                    <Badge
                        variant="outline"
                        className={cn(
                            "gap-1 h-6 justify-center",
                            connected
                                ? "bg-green-500/10 text-green-600 border-green-500/30"
                                : "bg-red-500/10 text-red-600 border-red-500/30"
                        )}
                    >
                        {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                        {connected ? "Conectado" : "Desconectado"}
                    </Badge>
                </div>

                <div className="pointer-events-auto flex items-center gap-2">
                    {/* Stats badges */}
                    <div className="hidden sm:flex items-center gap-2 bg-background/80 backdrop-blur-md rounded-lg px-3 py-2 shadow-lg border">
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                            {activeCount} activos
                        </Badge>
                        <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-500/30">
                            {inactiveCount} inactivos
                        </Badge>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchMessengers(true)}
                        disabled={loading}
                        className="bg-background/80 backdrop-blur-md shadow-lg"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Collapsible Side Panel */}
            <div className={cn(
                "absolute top-20 bottom-4 right-4 z-10 transition-all duration-300 ease-in-out",
                isPanelCollapsed ? "w-12" : "w-72"
            )}>
                <div className="h-full bg-background/90 backdrop-blur-md rounded-lg shadow-lg border flex flex-col overflow-hidden">
                    {/* Panel Header */}
                    <div className="flex items-center justify-between p-3 border-b shrink-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
                            className="p-1 h-8 w-8"
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
                                    {messengers.map((messenger) => (
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
                                            {messenger.lastUpdate && (
                                                <p className="text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3 inline mr-1" />
                                                    {formatDistanceToNow(new Date(messenger.lastUpdate), { addSuffix: true, locale: es })}
                                                </p>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    )}
                </div>
            </div>

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
