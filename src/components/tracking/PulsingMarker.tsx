import { useEffect, useRef, memo, useMemo } from "react"
import type { LiveTrackingUpdate } from "@/services/tracking.service"
import { useGoogleMap } from "@react-google-maps/api"

export interface PulsingMarkerProps {
    messenger: LiveTrackingUpdate
    onClick: (messenger: LiveTrackingUpdate) => void
    isOnline: boolean
}

export const PulsingMarker = memo(function PulsingMarker({
    messenger,
    onClick,
    isOnline
}: PulsingMarkerProps) {
    const position = useMemo(() => ({
        lat: messenger.latitude,
        lng: messenger.longitude
    }), [messenger.latitude, messenger.longitude])
    const title = messenger.messengerName || `Mensajero #${messenger.messengerId}`
    const color = isOnline ? '#10b981' : '#6b7280'
    const isActive = isOnline
    const map = useGoogleMap()
    const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null)

    useEffect(() => {
        if (!map || !window.google?.maps?.marker) return

        const container = document.createElement('div')
        container.style.position = 'relative'

        if (isActive) {
            const pulse = document.createElement('div')
            pulse.style.cssText = `
                position: absolute;
                width: 40px;
                height: 40px;
                background: ${color}40;
                border-radius: 50%;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                animation: pulse 2s infinite;
            `
            container.appendChild(pulse)

            if (!document.getElementById('pulse-keyframes')) {
                const style = document.createElement('style')
                style.id = 'pulse-keyframes'
                style.textContent = `
                    @keyframes pulse {
                        0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                        100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
                    }
                `
                document.head.appendChild(style)
            }
        }

        const pinElement = new google.maps.marker.PinElement({
            background: color,
            borderColor: 'white',
            glyphColor: 'white',
            scale: isActive ? 1.2 : 1,
        })
        container.appendChild(pinElement.element)

        const marker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position,
            title,
            content: container
        })

        marker.addListener('click', () => {
            onClick(messenger)
        })

        markerRef.current = marker

        return () => {
            if (markerRef.current) {
                markerRef.current.map = null
            }
        }
    }, [map, color, onClick, position, title, isActive, messenger])

    useEffect(() => {
        if (markerRef.current) {
            markerRef.current.position = position
        }
    }, [position])

    return null
})
