import { useEffect, useState, useRef } from "react"
import { Map } from "@/features/location/components/Map"
import { useGoogleMap } from "@react-google-maps/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { trackingApiService } from "@/features/tracking/services/tracking-api.service"
import { locationService } from "@/features/location/services/location.service"
import type { TrackingHistoryItem } from "@/features/location/types/location.types"
import { MapPin, Navigation2, Flag, Home } from "lucide-react"
import type { ServiceStatus } from "@/features/delivery/types/service.types"
import { getStatusBadge } from "@/shared/lib/status-utils"
import { DEFAULT_STATUS_COLORS } from "@/shared/lib/status-colors"
import { logger } from "@/shared/utils/logger"

interface ServiceTrackingMapProps {
    serviceId: string
    dealershipLat?: number
    dealershipLng?: number
    dealershipName?: string
    originDealershipLat?: number
    originDealershipLng?: number
    originDealershipName?: string
    serviceStatus?: ServiceStatus
    className?: string
}

/**
 * Marcador avanzado reutilizable para el mapa de rastreo de servicio.
 * Permite personalizar el color y la etiqueta del pin.
 */
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
            content: pinElement
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

/**
 * Componente de mapa especializado para el rastreo histórico y en tiempo real de un servicio específico.
 * Visualiza la ruta recorrida, puntos de inicio/fin y calcula distancias estimadas al destino.
 */
