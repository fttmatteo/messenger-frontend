import { useState, useEffect, useRef } from "react"
import { Map } from "@/features/location/components/Map"
import { useGoogleMap } from "@react-google-maps/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Flag, MapPin } from "lucide-react"
import type { ServiceStatus } from "@/features/delivery/types/service.types"

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
 * Componente de mapa para visualizar origen y destino de un servicio.
 */
export function ServiceTrackingMap({
    dealershipLat,
    dealershipLng,
    dealershipName,
    originDealershipLat,
    originDealershipLng,
    originDealershipName,
    className = ""
}: ServiceTrackingMapProps) {
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)

    const mapCenter = dealershipLat && dealershipLng
        ? { lat: dealershipLat, lng: dealershipLng }
        : originDealershipLat && originDealershipLng
            ? { lat: originDealershipLat, lng: originDealershipLng }
            : { lat: 6.2442, lng: -75.5812 }

    const panTo = (position: google.maps.LatLngLiteral) => {
        if (mapInstance) {
            mapInstance.panTo(position)
            mapInstance.setZoom(16)
        }
    }

    if (!dealershipLat && !originDealershipLat) {
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
                                <MapPin className="h-5 w-5 text-blue-500" />
                                <span className="text-muted-foreground">Origen</span>
                            </button>
                        )}
                        
                        {dealershipLat && dealershipLng && (
                            <button
                                onClick={() => panTo({ lat: dealershipLat, lng: dealershipLng })}
                                className="flex items-center gap-1.5 hover:opacity-70 transition-opacity cursor-pointer"
                                title="Ir a destino"
                            >
                                <Flag className="h-5 w-5 text-orange-500" />
                                <span className="text-muted-foreground">Destino</span>
                            </button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-2 pt-1 flex-1 flex flex-col min-h-0">

                <div className="w-full flex-1 min-h-[200px] rounded-md overflow-hidden border">
                    <Map
                        className="w-full h-full"
                        center={mapCenter}
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
