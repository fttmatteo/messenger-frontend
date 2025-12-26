import { useEffect, useState, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Map as MapComponent } from "@/components/Map"
import { InfoWindow, useGoogleMap } from "@react-google-maps/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { trackingApiService } from "@/services/tracking-api.service"
import { trackingService, type LiveTrackingUpdate } from "@/services/tracking.service"
import { RefreshCw, Users, Wifi, WifiOff, Clock, Navigation } from "lucide-react"
import { useAdminUI } from "@/context/AdminUIContext"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { formatDisplayName } from "@/lib/format-utils"
import { employeeService } from "@/services/employee.service"
import { getErrorMessage, isAxiosError } from "@/lib/error-utils"

// Componente para manejar AdvancedMarkerElement
function AdvancedMarker({ position, onClick, title, color = '#4f46e5' }: { position: google.maps.LatLngLiteral, onClick?: () => void, title?: string, color?: string }) {
    const map = useGoogleMap()
    const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null)

    useEffect(() => {
        if (!map || !window.google?.maps?.marker) return

        const marker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position,
            title,
            content: new google.maps.marker.PinElement({
                background: color,
                borderColor: 'white',
                glyphColor: 'white',
            }).element
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
    }, [map, color, onClick, position, title])

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
    }, [])

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
        // Navigate to messenger details page
        navigate(`/admin/tracking/mensajero/${messenger.messengerId}`)
    }

    return (
        <div className="h-full flex flex-col gap-4 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center flex-wrap gap-2 shrink-0">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight">Monitoreo en vivo</h1>
                    <Badge className={`gap-1 min-w-[110px] h-7 justify-center border-transparent shadow-sm ${connected ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-500 text-white hover:bg-red-600'}`}>
                        {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                        {connected ? "Conectado" : "Desconectado"}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => fetchMessengers(true)} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex gap-4 overflow-hidden">
                {/* Messenger List (Desktop) */}
                <Card className="hidden lg:flex lg:flex-col w-72 shrink-0 overflow-hidden gap-0 py-0">
                    <CardHeader className="py-3 shrink-0">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Mensajeros
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-hidden">
                        <ScrollArea className="h-full">
                            {loading && messengers.length === 0 ? (
                                <div className="space-y-2 p-4">
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
                                                "w-full p-4 text-left hover:bg-muted/50 transition-colors",
                                                selectedMessenger?.messengerId === messenger.messengerId && "bg-muted"
                                            )}
                                            onClick={() => selectMessenger(messenger)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">
                                                    {messenger.messengerName ? formatDisplayName(messenger.messengerName) : `#${messenger.messengerId}`}
                                                </span>
                                                <Badge variant={messenger.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-xs">
                                                    {messenger.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                                                </Badge>
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
                    </CardContent>
                </Card>

                {/* Map Container */}
                <Card className="flex-1 overflow-hidden">
                    <CardContent className="p-0 h-full w-full relative">
                        {loading && messengers.length === 0 ? (
                            <Skeleton className="w-full h-full rounded-md" />
                        ) : (
                            <MapComponent className="w-full h-full rounded-md" center={mapCenter} zoom={13}>
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

                                {selectedMessenger && selectedMessenger.latitude && selectedMessenger.longitude && (
                                    <InfoWindow
                                        position={{ lat: selectedMessenger.latitude, lng: selectedMessenger.longitude }}
                                        onCloseClick={() => setSelectedMessenger(null)}
                                    >
                                        <div className="p-2 min-w-[150px]">
                                            <p className="font-semibold text-sm">
                                                {selectedMessenger.messengerName || `Mensajero #${selectedMessenger.messengerId}`}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                {selectedMessenger.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                                            </p>
                                            {selectedMessenger.speed !== undefined && selectedMessenger.speed > 0 && (
                                                <p className="text-xs text-gray-600">
                                                    Velocidad: {(selectedMessenger.speed * 3.6).toFixed(1)} km/h
                                                </p>
                                            )}
                                            {selectedMessenger.lastUpdate && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Actualizado {formatDistanceToNow(new Date(selectedMessenger.lastUpdate), { addSuffix: true, locale: es })}
                                                </p>
                                            )}
                                        </div>
                                    </InfoWindow>
                                )}
                            </MapComponent>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
