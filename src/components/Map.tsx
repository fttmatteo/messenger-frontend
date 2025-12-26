import { GoogleMap, useJsApiLoader, type Libraries } from '@react-google-maps/api'
import { memo, useCallback, useEffect, useState } from 'react'
import { useTheme } from "next-themes"

const containerStyle = {
    width: '100%',
    height: '100%'
}

const defaultCenter = {
    lat: 6.2442, // Medellín default
    lng: -75.5812
}

// Type-safe libraries array
const LIBRARIES: Libraries = ["marker"];

// Google Maps color scheme types
type ColorScheme = 'DARK' | 'LIGHT' | 'FOLLOW_SYSTEM';

interface MapProps {
    center?: google.maps.LatLngLiteral
    zoom?: number
    children?: React.ReactNode
    onLoad?: (map: google.maps.Map) => void
    onUnmount?: (map: google.maps.Map) => void
    className?: string
}

function MapComponent({ center = defaultCenter, zoom = 13, children, onLoad, onUnmount, className }: MapProps) {
    const { resolvedTheme } = useTheme()
    const [map, setMap] = useState<google.maps.Map | null>(null)

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: LIBRARIES
    })

    const handleLoad = useCallback((mapInstance: google.maps.Map) => {
        setMap(mapInstance)
        if (onLoad) onLoad(mapInstance)
    }, [onLoad])

    const handleUnmount = useCallback((mapInstance: google.maps.Map) => {
        setMap(null)
        if (onUnmount) onUnmount(mapInstance)
    }, [onUnmount])

    // Get color scheme based on theme
    const getColorScheme = (): ColorScheme => {
        return resolvedTheme === 'dark' ? 'DARK' : 'LIGHT'
    }

    // Update map options when theme changes or map instance is ready
    useEffect(() => {
        if (map) {
            map.setOptions({
                colorScheme: getColorScheme()
            })
        }
    }, [map, resolvedTheme])

    if (!isLoaded) {
        return <div className={`w-full h-full bg-muted animate-pulse rounded-lg ${className || ''}`} />
    }

    return (
        <div className={className || 'w-full h-full'}>
            <GoogleMap
                key={resolvedTheme}
                mapContainerStyle={containerStyle}
                center={center}
                zoom={zoom}
                onLoad={handleLoad}
                onUnmount={handleUnmount}
                options={{
                    mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID",
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: true,
                    colorScheme: getColorScheme(),
                }}
            >
                {children}
            </GoogleMap>
        </div>
    )
}

export const Map = memo(MapComponent)
