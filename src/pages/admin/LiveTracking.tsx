import { useEffect, useState, useCallback, useMemo } from "react"
import { Map as MapComponent } from "@/components/Map"
import { OverlayView } from "@react-google-maps/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PulsingMarker, MessengerListPanel } from "@/components/tracking"
import { trackingApiService } from "@/services/tracking-api.service"
import { trackingService, type LiveTrackingUpdate } from "@/services/tracking.service"
import { RefreshCw, Wifi, WifiOff } from "lucide-react"
import { useAdminUI } from "@/context/AdminUIContext"
import { authService } from "@/services/auth.service"
import { cn } from "@/lib/utils"
import { formatDisplayName } from "@/lib/format-utils"
import { isMessengerOnline } from "@/lib/messenger-utils"
import { employeeService } from "@/services/employee.service"
import { getErrorMessage, isAxiosError } from "@/lib/error-utils"
import { MessengerSidePanel } from "./MessengerSidePanel"
import { logger } from "@/utils/logger"

/** Helper para validar coordenadas finitas antes de usar en el mapa */
const isValidCoords = (lat?: number, lng?: number): boolean => {
    return typeof lat === 'number' && typeof lng === 'number' &&
        isFinite(lat) && isFinite(lng) && lat !== 0 && lng !== 0
}