export function ServiceTrackingMap({
    serviceId,
    dealershipLat,
    dealershipLng,
    dealershipName,
    originDealershipLat,
    originDealershipLng,
    originDealershipName,
    serviceStatus,
    className = ""
}: ServiceTrackingMapProps) {
    const getStatusHexColor = (status?: ServiceStatus | string): string => {
        return DEFAULT_STATUS_COLORS[status || ''] || '#6b7280'
    }

    const [trackingData, setTrackingData] = useState<TrackingHistoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [distance, setDistance] = useState<{ meters: number | null, seconds: number | null } | null>(null)
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)

    const mapCenter = dealershipLat && dealershipLng
        ? { lat: dealershipLat, lng: dealershipLng }
        : { lat: 6.2442, lng: -75.5812 }

    const panTo = (position: google.maps.LatLngLiteral) => {
        if (mapInstance) {
            mapInstance.panTo(position)
            mapInstance.setZoom(16)
        }
    }

    useEffect(() => {
        const fetchTrackingData = async () => {
            try {
                setLoading(true)
                const data = await trackingApiService.getHistoryByService(serviceId)
                setTrackingData(data || [])
            } catch (error) {
                logger.error("Error al obtener seguimiento del servicio:", error)
                setTrackingData([])
            } finally {
                setLoading(false)
            }
        }

        fetchTrackingData()
    }, [serviceId])

    useEffect(() => {
        const autoCalculateDistance = async () => {
            if (trackingData.length === 0 || !dealershipLat || !dealershipLng) return

            const path = trackingData
                .filter(h => h.latitude && h.longitude)
                .map(h => ({ lat: h.latitude, lng: h.longitude }))

            const lastPos = path.length > 0 ? path[path.length - 1] : null
            if (!lastPos) return

            try {
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
                setDistance(null)
            }
        }

        autoCalculateDistance()
    }, [trackingData, dealershipLat, dealershipLng])

    const trackingPath = trackingData
        .filter(h => h.latitude && h.longitude)
        .map(h => ({ lat: h.latitude, lng: h.longitude }))

    const lastPosition = trackingPath.length > 0 ? trackingPath[trackingPath.length - 1] : null
    const firstPosition = trackingPath.length > 0 ? trackingPath[0] : null
    const startColor = getStatusHexColor('ASSIGNED')
    const endColor = serviceStatus ? getStatusHexColor(serviceStatus) : getStatusHexColor('PENDING')
    const endLabel = serviceStatus ? getStatusBadge(serviceStatus).label : 'Última ubicación'



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
                <CardHeader className="p-2 pb-0">
                    <CardTitle className="text-base text-foreground font-semibold">
                        Ubicaciones
                    </CardTitle>
                </CardHeader>
                <CardContent>
                </CardContent>
            </Card>
        )
    }

    if (trackingData.length === 0 && !dealershipLat) {
        return (
            <Card className={className}>
                <CardHeader className="p-2 pb-0">
                    <CardTitle className="text-base text-foreground font-semibold">
                        Ubicaciones
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
        <Card className={className || "h-full flex flex-col"}>
            <CardHeader className="p-2 pb-0 space-y-1">
                <CardTitle className="text-base text-foreground font-semibold">
                    Ubicaciones
                </CardTitle>

                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-4 text-sm font-normal flex-wrap">
                        {originDealershipLat && originDealershipLng && (
                            <button
                                onClick={() => panTo({ lat: originDealershipLat, lng: originDealershipLng })}
                                className="flex items-center gap-1.5 hover:opacity-70 transition-opacity cursor-pointer"
                                title={`Ir a origen: ${originDealershipName ?? 'Concesionario origen'}`}
                            >
                                <Home className="h-4 w-4 text-blue-500" />
                                <span className="text-muted-foreground">Origen</span>
                            </button>
                        )}
                        {firstPosition && (
                            <button
                                onClick={() => panTo(firstPosition)}
                                className="flex items-center gap-1.5 hover:opacity-70 transition-opacity cursor-pointer"
                                title="Ir a inicio de ruta"
                            >
                                <Navigation2 className="h-4 w-4" style={{ color: startColor }} />
                                <span className="text-muted-foreground">Inicio</span>
                            </button>
                        )}
                        {trackingPath.length > 1 && lastPosition && (
                            <button
                                onClick={() => panTo(lastPosition)}
                                className="flex items-center gap-1.5 hover:opacity-70 transition-opacity cursor-pointer"
                                title="Ir a posición actual"
                            >
                                <MapPin className="h-4 w-4" style={{ color: endColor }} />
                                <span className="text-muted-foreground">Actual</span>
                            </button>
                        )}
                        {dealershipLat && dealershipLng && (
                            <button
                                onClick={() => panTo({ lat: dealershipLat, lng: dealershipLng })}
                                className="flex items-center gap-1.5 hover:opacity-70 transition-opacity cursor-pointer"
                                title="Ir a destino"
                            >
                                <Flag className="h-4 w-4 text-orange-500" />
                                <span className="text-muted-foreground">Destino</span>
                            </button>
                        )}
                    </div>

                    {lastPosition && dealershipLat && dealershipLng && (
                        <div className="flex items-center gap-2">
                            {distance && distance.meters !== null ? (
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
                </div>
            </CardHeader>
            <CardContent className="p-2 pt-1 flex-1 flex flex-col min-h-0">

                <div className="w-full flex-1 min-h-[200px] rounded-md overflow-hidden border">
                    <Map
                        className="w-full h-full"
                        center={lastPosition || mapCenter}
                        zoom={14}
                        onLoad={setMapInstance}
                    >


                        {originDealershipLat && originDealershipLng && (
                            <AdvancedMarker
                                position={{ lat: originDealershipLat, lng: originDealershipLng }}
                                title={originDealershipName || "Concesionario origen"}
                                color="#3b82f6"
                                label="O"
                            />
                        )}


                        {firstPosition && (
                            <AdvancedMarker
                                position={firstPosition}
                                title="Inicio de ruta"
                                color={startColor}
                                label="A"
                            />
                        )}


                        {lastPosition && lastPosition !== firstPosition && (
                            <AdvancedMarker
                                position={lastPosition}
                                title={endLabel}
                                color={endColor}
                                label="B"
                            />
                        )}


                        {dealershipLat && dealershipLng && (
                            <AdvancedMarker
                                position={{ lat: dealershipLat, lng: dealershipLng }}
                                title={dealershipName || "Concesionario destino"}
                                color="#f97316"
                                label="D"
                            />
                        )}
                    </Map>
                </div>



            </CardContent>
        </Card>
    )
}
