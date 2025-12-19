import { GoogleMap, useJsApiLoader } from '@react-google-maps/api'
import { memo, useCallback } from 'react'

const containerStyle = {
    width: '100%',
    height: '100%'
}

const defaultCenter = {
    lat: 4.6097, // Bogotá default
    lng: -74.0817
}

const LIBRARIES: ("marker")[] = ["marker"];

interface MapProps {
    center?: google.maps.LatLngLiteral
    zoom?: number
    children?: React.ReactNode
    onLoad?: (map: google.maps.Map) => void
    onUnmount?: (map: google.maps.Map) => void
    className?: string
}

function MapComponent({ center = defaultCenter, zoom = 13, children, onLoad, onUnmount, className }: MapProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: LIBRARIES as any
    })

    const handleLoad = useCallback((map: google.maps.Map) => {
        if (onLoad) onLoad(map)
    }, [onLoad])

    const handleUnmount = useCallback((map: google.maps.Map) => {
        if (onUnmount) onUnmount(map)
    }, [onUnmount])

    if (!isLoaded) {
        return <div className={`w-full h-full bg-muted animate-pulse rounded-lg ${className || ''}`} />
    }

    return (
        <div className={className || 'w-full h-full'}>
            <GoogleMap
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
                }}
            >
                {children}
            </GoogleMap>
        </div>
    )
}

export const Map = memo(MapComponent)
