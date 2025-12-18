import { useEffect, useState, useCallback } from "react"
import { Map } from "@/components/Map"
import { Marker, InfoWindow } from "@react-google-maps/api"
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

export default function LiveTracking() {
    const [messengers, setMessengers] = useState<LiveTrackingUpdate[]>([])
    const [selectedMessenger, setSelectedMessenger] = useState<LiveTrackingUpdate | null>(null)
    const [loading, setLoading] = useState(true)
    const [connected, setConnected] = useState(false)
    const [mapCenter, setMapCenter] = useState({ lat: 4.6097, lng: -74.0817 }) // Bogotá

    // Fetch initial data via REST
    const fetchActiveMessengers = useCallback(async () => {
        try {
            setLoading(true)
            const data = await trackingApiService.getActiveMessengers()
            setMessengers(data)

            // Center map on first messenger if available
            if (data.length > 0 && data[0].latitude && data[0].longitude) {
                setMapCenter({ lat: data[0].latitude, lng: data[0].longitude })
            }
        } catch (error: any) {
            console.error("Error fetching messengers:", error)
            // Don't show error toast for 404 (no active messengers)
            if (error.response?.status !== 404) {
                toast.error("Error al cargar mensajeros", {
                    description: error.response?.data?.message || error.message
                })
            }
        } finally {
            setLoading(false)
        }
    }, [])

    // Handle real-time updates
    const handleTrackingUpdate = useCallback((update: LiveTrackingUpdate) => {
        setMessengers(prev => {
            const existing = prev.findIndex(m => m.messengerId === update.messengerId)
            if (existing >= 0) {
                const updated = [...prev]
                updated[existing] = update
                return updated
            }
            return [...prev, update]
        })
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
                    <Button variant="outline" size="sm" onClick={fetchActiveMessengers} disabled={loading}>
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
                                    <Marker
                                        key={messenger.messengerId}
                                        position={{ lat: messenger.latitude, lng: messenger.longitude }}
                                        onClick={() => setSelectedMessenger(messenger)}
                                        icon={{
                                            url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%234f46e5' stroke='white' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpath d='M12 2a10 10 0 0 0-7 17l7 5 7-5a10 10 0 0 0-7-17z'/%3E%3C/svg%3E",
                                            scaledSize: new google.maps.Size(40, 40),
                                            anchor: new google.maps.Point(20, 40),
                                        }}
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
