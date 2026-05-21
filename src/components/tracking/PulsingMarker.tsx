import { useEffect, useRef, memo, useMemo } from "react"
import type { LiveTrackingUpdate } from "@/services/tracking.service"
import { useGoogleMap } from "@react-google-maps/api"

export interface PulsingMarkerProps {
    messenger: LiveTrackingUpdate
    onClick: (messenger: LiveTrackingUpdate) => void
    onDeselect?: () => void
    isOnline: boolean
    isSelected?: boolean
}

/**
 * Marcador de mapa con efecto de pulsación visual para mensajeros activos.
 * Muestra información contextual al ser seleccionado y cambia de color según el estado de conexión.
 */
export const PulsingMarker = memo(function PulsingMarker({
    messenger,
    onClick,
    onDeselect,
    isOnline,
    isSelected
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
    const containerRef = useRef<HTMLDivElement | null>(null)

    const latestMessenger = useRef(messenger)
    const latestOnClick = useRef(onClick)
    const latestOnDeselect = useRef(onDeselect)

    useEffect(() => {
        latestMessenger.current = messenger
        latestOnClick.current = onClick
        latestOnDeselect.current = onDeselect
    }, [messenger, onClick, onDeselect])

    useEffect(() => {
        if (!map || !window.google?.maps?.marker) return

        const container = document.createElement('div')
        container.style.position = 'relative'
        container.style.cursor = 'pointer'
        containerRef.current = container

        const marker = new google.maps.marker.AdvancedMarkerElement({
            map,
            content: container,
        })
        
        marker.addListener('gmp-click', () => {
            if (latestOnClick.current && latestMessenger.current) {
                latestOnClick.current(latestMessenger.current)
            }
        })

        markerRef.current = marker

        return () => {
            marker.map = null
            markerRef.current = null
        }
    }, [map])

    useEffect(() => {
        if (!markerRef.current) return
        markerRef.current.position = position
        markerRef.current.title = title
        markerRef.current.zIndex = isSelected ? 100 : undefined
    }, [position, title, isSelected])

    useEffect(() => {
        if (!containerRef.current || !window.google?.maps?.marker) return
        
        const container = containerRef.current
        container.innerHTML = ''

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
                animation: pulse 4s infinite;
                pointer-events: none; 
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

        if (isSelected) {
            const popup = document.createElement('div')
            popup.className = "bg-background/90 backdrop-blur-md rounded-md shadow-lg border px-3 py-1.5 absolute"
            popup.style.cssText = `
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translate(-50%, -12px);
                white-space: nowrap;
                z-index: 50;
                display: flex;
                align-items: center;
                gap: 8px;
            `

            const nameSpan = document.createElement('span')
            nameSpan.textContent = title
            nameSpan.className = "text-xs font-semibold"
            popup.appendChild(nameSpan)

            if (latestOnDeselect.current) {
                const closeBtn = document.createElement('button')
                closeBtn.innerHTML = '✕'
                closeBtn.className = "text-muted-foreground hover:text-foreground ml-1"
                closeBtn.style.cssText = `
                    font-size: 10px;
                    line-height: 1;
                    padding: 2px;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                `
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation()
                    if (latestOnDeselect.current) {
                        latestOnDeselect.current()
                    }
                })
                popup.appendChild(closeBtn)
            }

            container.appendChild(popup)
            container.style.zIndex = '1000'
        } else {
            container.style.zIndex = ''
        }
    }, [isActive, color, isSelected, title])

    return null
})
