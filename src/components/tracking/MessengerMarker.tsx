import { useEffect, useRef } from "react"
import { useGoogleMap } from "@react-google-maps/api"

export interface MessengerMarkerProps {
    position: google.maps.LatLngLiteral
    color?: string
    title?: string
}

/**
 * Marcador avanzado de Google Maps para representar a un mensajero.
 * Utiliza AdvancedMarkerElement para una mejor integración y personalización del pin.
 */
export function MessengerMarker({
    position,
    color = '#10b981',
    title = "Ubicación actual"
}: MessengerMarkerProps) {
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
            })
        })

        markerRef.current = marker

        return () => {
            if (markerRef.current) {
                markerRef.current.map = null
            }
        }
    }, [map, position, color, title])

    return null
}
