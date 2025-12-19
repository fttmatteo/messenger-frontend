import { useEffect, useState, useCallback, useRef } from "react"
import { Map } from "@/components/Map"
import { InfoWindow, useGoogleMap } from "@react-google-maps/api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { trackingApiService } from "@/services/tracking-api.service"
import { trackingService, type LiveTrackingUpdate } from "@/services/tracking.service"
import { RefreshCw, Users, Wifi, WifiOff } from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

// Componente para manejar AdvancedMarkerElement (API nueva de Google Maps)
function AdvancedMarker({ position, onClick, title }: { position: google.maps.LatLngLiteral, onClick?: () => void, title?: string }) {
    const map = useGoogleMap()
    const markerRef = useRef<any>(null)

    useEffect(() => {
        if (!map || !window.google?.maps?.marker) return

        const marker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position,
            title,
            content: new google.maps.marker.PinElement({
                background: '#4f46e5',
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
    }, [map]) // Solo se crea una vez cuando el mapa está listo

    // Actualizar posición sin re-crear el marcador
    useEffect(() => {
        if (markerRef.current) {
            markerRef.current.position = position
        }
    }, [position])

    return null
}

export default function LiveTracking() {
    const [messengers, setMessengers] = useState<LiveTrackingUpdate[]>([])
    const [selectedMessenger, setSelectedMessenger] = useState<LiveTrackingUpdate | null>(null)
    const [loading, setLoading] = useState(true)
    const [connected, setConnected] = useState(false)
    const [mapCenter, setMapCenter] = useState({ lat: 4.6097, lng: -74.0817 }) // Bogotá

    // Fetch initial data via REST
    const fetchActiveMessengers = useCallback(async (manual = false) => {
        try {
            setLoading(true)
            const data = await trackingApiService.getActiveMessengers()
            const updatedMessengers = data || []
            setMessengers(updatedMessengers)

            // Update selected messenger data if it exists in the new list
            if (selectedMessenger) {
                const refreshed = updatedMessengers.find(m => m.messengerId === selectedMessenger.messengerId)
                if (refreshed) {
                    setSelectedMessenger(refreshed)
                }
            }

            if (manual) {
                toast.success("Monitoreo actualizado", {
                    description: `${updatedMessengers.length} mensajeros activos`,
                    id: "manual-refresh-success"
                })
            }

            // Center map on first messenger if available and it's the first load
            if (!manual && updatedMessengers.length > 0 && updatedMessengers[0].latitude && updatedMessengers[0].longitude) {
                setMapCenter({ lat: updatedMessengers[0].latitude, lng: updatedMessengers[0].longitude })
            }
        } catch (error: any) {
            console.error("Error fetching messengers:", error)
            // Don't show error for 404 (no active messengers - expected)
            const status = error.response?.status
            if (status !== 404) {
                toast.error("Error al cargar mensajeros", {
                    description: error.response?.data?.message || error.message,
                    id: "error-cargar-mensajeros"
                })
            }
            // Set empty array on error
            setMessengers([])
        } finally {
            setLoading(false)
        }
    }, [selectedMessenger])

    // Handle real-time updates
    const handleTrackingUpdate = useCallback((update: LiveTrackingUpdate) => {
        // If the messenger goes offline, remove them from the list
        if (update.status === 'OFFLINE') {
            setMessengers(prev => prev.filter(m => m.messengerId !== update.messengerId))
            setSelectedMessenger(prev => prev?.messengerId === update.messengerId ? null : prev)
            return
        }

        setMessengers(prev => {
            const existing = prev.findIndex(m => m.messengerId === update.messengerId)
            if (existing >= 0) {
                const updated = [...prev]
                updated[existing] = update
                return updated
            }
            return [...prev, update]
        })

        // Also update selected messenger info if it matches the ID
        setSelectedMessenger(prev => prev?.messengerId === update.messengerId ? update : prev)
    }, [])

    // Connect to WebSocket on mount
    useEffect(() => {
        fetchActiveMessengers()

        trackingService.connect(() => {
            setConnected(true)
            trackingService.subscribeToAll(handleTrackingUpdate)
        })

        return () => {
            trackingService.disconnect()
            setConnected(false)
        }
    }, [fetchActiveMessengers, handleTrackingUpdate])

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
            {/* Header */}
            <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight">Monitoreo en Vivo</h1>
                    <Badge variant={connected ? "default" : "secondary"} className="gap-1">
                        {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                        {connected ? "Conectado" : "Desconectado"}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                        <Users className="h-3 w-3" />
                        {messengers.length} activos
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => fetchActiveMessengers(true)} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </Button>
                </div>
            </div>

            {/* Map Container */}
            <Card className="flex-1 w-full overflow-hidden border p-1 bg-muted/20">
                <CardContent className="p-0 h-full w-full relative">
                    {loading && messengers.length === 0 ? (
                        <Skeleton className="w-full h-full rounded-md" />
                    ) : (
                        <Map className="w-full h-full rounded-md" center={mapCenter} zoom={12}>
                            {messengers.map((messenger) => (
                                messenger.latitude && messenger.longitude && (
                                    <AdvancedMarker
                                        key={messenger.messengerId}
                                        position={{ lat: messenger.latitude, lng: messenger.longitude }}
                                        onClick={() => setSelectedMessenger(messenger)}
                                        title={messenger.messengerName || `Mensajero #${messenger.messengerId}`}
                                    />
                                )
                            ))}

                            {selectedMessenger && selectedMessenger.latitude && selectedMessenger.longitude && (
                                <InfoWindow
                                    position={{ lat: selectedMessenger.latitude, lng: selectedMessenger.longitude }}
                                    onCloseClick={() => setSelectedMessenger(null)}
                                >
                                    <div className="p-2 min-w-[150px]">
                                        <p className="font-semibold text-sm">{selectedMessenger.messengerName || `Mensajero #${selectedMessenger.messengerId}`}</p>
                                        <p className="text-xs text-gray-600">
                                            {selectedMessenger.status === 'ACTIVE' ? '🟢 Activo' : '🔴 Inactivo'}
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
                        </Map>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
