import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useGoogleMap, Marker } from "@react-google-maps/api"
import { Map } from "@/features/location/components/Map"
import { locationService } from "@/features/location/services/location.service"
import { useSmartLocation } from "@/features/tracking/hooks/use-smart-location"
import { useMessengerServices } from "@/features/delivery/hooks/use-messenger-services"
import { DEFAULT_STATUS_COLORS } from "@/shared/lib/status-colors"
import { Button } from "@/shared/components/ui/button"
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

interface AggregatedRouteStep {
    dealershipId: number
    dealershipName: string
    latitude: number
    longitude: number
    action: 'PICKUP' | 'DELIVERY'
    order: number
    serviceUuids: string[]
}

/**
 * Vista para mostrar la ruta de entregas optimizada del mensajero.
 * Integrada nativamente en el layout de mensajero para usar el header global.
 */
export default function OptimizedRoutePage() {
    const navigate = useNavigate()
    const { getCurrentLocation, loading: loadingLocation } = useSmartLocation()
    const { pendingServices, loading: loadingServices } = useMessengerServices()

    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)
    const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null)
    const [steps, setSteps] = useState<AggregatedRouteStep[]>([])
    const [polyline, setPolyline] = useState<string | null>(null)
    const [distanceText, setDistanceText] = useState<string>("")
    const [durationText, setDurationText] = useState<string>("")

    const [loadingRoute, setLoadingRoute] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const pickupColor = DEFAULT_STATUS_COLORS.ASSIGNED || '#00eeffe1'
    const deliveryColor = '#9ca3af'

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

                const aggregatedSteps: AggregatedRouteStep[] = [];

                (result.steps || []).forEach(step => {
                    const last = aggregatedSteps[aggregatedSteps.length - 1];
                    if (last && last.dealershipId === step.dealershipId && last.action === step.action) {
                        last.serviceUuids.push(step.serviceUuid);
                    } else {
                        aggregatedSteps.push({
                            dealershipId: step.dealershipId,
                            dealershipName: step.dealershipName,
                            latitude: step.latitude,
                            longitude: step.longitude,
                            action: step.action as 'PICKUP' | 'DELIVERY',
                            order: step.order,
                            serviceUuids: [step.serviceUuid]
                        });
                    }
                });

                setSteps(aggregatedSteps)
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

        const uniqueLocations: { latitude: number, longitude: number }[] = [];
        steps.forEach(step => {
            if (uniqueLocations.length === 0) {
                uniqueLocations.push({ latitude: step.latitude, longitude: step.longitude });
            } else {
                const lastLoc = uniqueLocations[uniqueLocations.length - 1];
                if (lastLoc.latitude !== step.latitude || lastLoc.longitude !== step.longitude) {
                    uniqueLocations.push({ latitude: step.latitude, longitude: step.longitude });
                }
            }
        });

        const destStep = uniqueLocations[uniqueLocations.length - 1]
        const destination = `${destStep.latitude},${destStep.longitude}`

        const waypointSteps = uniqueLocations.slice(0, uniqueLocations.length - 1)
        const waypoints = waypointSteps.map(s => `${s.latitude},${s.longitude}`).join('%7C')

        let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving&dir_action=navigate`
        if (waypoints) {
            url += `&waypoints=${waypoints}`
        }

        window.location.href = url;
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
                        <div className="flex items-center justify-between gap-3 mt-1 mb-1 px-1 w-full">
                            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 text-[13px] font-black uppercase tracking-wider leading-none text-foreground flex-wrap">
                                    <span>{new Set(steps.map(s => s.order)).size} Paradas</span>
                                    <span className="text-muted-foreground/60 shrink-0">•</span>
                                    <span className="normal-case">{distanceText}</span>
                                </div>
                                <div className="text-[12px] font-bold text-muted-foreground truncate leading-none">
                                    {durationText}
                                </div>
                            </div>
                            
                            {steps.length > 0 && currentLocation && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={openGoogleMapsNavigation}
                                    className="shrink-0 h-11 px-5 border-border/50 text-[13px] text-foreground font-black uppercase tracking-wider hover:bg-muted active:scale-[0.98] flex items-center justify-center gap-2 rounded-xl shadow-sm bg-card transition-all"
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
                                    <Marker
                                        position={{ lat: currentLocation.latitude, lng: currentLocation.longitude }}
                                        title="Mi ubicación"
                                        label="Yo"
                                    />
                                )}

                                {/* Marcadores de la Secuencia Optimizada */}
                                {steps.map((step) => (
                                    <Marker
                                        key={`${step.order}-${step.action}`}
                                        position={{ lat: step.latitude, lng: step.longitude }}
                                        title={`${step.action === 'PICKUP' ? 'Recogida' : 'Entrega'} en ${step.dealershipName}`}
                                    />
                                ))}

                                {/* Polilínea de la ruta física */}
                                {polyline && <RoutePolyline encodedPath={polyline} />}
                            </Map>
                        </div>
                    </div>

                    {/* Secuencia del recorrido (Timeline Minimalista) - Contenedor con scroll propio */}
                    <div className="flex-1 overflow-y-auto overscroll-none">
                        <div className="flex flex-col gap-3 px-3 pt-2">
                            <p className="text-[11px] font-black uppercase text-muted-foreground/80 tracking-[0.18em] px-1 mt-1">
                                Secuencia del recorrido
                            </p>

                            {steps.filter(s => s.action === "PICKUP").length > 0 && (
                                <div className="flex flex-col gap-3 mb-2">
                                    <div className="flex items-center gap-3 px-1">
                                        <div className="flex-1 h-px border-t border-dashed border-muted-foreground/20"></div>
                                        <span className="inline-flex items-center justify-center text-[11px] font-black uppercase tracking-[0.18em] text-foreground leading-none">
                                            Recogidas
                                        </span>
                                        <div className="flex-1 h-px border-t border-dashed border-muted-foreground/20"></div>
                                    </div>
                                    <div className="space-y-4 mt-2 px-2">
                                        {steps.filter(s => s.action === "PICKUP").map((step) => {
                                            return (
                                                <div
                                                    key={`${step.order}-${step.action}`}
                                                    onClick={() => handlePanTo(step.latitude, step.longitude)}
                                                    className="relative cursor-pointer group active:scale-[0.98] transition-all duration-200 flex items-center justify-between p-3 bg-card border border-border/30 rounded-xl hover:bg-muted/10"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                                        <div
                                                            className="w-1 h-8 rounded-full shrink-0"
                                                            style={{ backgroundColor: pickupColor }}
                                                        />
                                                        <div className="min-w-0 flex-1">
                                                            <div className="text-[14px] font-bold text-foreground truncate">
                                                                {step.dealershipName}
                                                            </div>
                                                            <div className="text-[13px] text-muted-foreground mt-0.5">
                                                                Recoger: <span className="font-extrabold text-foreground">{step.serviceUuids.length} moto{step.serviceUuids.length !== 1 ? 's' : ''}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0 pr-1">
                                                        <MapPin className="h-4 w-4" style={{ color: pickupColor }} />
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
                                        <div className="flex-1 h-px border-t border-dashed border-muted-foreground/20"></div>
                                        <span className="inline-flex items-center justify-center text-[11px] font-black uppercase tracking-[0.18em] text-foreground leading-none">
                                            Entregas
                                        </span>
                                        <div className="flex-1 h-px border-t border-dashed border-muted-foreground/20"></div>
                                    </div>
                                    <div className="space-y-4 mt-2 px-2">
                                        {steps.filter(s => s.action !== "PICKUP").map((step) => {
                                            return (
                                                <div
                                                    key={`${step.order}-${step.action}`}
                                                    onClick={() => handlePanTo(step.latitude, step.longitude)}
                                                    className="relative cursor-pointer group active:scale-[0.98] transition-all duration-200 flex items-center justify-between p-3 bg-card border border-border/30 rounded-xl hover:bg-muted/10"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                                        <div
                                                            className="w-1 h-8 rounded-full shrink-0"
                                                            style={{ backgroundColor: deliveryColor }}
                                                        />
                                                        <div className="min-w-0 flex-1">
                                                            <div className="text-[14px] font-bold text-foreground truncate">
                                                                {step.dealershipName}
                                                            </div>
                                                            <div className="text-[13px] text-muted-foreground mt-0.5">
                                                                Entregar: <span className="font-extrabold text-foreground">{step.serviceUuids.length} moto{step.serviceUuids.length !== 1 ? 's' : ''}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0 pr-1">
                                                        <Flag className="h-4 w-4" style={{ color: deliveryColor }} />
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
