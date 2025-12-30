import { useEffect, useRef } from "react"
import { useGoogleMap } from "@react-google-maps/api"

export interface MessengerMarkerProps {
    /** Position of the marker on the map */
    position: google.maps.LatLngLiteral
    /** Color of the marker pin (default: green '#10b981') */
    color?: string
    /** Title for the marker (shown on hover) */
    title?: string
}

/**
 * A marker component for displaying messenger location on a Google Map.
 * Uses the Advanced Marker API with customizable pin colors.
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
            }).element
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
