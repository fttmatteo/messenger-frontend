import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useGoogleMap } from "@react-google-maps/api"
import { Map } from "@/features/location/components/Map"
import { locationService } from "@/features/location/services/location.service"
import { useSmartLocation } from "@/features/tracking/hooks/use-smart-location"
import { useMessengerServices } from "@/features/delivery/hooks/use-messenger-services"
import { DEFAULT_STATUS_COLORS } from "@/shared/lib/status-colors"
import type { DeliveryRouteStep } from "@/features/location/types/location.types"
import { Button } from "@/shared/components/ui/button"
import { PlacaBadge } from "@/shared/components/ui/PlacaBadge"
import { useTheme } from "next-themes"
import { 
    MapPin, 
    Flag, 
    Package,
    Loader2,
    Focus,
    Navigation
} from "lucide-react"
import { createLogger } from "@/shared/utils/logger"

const logger = createLogger('OptimizedRoutePage')

/**
 * Marcador avanzado interno reutilizable para el mapa de ruta optimizada.
 */
interface AdvancedMarkerProps {
    position: google.maps.LatLngLiteral
    title?: string
    color?: string
    label?: string
    glyphColor?: string
    borderColor?: string
}

function AdvancedMarker({ position, title, color = '#4f46e5', label, glyphColor = 'white', borderColor = 'white' }: AdvancedMarkerProps) {
    const map = useGoogleMap()
    const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null)

    useEffect(() => {
        if (!map || !window.google?.maps?.marker) return

        const pinElement = new google.maps.marker.PinElement({
            background: color.startsWith('#') ? color.slice(0, 7) : color,
            borderColor: borderColor.startsWith('#') ? borderColor.slice(0, 7) : borderColor,
            glyphColor: glyphColor.startsWith('#') ? glyphColor.slice(0, 7) : glyphColor,
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
    }, [map, color, label, position, title, glyphColor, borderColor])

    useEffect(() => {
        if (markerRef.current) {
            markerRef.current.position = position
        }
    }, [position])

    return null
}

/**
 * Componente que renderiza la polilínea en el mapa y encuadra los límites.
 */
interface RoutePolylineProps {
    encodedPath: string
    color?: string
}

function RoutePolyline({ encodedPath, color = "#4f46e5" }: RoutePolylineProps) {
    const map = useGoogleMap()
    const polylineRef = useRef<google.maps.Polyline | null>(null)

    useEffect(() => {
        if (!map || !encodedPath || !window.google?.maps?.geometry?.encoding) return

        try {
            const decodedPath = google.maps.geometry.encoding.decodePath(encodedPath)

            const polyline = new google.maps.Polyline({
                path: decodedPath,
                geodesic: true,
                strokeColor: color,
                strokeOpacity: 0.8,
                strokeWeight: 5,
                map
            })

            polylineRef.current = polyline

            const bounds = new google.maps.LatLngBounds()
            decodedPath.forEach(latLng => bounds.extend(latLng))
            map.fitBounds(bounds)

            return () => {
                polyline.setMap(null)
            }
        } catch (e) {
            logger.error("Error al renderizar polilínea de ruta:", e)
        }
    }, [map, encodedPath, color])

    return null
}

/**
 * Vista para mostrar la ruta de entregas optimizada del mensajero.
 * Integrada nativamente en el layout de mensajero para usar el header global.
 */
export default function OptimizedRoutePage() {
    const navigate = useNavigate()
    const { getCurrentLocation, loading: loadingLocation } = useSmartLocation()
    const { services, pendingServices, loading: loadingServices } = useMessengerServices()
    const { resolvedTheme } = useTheme()
    
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)
    const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null)
    const [steps, setSteps] = useState<DeliveryRouteStep[]>([])
    const [polyline, setPolyline] = useState<string | null>(null)
    const [distanceText, setDistanceText] = useState<string>("")
    const [durationText, setDurationText] = useState<string>("")
    
    const [loadingRoute, setLoadingRoute] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const pickupColor = DEFAULT_STATUS_COLORS.ASSIGNED || '#00eeffe1'
    const deliveryColor = DEFAULT_STATUS_COLORS.DELIVERED || '#9ca3af' 

    useEffect(() => {
        const calculateRoute = async () => {
            if (loadingServices) return
            if (pendingServices.length === 0) {
                setSteps([])
                setPolyline(null)
                return
            }

            try {
                setLoadingRoute(true)
                setError(null)

                const loc = await getCurrentLocation()
                setCurrentLocation(loc)

                const serviceUuids = pendingServices.map(s => s.uuid)
                const result = await locationService.optimizeDeliveriesRoute({
                    currentLatitude: loc.latitude,
                    currentLongitude: loc.longitude,
                    serviceUuids
                })

                setSteps(result.steps || [])
                setPolyline(result.polyline || null)
                setDistanceText(
                    result.distanceKilometers 
                        ? `${result.distanceKilometers.toFixed(1)} km` 
                        : "---"
                )
                setDurationText(result.durationFormatted || "---")
            } catch (err) {
                logger.error("Error al calcular ruta optimizada:", err)
                setError(err instanceof Error ? err.message : "Error al calcular la ruta optimizada")
            } finally {
                setLoadingRoute(false)
            }
        }

        calculateRoute()
    }, [pendingServices, loadingServices, getCurrentLocation])

    const handlePanTo = (lat: number, lng: number) => {
        if (mapInstance) {
            mapInstance.panTo({ lat, lng })
            mapInstance.setZoom(16)
        }
    }

    const handleFitBounds = () => {
        if (!mapInstance || !window.google?.maps) return
        const bounds = new window.google.maps.LatLngBounds()
        if (currentLocation) {
            bounds.extend(new window.google.maps.LatLng(currentLocation.latitude, currentLocation.longitude))
        }
        steps.forEach(step => {
            bounds.extend(new window.google.maps.LatLng(step.latitude, step.longitude))
        })
        mapInstance.fitBounds(bounds)
    }

    const openGoogleMapsNavigation = () => {
        if (!currentLocation || steps.length === 0) return
        const origin = `${currentLocation.latitude},${currentLocation.longitude}`
        const destStep = steps[steps.length - 1]
        const destination = `${destStep.latitude},${destStep.longitude}`
        
        const waypointSteps = steps.slice(0, steps.length - 1)
        const waypoints = waypointSteps.map(s => `${s.latitude},${s.longitude}`).join('%7C')
        
        let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving&dir_action=navigate`
        if (waypoints) {
            url += `&waypoints=${waypoints}`
        }
        
        window.location.href = url;
    }

    const getServicePlate = (serviceUuid: string) => {
        const service = services.find(s => s.uuid === serviceUuid)
        return service?.plate?.plateNumber || "---"
    }

    const isLoading = loadingServices || loadingLocation || loadingRoute

    return (
        <div className="flex-1 flex flex-col w-full h-full bg-background relative overflow-hidden">
            {isLoading ? (
                <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center gap-3">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground font-semibold">Optimizando ruta...</p>
                </div>
            ) : error ? (
                <div className="flex-1 min-h-[60vh] p-6 flex flex-col items-center justify-center gap-4 text-center">
                    <p className="text-sm text-destructive font-bold">{error}</p>
                    <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="rounded-xl">
                        Reintentar
                    </Button>
                </div>
            ) : pendingServices.length === 0 ? (
                <div className="flex-1 min-h-[60vh] p-6 flex flex-col items-center justify-center gap-4 text-center">
                    <div className="p-4 rounded-full bg-muted/50">
                        <Package className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground font-semibold">No tienes servicios asignados pendientes.</p>
                    <Button variant="outline" size="sm" onClick={() => navigate("/messenger")} className="rounded-xl">
                        Ir al panel
                    </Button>
                </div>
            ) : (
                <>
                    <div className="shrink-0 z-30 bg-background pt-3 pb-3 px-3 flex flex-col gap-3 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] border-b border-border/20">
                        {/* Resumen de Ruta y Botón de Navegación */}
                        <div className="flex items-center justify-between mt-1 mb-1 px-1">
                            <div className="flex items-center gap-5">
                                <div className="flex flex-col">
                                    <span className="text-[22px] font-black leading-none text-foreground tracking-tight">{steps.length}</span>
                                    <span className="text-[11px] font-black text-muted-foreground/80 uppercase tracking-[0.18em] mt-1">Paradas</span>
                                </div>
                                <div className="w-px h-6 bg-border/60"></div>
                                <div className="flex flex-col">
                                    <span className="text-[22px] font-black leading-none text-foreground tracking-tight">{distanceText.replace(/[^\d.,]/g, '') || "0"}</span>
                                    <span className="text-[11px] font-black text-muted-foreground/80 uppercase tracking-[0.18em] mt-1">KM</span>
                                </div>
                                <div className="w-px h-6 bg-border/60"></div>
                                <div className="flex flex-col">
                                    <span className="text-[22px] font-black leading-none text-foreground tracking-tight">{durationText.replace(/[^\d.,]/g, '') || "0"}</span>
                                    <span className="text-[11px] font-black text-muted-foreground/80 uppercase tracking-[0.18em] mt-1">MIN</span>
                                </div>
                            </div>
                            
                            {steps.length > 0 && currentLocation && (
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={openGoogleMapsNavigation}
                                    className="h-10 px-4 border-border/50 text-[12px] text-foreground font-black uppercase tracking-wider hover:bg-muted active:scale-[0.98] flex items-center gap-2 rounded-xl shadow-sm bg-card transition-all"
                                >
                                    <Navigation className="h-4 w-4" />
                                    Navegar
                                </Button>
                            )}
                        </div>

                        {/* Mapa de Ruta */}
                        <div className="w-full h-[260px] xs:h-[300px] rounded-2xl overflow-hidden border border-border/40 shadow-sm relative shrink-0">
                        <Map
                            className="w-full h-full"
                            center={currentLocation ? { lat: currentLocation.latitude, lng: currentLocation.longitude } : undefined}
                            zoom={13}
                            onLoad={setMapInstance}
                            options={{ disableDefaultUI: true, zoomControl: false, fullscreenControl: false }}
                        >
                            {/* Custom Fit Bounds Button */}
                            <Button
                                variant="secondary"
                                size="icon"
                                onClick={handleFitBounds}
                                className="absolute bottom-3 right-3 z-10 h-9 w-9 rounded-full shadow-md bg-background/80 backdrop-blur hover:bg-background"
                            >
                                <Focus className="h-4 w-4" />
                            </Button>

                            {/* Marcador de Ubicación Actual */}
                            {currentLocation && (
                                <AdvancedMarker
                                    position={{ lat: currentLocation.latitude, lng: currentLocation.longitude }}
                                    title="Mi ubicación"
                                    color={resolvedTheme === 'dark' ? '#141414' : '#ffffff'}
                                    glyphColor={resolvedTheme === 'dark' ? '#ffffff' : '#141414'}
                                    borderColor={resolvedTheme === 'dark' ? '#ffffff' : '#141414'}
                                    label="Yo"
                                />
                            )}

                            {/* Marcadores de la Secuencia Optimizada */}
                            {steps.map((step) => (
                                <AdvancedMarker
                                    key={`${step.serviceUuid}-${step.action}`}
                                    position={{ lat: step.latitude, lng: step.longitude }}
                                    title={`${step.order}. ${step.action === 'PICKUP' ? 'Recogida' : 'Entrega'} en ${step.dealershipName}`}
                                    color={step.action === 'PICKUP' ? pickupColor : deliveryColor}
                                    label={String(step.order)}
                                />
                            ))}

                            {/* Polilínea de la ruta física */}
                            {polyline && <RoutePolyline encodedPath={polyline} />}
                        </Map>
                    </div>
                    </div>

                    {/* Secuencia del recorrido (Timeline Minimalista) - Contenedor con scroll propio */}
                    <div className="flex-1 overflow-y-auto overscroll-none pb-6">
                        <div className="flex flex-col gap-3 pb-4 px-3 pt-2">
                            <p className="text-[11px] font-black uppercase text-muted-foreground/80 tracking-[0.18em] px-1 mt-1">
                                Secuencia del recorrido
                            </p>

                        {steps.filter(s => s.action === "PICKUP").length > 0 && (
                            <div className="flex flex-col gap-3 mb-2">
                                <div className="flex items-center gap-3 px-1">
                                    <div className="relative flex items-center justify-center w-6 h-6 rounded-full overflow-hidden">
                                        <div className="absolute inset-0 opacity-20" style={{ backgroundColor: pickupColor }} />
                                        <MapPin className="relative z-10 w-3.5 h-3.5" style={{ color: pickupColor }} />
                                    </div>
                                    <span className="text-[12px] font-black uppercase tracking-[0.15em]" style={{ color: pickupColor }}>
                                        Recogidas
                                    </span>
                                    <div className="flex-1 h-px border-t border-dashed border-muted-foreground/20"></div>
                                </div>
                                <div className="relative pl-6 border-l-2 border-dashed border-muted-foreground/30 ml-3 space-y-4">
                                    {steps.filter(s => s.action === "PICKUP").map((step) => {
                                        const plateNum = getServicePlate(step.serviceUuid)
                                        return (
                                            <div 
                                                key={`${step.serviceUuid}-${step.action}`}
                                                onClick={() => handlePanTo(step.latitude, step.longitude)}
                                                className="relative cursor-pointer group active:scale-[0.98] transition-all duration-200 flex items-center justify-between p-3.5 bg-card border border-border/40 rounded-xl shadow-sm hover:bg-muted/15"
                                            >
                                                <span 
                                                    className="absolute -left-[35px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-white text-[11px] font-black shadow-sm transition-transform duration-200 group-hover:scale-110 z-10"
                                                    style={{ backgroundColor: pickupColor }}
                                                >
                                                    {step.order}
                                                </span>
                                                <div className="min-w-0 flex-1 pr-3 flex flex-col gap-1.5">
                                                    <span className="text-[15px] text-muted-foreground group-hover:text-foreground transition-colors truncate font-extrabold tracking-tight">
                                                        {step.dealershipName}
                                                    </span>
                                                    {plateNum !== "---" && (
                                                        <div className="flex">
                                                            <PlacaBadge plateNumber={plateNum} size="md" className="origin-left shadow-none scale-90 -my-1" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-muted/40 group-hover:bg-primary/10 transition-all duration-200">
                                                    <MapPin className="h-4 w-4 group-hover:text-primary transition-colors" style={{ color: pickupColor }} />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {steps.filter(s => s.action !== "PICKUP").length > 0 && (
                            <div className="flex flex-col gap-3 mt-2">
                                <div className="flex items-center gap-3 px-1">
                                    <div className="relative flex items-center justify-center w-6 h-6 rounded-full overflow-hidden">
                                        <div className="absolute inset-0 opacity-20" style={{ backgroundColor: deliveryColor }} />
                                        <Flag className="relative z-10 w-3.5 h-3.5" style={{ color: deliveryColor }} />
                                    </div>
                                    <span className="text-[12px] font-black uppercase tracking-[0.15em]" style={{ color: deliveryColor }}>
                                        Entregas
                                    </span>
                                    <div className="flex-1 h-px border-t border-dashed border-muted-foreground/20"></div>
                                </div>
                                <div className="relative pl-6 border-l-2 border-dashed border-muted-foreground/30 ml-3 space-y-4">
                                    {steps.filter(s => s.action !== "PICKUP").map((step) => {
                                        const plateNum = getServicePlate(step.serviceUuid)
                                        return (
                                            <div 
                                                key={`${step.serviceUuid}-${step.action}`}
                                                onClick={() => handlePanTo(step.latitude, step.longitude)}
                                                className="relative cursor-pointer group active:scale-[0.98] transition-all duration-200 flex items-center justify-between p-3.5 bg-card border border-border/40 rounded-xl shadow-sm hover:bg-muted/15"
                                            >
                                                <span 
                                                    className="absolute -left-[35px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-white text-[11px] font-black shadow-sm transition-transform duration-200 group-hover:scale-110 z-10"
                                                    style={{ backgroundColor: deliveryColor }}
                                                >
                                                    {step.order}
                                                </span>
                                                <div className="min-w-0 flex-1 pr-3 flex flex-col gap-1.5">
                                                    <span className="text-[15px] text-muted-foreground group-hover:text-foreground transition-colors truncate font-extrabold tracking-tight">
                                                        {step.dealershipName}
                                                    </span>
                                                    {plateNum !== "---" && (
                                                        <div className="flex">
                                                            <PlacaBadge plateNumber={plateNum} size="md" className="origin-left shadow-none scale-90 -my-1" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-muted/40 group-hover:bg-primary/10 transition-all duration-200">
                                                    <Flag className="h-4 w-4 group-hover:text-primary transition-colors" style={{ color: deliveryColor }} />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                </>
            )}
        </div>
    )
}
