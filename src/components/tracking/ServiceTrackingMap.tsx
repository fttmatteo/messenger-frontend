import { useEffect, useState, useRef } from "react"
import { Map } from "@/components/Map"
import { useGoogleMap, Polyline } from "@react-google-maps/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { trackingApiService } from "@/services/tracking-api.service"
import { locationService } from "@/services/location.service"
import type { TrackingHistoryItem } from "@/types/location.types"
import { MapPin, Navigation, Route, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ServiceTrackingMapProps {
    serviceId: number
    dealershipLat?: number
    dealershipLng?: number
    dealershipName?: string
    className?: string
}

// Componente para manejar AdvancedMarkerElement
function AdvancedMarker({ position, title, color = '#4f46e5', label }: {
    position: google.maps.LatLngLiteral,
    title?: string,
    color?: string,
    label?: string
}) {
    const map = useGoogleMap()
    const markerRef = useRef<any>(null)

    useEffect(() => {
        if (!map || !window.google?.maps?.marker) return

        const pinElement = new google.maps.marker.PinElement({
            background: color,
            borderColor: 'white',
            glyphColor: 'white',
            glyph: label,
        })

        const marker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position,
            title,
            content: pinElement.element
        })

        markerRef.current = marker

        return () => {
            if (markerRef.current) {
                markerRef.current.map = null
            }
        }
    }, [map, color, label])

    useEffect(() => {
        if (markerRef.current) {
            markerRef.current.position = position
        }
    }, [position])

    return null
}

export function ServiceTrackingMap({
    serviceId,
    dealershipLat,
    dealershipLng,
    dealershipName,
    className = ""
}: ServiceTrackingMapProps) {
    const [trackingData, setTrackingData] = useState<TrackingHistoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [distance, setDistance] = useState<{ meters: number | null, seconds: number | null } | null>(null)
    const [loadingDistance, setLoadingDistance] = useState(false)

    const mapCenter = dealershipLat && dealershipLng
        ? { lat: dealershipLat, lng: dealershipLng }
        : { lat: 6.2442, lng: -75.5812 }

    useEffect(() => {
        const fetchTrackingData = async () => {
            try {
                setLoading(true)
                const data = await trackingApiService.getHistoryByService(serviceId)
                setTrackingData(data || [])
            } catch (error: any) {
                console.error("Error fetching service tracking:", error)
                setTrackingData([])
            } finally {
                setLoading(false)
            }
        }

        fetchTrackingData()
    }, [serviceId])

    const trackingPath = trackingData
        .filter(h => h.latitude && h.longitude)
        .map(h => ({ lat: h.latitude, lng: h.longitude }))

    const lastPosition = trackingPath.length > 0 ? trackingPath[trackingPath.length - 1] : null
    const firstPosition = trackingPath.length > 0 ? trackingPath[0] : null

    const calculateDistance = async () => {
        if (!lastPosition || !dealershipLat || !dealershipLng) return

        try {
            setLoadingDistance(true)
            const result = await locationService.calculateDistance(
                lastPosition.lat,
                lastPosition.lng,
                dealershipLat,
                dealershipLng
            )
            setDistance({
                meters: result.distanceMeters,
                seconds: result.durationSeconds
            })
        } catch (error: any) {
            toast.error("Error al calcular distancia", {
                description: error.message,
                id: "error-calcular-distancia"
            })
        } finally {
            setLoadingDistance(false)
        }
    }

    const formatDistance = (meters: number) => {
        if (meters >= 1000) {
            return `${(meters / 1000).toFixed(1)} km`
        }
        return `${Math.round(meters)} m`
    }

    const formatDuration = (seconds: number) => {
        const mins = Math.round(seconds / 60)
        if (mins >= 60) {
            const hours = Math.floor(mins / 60)
            const remainingMins = mins % 60
            return `${hours}h ${remainingMins}min`
        }
        return `${mins} min`
    }

    if (loading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Route className="h-5 w-5" />
                        Recorrido del servicio
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="w-full h-[300px] rounded-md" />
                </CardContent>
            </Card>
        )
    }

    if (trackingData.length === 0 && !dealershipLat) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Route className="h-5 w-5" />
                        Recorrido del servicio
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                        No hay datos de ubicación disponibles para este servicio
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Route className="h-5 w-5" />
                    Recorrido del servicio
                </CardTitle>
                <CardDescription>
                    {trackingData.length > 0
                        ? `${trackingData.length} puntos registrados`
                        : "Ubicación del concesionario"
                    }
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Map */}
                <div className="w-full h-[300px] rounded-md overflow-hidden border">
                    <Map
                        className="w-full h-full"
                        center={lastPosition || mapCenter}
                        zoom={14}
                    >
                        {/* Tracking route polyline */}
                        {trackingPath.length > 1 && (
                            <Polyline
                                path={trackingPath}
                                options={{
                                    strokeColor: '#4f46e5',
                                    strokeOpacity: 0.8,
                                    strokeWeight: 4,
                                }}
                            />
                        )}

                        {/* Start marker */}
                        {firstPosition && (
                            <AdvancedMarker
                                position={firstPosition}
                                title="Inicio del recorrido"
                                color="#22c55e"
                                label="A"
                            />
                        )}

                        {/* Last/Current position marker */}
                        {lastPosition && lastPosition !== firstPosition && (
                            <AdvancedMarker
                                position={lastPosition}
                                title="Última ubicación del mensajero"
                                color="#4f46e5"
                                label="B"
                            />
                        )}

                        {/* Dealership marker */}
                        {dealershipLat && dealershipLng && (
                            <AdvancedMarker
                                position={{ lat: dealershipLat, lng: dealershipLng }}
                                title={dealershipName || "Concesionario"}
                                color="#f97316"
                            />
                        )}
                    </Map>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-sm">
                    {firstPosition && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span className="text-muted-foreground">Inicio</span>
                        </div>
                    )}
                    {trackingPath.length > 1 && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-indigo-500" />
                            <span className="text-muted-foreground">Última ubicación</span>
                        </div>
                    )}
                    {dealershipLat && dealershipLng && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-orange-500" />
                            <span className="text-muted-foreground">Concesionario</span>
                        </div>
                    )}
                </div>

                {/* Distance info */}
                {lastPosition && dealershipLat && dealershipLng && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2 border-t">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={calculateDistance}
                            disabled={loadingDistance}
                        >
                            {loadingDistance ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Navigation className="h-4 w-4 mr-2" />
                            )}
                            Calcular distancia
                        </Button>

                        {distance && distance.meters !== null && (
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-sm">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {formatDistance(distance.meters)}
                                </Badge>
                                {distance.seconds !== null && (
                                    <Badge variant="outline" className="text-sm">
                                        ~{formatDuration(distance.seconds)}
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
