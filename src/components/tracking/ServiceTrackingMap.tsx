import { useEffect, useState, useRef } from "react"
import { Map } from "@/components/Map"
import { useGoogleMap, Polyline } from "@react-google-maps/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { trackingApiService } from "@/services/tracking-api.service"
import { locationService } from "@/services/location.service"
import type { TrackingHistoryItem } from "@/types/location.types"
import { MapPin, Navigation, Route, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/error-utils"

import type { ServiceStatus } from "@/types/service.types"
import { getStatusBadge } from "@/lib/status-utils"

interface ServiceTrackingMapProps {
    serviceId: number
    dealershipLat?: number
    dealershipLng?: number
    dealershipName?: string
    serviceStatus?: ServiceStatus
    className?: string
}

// Maps service status to HEX colors for Google Maps markers
const getStatusHexColor = (status?: ServiceStatus | string): string => {
    switch (status) {
        case 'ASSIGNED': return '#3b82f6' // blue-500
        case 'PENDING': return '#6366f1' // indigo-500
        case 'DELIVERED': return '#22c55e' // green-500
        case 'RETURNED': return '#f97316' // orange-500
        case 'CANCELED': return '#ef4444' // red-500
        case 'RESOLVED': return '#a855f7' // purple-500
        case 'DELETED': return '#64748b' // slate-500
        default: return '#6b7280' // gray-500
    }
}

// Componente para manejar AdvancedMarkerElement
function AdvancedMarker({ position, title, color = '#4f46e5', label }: {
    position: google.maps.LatLngLiteral,
    title?: string,
    color?: string,
    label?: string
}) {
    const map = useGoogleMap()
    const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null)

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
    }, [map, color, label, position, title])

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
    serviceStatus,
    className = ""
}: ServiceTrackingMapProps) {
    // ... state hooks ...
    const [trackingData, setTrackingData] = useState<TrackingHistoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [distance, setDistance] = useState<{ meters: number | null, seconds: number | null } | null>(null)
    const [loadingDistance, setLoadingDistance] = useState(false)

    const mapCenter = dealershipLat && dealershipLng
        ? { lat: dealershipLat, lng: dealershipLng }
        : { lat: 6.2442, lng: -75.5812 }

    // ... useEffect for data fetching ...
    useEffect(() => {
        const fetchTrackingData = async () => {
            try {
                setLoading(true)
                const data = await trackingApiService.getHistoryByService(serviceId)
                setTrackingData(data || [])
            } catch (error) {
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

    // Determine colors and labels based on status
    const startColor = getStatusHexColor('ASSIGNED')
    const endColor = serviceStatus ? getStatusHexColor(serviceStatus) : getStatusHexColor('PENDING')
    const endLabel = serviceStatus ? getStatusBadge(serviceStatus).label : 'Última ubicación'

    // ... calculateDistance helper ...
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
        } catch (error) {
            toast.error("Error al calcular distancia", {
                description: getErrorMessage(error),
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

    // ... loading and empty states ...
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
            <CardHeader className="p-2 pb-0">
                <CardTitle className="flex items-center gap-2 text-base text-foreground font-semibold">
                    <Route className="h-4 w-4" />
                    Recorrido del servicio
                </CardTitle>
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
                                    strokeColor: endColor, // Route matches current status color
                                    strokeOpacity: 0.8,
                                    strokeWeight: 4,
                                }}
                            />
                        )}

                        {/* Start marker: Always "Asignado" (Blue) */}
                        {firstPosition && (
                            <AdvancedMarker
                                position={firstPosition}
                                title="Inicio - Asignado"
                                color={startColor}
                                label="A"
                            />
                        )}

                        {/* Last/Current position marker: Matches current Service Status */}
                        {lastPosition && lastPosition !== firstPosition && (
                            <AdvancedMarker
                                position={lastPosition}
                                title={endLabel}
                                color={endColor}
                                label="B"
                            />
                        )}

                        {/* Dealership marker: Always Orange (matches Returned/Destination concept or Keep generic orange) */}
                        {dealershipLat && dealershipLng && (
                            <AdvancedMarker
                                position={{ lat: dealershipLat, lng: dealershipLng }}
                                title={dealershipName || "Concesionario"}
                                color="#f97316"
                            // Customize icon or label if needed
                            />
                        )}
                    </Map>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-xs">
                    {firstPosition && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: startColor }} />
                            <span className="text-muted-foreground">Asignado (Inicio)</span>
                        </div>
                    )}
                    {trackingPath.length > 1 && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: endColor }} />
                            <span className="text-muted-foreground">{endLabel} (Actual)</span>
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