export default function LiveTracking() {
    const [messengers, setMessengers] = useState<LiveTrackingUpdate[]>([])
    const [selectedMessenger, setSelectedMessenger] = useState<LiveTrackingUpdate | null>(null)
    const [loading, setLoading] = useState(true)
    const [connected, setConnected] = useState(false)
    const [mapCenter, setMapCenter] = useState({ lat: 6.2442, lng: -75.5812 }) // Medellín
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)
    const [showMessengerDetails, setShowMessengerDetails] = useState(false)
    const [followingMessengerId, setFollowingMessengerId] = useState<number | null>(null)
    const { setSuccess, setError } = useAdminUI()

    // Unified timestamp to synchronize status across all UI components (Map, List, SidePanel)
    // 10s interval ensures quick feedback for disconnections
    const [now, setNow] = useState(() => Date.now())
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 10000)
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
                    if (isAxiosError(e) && e.response?.status !== 404) {
                        logger.apiError(`Error fetching last location for messenger ${emp.idEmployee}`, e)
                    }
                }

                // Default offline structure without location
                return {
                    messengerId: emp.idEmployee,
                    messengerName: formattedName,
                    latitude: 0,
                    longitude: 0,
                    lastUpdate: "",
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

            // Center map on first active messenger if available
            const firstActive = updatedMessengers.find(m => m.status === 'ACTIVE' && isValidCoords(m.latitude, m.longitude))
            if (!manual && firstActive && isValidCoords(firstActive.latitude, firstActive.longitude)) {
                setMapCenter({ lat: firstActive.latitude, lng: firstActive.longitude })
            }
        } catch (error) {
            logger.error("Error fetching messengers in LiveTracking:", error)
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
        if (followingMessengerId === update.messengerId && isValidCoords(update.latitude, update.longitude)) {
            setMapCenter({ lat: update.latitude, lng: update.longitude })
        }
    }, [followingMessengerId])

    // Connect to WebSocket on mount
    useEffect(() => {
        fetchMessengers()

        const startTracking = async () => {
            // Skip if already connected
            if (trackingService.isCurrentlyConnected()) {
                setConnected(true)
                return
            }

            try {
                const token = await authService.getWsToken()
                trackingService.connect(token, () => {
                    setConnected(true)
                    trackingService.subscribeToAll(handleTrackingUpdate)
                })
            } catch (err) {
                // Silent fallback - normal on Safari Mobile
                logger.debug('WS token unavailable for Admin, using cookie fallback', err)
                trackingService.connect(undefined, () => {
                    setConnected(true)
                    trackingService.subscribeToAll(handleTrackingUpdate)
                })
            }
        }

        startTracking()

        return () => {
            trackingService.disconnect()
            setConnected(false)
        }
    }, [fetchMessengers, handleTrackingUpdate, setError])

    const selectMessenger = useCallback((messenger: LiveTrackingUpdate) => {
        setSelectedMessenger(messenger)
        setShowMessengerDetails(true)
        if (isValidCoords(messenger.latitude, messenger.longitude)) {
            setMapCenter({ lat: messenger.latitude, lng: messenger.longitude })
        }
    }, [])

    const deselectMessenger = useCallback(() => {
        setSelectedMessenger(null)
        setShowMessengerDetails(false)
        setFollowingMessengerId(null)
    }, [])

    const toggleFollow = useCallback((messengerId: number) => {
        if (followingMessengerId === messengerId) {
            setFollowingMessengerId(null)
        } else {
            setFollowingMessengerId(messengerId)
            const messenger = messengers.find(m => m.messengerId === messengerId)
            if (messenger && isValidCoords(messenger.latitude, messenger.longitude)) {
                setMapCenter({ lat: messenger.latitude, lng: messenger.longitude })
            }
        }
    }, [followingMessengerId, messengers])

    // Memoize visible markers with computed online status
    // 'now' dependency ensures re-calculation for offline detection
    const visibleMarkers = useMemo(() => {
        return messengers
            .filter(m => isValidCoords(m.latitude, m.longitude))
            .map(m => ({
                ...m,
                isOnline: isMessengerOnline(m.status, m.lastHeartbeat || m.lastUpdate, 2, now)
            }))
    }, [messengers, now])

    return (
        <div className="h-full w-full relative overflow-hidden">
            {/* Fullscreen Map */}
            <div className="absolute inset-0">
                {loading && messengers.length === 0 ? (
                    <div className="w-full h-full bg-muted/10 animate-pulse flex items-center justify-center">
                        <p className="text-muted-foreground text-sm">Cargando mapa...</p>
                    </div>
                ) : (
                    <MapComponent className="w-full h-full" center={mapCenter} zoom={13}>
                        {visibleMarkers.map((marker) => (
                            <PulsingMarker
                                key={marker.messengerId}
                                messenger={marker}
                                onClick={selectMessenger}
                                isOnline={marker.isOnline}
                            />
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
                                    <div className="bg-background/60 backdrop-blur-xl rounded-md shadow-md border px-2 py-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-xs whitespace-nowrap">
                                                {selectedMessenger.messengerName || `#${selectedMessenger.messengerId}`}
                                            </p>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={deselectMessenger}
                                                className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground shrink-0"
                                            >
                                                ✕
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </OverlayView>
                        )}
                    </MapComponent>
                )}
            </div>

            {/* Floating Header */}
            <div className="absolute top-4 left-4 z-10 pointer-events-auto">
                <div className="flex items-center gap-3 bg-background/60 backdrop-blur-xl rounded-lg px-3 shadow-lg border h-10">
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
                isPanelCollapsed ? "w-9" : "w-72",
                showMessengerDetails && "opacity-0 pointer-events-none translate-x-full"
            )}>
                <MessengerListPanel
                    messengers={messengers}
                    selectedMessengerId={selectedMessenger?.messengerId || null}
                    followingMessengerId={followingMessengerId}
                    loading={loading}
                    isCollapsed={isPanelCollapsed}
                    onToggleCollapse={() => setIsPanelCollapsed(!isPanelCollapsed)}
                    onSelect={selectMessenger}
                    now={now}
                />
            </div>

            {/* Messenger Detail Panel */}
            <MessengerSidePanel
                messenger={selectedMessenger}
                messengerId={selectedMessenger?.messengerId || null}
                isOpen={showMessengerDetails}
                onClose={deselectMessenger}
                onFollow={toggleFollow}
                isFollowing={followingMessengerId === selectedMessenger?.messengerId}
                now={now}
            />
        </div>
    )
}
