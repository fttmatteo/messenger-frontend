import { useEffect, useState, useRef } from "react"
import { Map } from "@/components/Map"
import { useGoogleMap, Polyline } from "@react-google-maps/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { trackingApiService } from "@/services/tracking-api.service"
import { locationService } from "@/services/location.service"
import type { TrackingHistoryItem } from "@/types/location.types"
import { MapPin, Route, Loader2 } from "lucide-react"

import type { ServiceStatus } from "@/types/service.types"
import { getStatusBadge } from "@/lib/status-utils"
import { useStatusColors } from "@/hooks/use-status-colors"

interface ServiceTrackingMapProps {
    serviceId: number
    dealershipLat?: number
    dealershipLng?: number
    dealershipName?: string
    serviceStatus?: ServiceStatus
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
    const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null)

    useEffect(() => {
        if (!map || !window.google?.maps?.marker) return

        const pinElement = new google.maps.marker.PinElement({
            background: color,
            borderColor: 'white',
            glyphColor: 'white',
            ...(label && { glyphText: label }),
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
    // Get colors from context
    const { colors } = useStatusColors()

    // Helper to get HEX color from status
    const getStatusHexColor = (status?: ServiceStatus | string): string => {
        return colors[status || ''] || '#6b7280'
    }

    // ... state hooks ...
    const [trackingData, setTrackingData] = useState<TrackingHistoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [distance, setDistance] = useState<{ meters: number | null, seconds: number | null } | null>(null)
    const [loadingDistance, setLoadingDistance] = useState(false)
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)

    const mapCenter = dealershipLat && dealershipLng
        ? { lat: dealershipLat, lng: dealershipLng }
        : { lat: 6.2442, lng: -75.5812 }

    // Pan to a specific position on the map
    const panTo = (position: google.maps.LatLngLiteral) => {
        if (mapInstance) {
            mapInstance.panTo(position)
            mapInstance.setZoom(16)
        }
    }

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

    // Auto-calculate distance when tracking data is loaded
    useEffect(() => {
        const autoCalculateDistance = async () => {
            if (trackingData.length === 0 || !dealershipLat || !dealershipLng) return

            const path = trackingData
                .filter(h => h.latitude && h.longitude)
                .map(h => ({ lat: h.latitude, lng: h.longitude }))

            const lastPos = path.length > 0 ? path[path.length - 1] : null
            if (!lastPos) return

            try {
                setLoadingDistance(true)
                const result = await locationService.calculateDistance(
                    lastPos.lat,
                    lastPos.lng,
                    dealershipLat,
                    dealershipLng
                )
                setDistance({
                    meters: result.distanceMeters,
                    seconds: result.durationSeconds
                })
            } catch {
                // Silently fail - distance calculation may not be possible 
                // (e.g., intercontinental distances, no driving route available)
                setDistance(null)
            } finally {
                setLoadingDistance(false)
            }
        }

        autoCalculateDistance()
    }, [trackingData, dealershipLat, dealershipLng])

    const trackingPath = trackingData
        .filter(h => h.latitude && h.longitude)
        .map(h => ({ lat: h.latitude, lng: h.longitude }))

    const lastPosition = trackingPath.length > 0 ? trackingPath[trackingPath.length - 1] : null
    const firstPosition = trackingPath.length > 0 ? trackingPath[0] : null

    // Determine colors and labels based on status
    const startColor = getStatusHexColor('ASSIGNED')
    const endColor = serviceStatus ? getStatusHexColor(serviceStatus) : getStatusHexColor('PENDING')
    const endLabel = serviceStatus ? getStatusBadge(serviceStatus, colors).label : 'Última ubicación'



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
            <CardHeader className="px-2 py-1">
                <CardTitle className="flex items-center justify-between text-sm text-foreground font-medium">
                    {/* Left: Title */}
                    <div className="flex items-center gap-2">
                        <Route className="h-4 w-4" />
                        Recorrido del servicio
                    </div>
                    {/* Center: Legend - Clickable */}
                    <div className="flex items-center gap-4 text-sm font-normal">
                        {firstPosition && (
                            <button
                                onClick={() => panTo(firstPosition)}
                                className="flex items-center gap-1.5 hover:opacity-70 transition-opacity cursor-pointer"
                                title="Ir a inicio"
                            >
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: startColor }} />
                                <span className="text-muted-foreground">Inicio</span>
                            </button>
                        )}
                        {trackingPath.length > 1 && lastPosition && (
                            <button
                                onClick={() => panTo(lastPosition)}
                                className="flex items-center gap-1.5 hover:opacity-70 transition-opacity cursor-pointer"
                                title="Ir a posición actual"
                            >
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: endColor }} />
                                <span className="text-muted-foreground">Actual</span>
                            </button>
                        )}
                        {dealershipLat && dealershipLng && (
                            <button
                                onClick={() => panTo({ lat: dealershipLat, lng: dealershipLng })}
                                className="flex items-center gap-1.5 hover:opacity-70 transition-opacity cursor-pointer"
                                title="Ir a destino"
                            >
                                <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                                <span className="text-muted-foreground">Destino</span>
                            </button>
                        )}
                    </div>
                    {/* Right: Distance info */}
                    {lastPosition && dealershipLat && dealershipLng && (
                        <div className="flex items-center gap-2">
                            {loadingDistance ? (
                                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                </div>
                            ) : distance && distance.meters !== null ? (
                                <>
                                    <Badge variant="secondary" className="text-xs font-normal">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {formatDistance(distance.meters)}
                                    </Badge>
                                    {distance.seconds !== null && (
                                        <Badge variant="outline" className="text-xs font-normal">
                                            ~{formatDuration(distance.seconds)}
                                        </Badge>
                                    )}
                                </>
                            ) : null}
                        </div>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-1">
                {/* Map */}
                <div className="w-full h-[300px] rounded-md overflow-hidden border">
                    <Map
                        className="w-full h-full"
                        center={lastPosition || mapCenter}
                        zoom={14}
                        onLoad={setMapInstance}
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



            </CardContent>
        </Card>
    )
}
