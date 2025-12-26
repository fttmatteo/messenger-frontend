import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Map as MapComponent } from "@/components/Map"
import { useGoogleMap, Polyline } from "@react-google-maps/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb"
import {
    ArrowLeft,
    MapPin,
    Navigation,
    Clock,
    CalendarIcon,
    Route,
    User,
    Phone,
    Loader2
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { trackingApiService } from "@/services/tracking-api.service"
import { employeeService } from "@/services/employee.service"
import type { Employee } from "@/types/employee.types"


interface TrackingHistoryItem {
    id?: number
    latitude: number
    longitude: number
    timestamp: string
    speed?: number
}

// Marker component
function MessengerMarker({ position, color = '#10b981' }: { position: google.maps.LatLngLiteral, color?: string }) {
    const map = useGoogleMap()
    const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null)

    useEffect(() => {
        if (!map || !window.google?.maps?.marker) return

        const marker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position,
            title: "Ubicación actual",
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
    }, [map, position, color])

    return null
}

export default function MessengerDetails() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const messengerId = Number(id)

    // State
    const [employee, setEmployee] = useState<Employee | null>(null)
    const [loading, setLoading] = useState(true)
    const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number } | null>(null)
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
    const [speed, setSpeed] = useState<number | null>(null)
    const [isActive, setIsActive] = useState(false)

    // History state
    const [historyDate, setHistoryDate] = useState<Date>(new Date())
    const [historyData, setHistoryData] = useState<TrackingHistoryItem[]>([])
    const [loadingHistory, setLoadingHistory] = useState(false)
    const [showHistoryRoute, setShowHistoryRoute] = useState(false)
    const [calendarOpen, setCalendarOpen] = useState(false)

    // Fetch employee and tracking data
    const fetchData = useCallback(async () => {
        if (!messengerId) return

        try {
            setLoading(true)

            // Get employee info
            const emp = await employeeService.getById(messengerId)
            setEmployee(emp)

            // Get active tracking if exists
            const activeMessengers = await trackingApiService.getActiveMessengers()
            const activeData = activeMessengers.find(m => m.messengerId === messengerId)

            if (activeData) {
                setCurrentLocation({ lat: activeData.latitude, lng: activeData.longitude })
                setLastUpdate(activeData.lastUpdate ? new Date(activeData.lastUpdate) : null)
                setSpeed(activeData.speed || null)
                setIsActive(activeData.status === 'ACTIVE')
            } else {
                // Try to get last known location
                const lastLocation = await trackingApiService.getLastLocation(messengerId)
                if (lastLocation) {
                    setCurrentLocation({ lat: lastLocation.latitude, lng: lastLocation.longitude })
                    setLastUpdate(lastLocation.lastUpdate ? new Date(lastLocation.lastUpdate) : null)
                }
                setIsActive(false)
            }
        } catch (error) {
            console.error("Error fetching messenger data:", error)
        } finally {
            setLoading(false)
        }
    }, [messengerId])

    // Fetch history data
    const fetchHistory = useCallback(async () => {
        if (!messengerId) return

        try {
            setLoadingHistory(true)
            const data = await trackingApiService.getHistory(messengerId, format(historyDate, 'yyyy-MM-dd'))
            setHistoryData(data)
            setShowHistoryRoute(data.length > 0)
        } catch (error) {
            console.error("Error fetching history:", error)
            setHistoryData([])
        } finally {
            setLoadingHistory(false)
        }
    }, [messengerId, historyDate])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    useEffect(() => {
        fetchHistory()
    }, [fetchHistory])

    // History path for polyline
    const historyPath = historyData
        .filter(h => h.latitude && h.longitude)
        .map(h => ({ lat: h.latitude, lng: h.longitude }))

    const mapCenter = currentLocation || { lat: 6.2442, lng: -75.5812 } // Medellín default

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <Skeleton className="h-64 lg:col-span-1" />
                    <Skeleton className="h-64 lg:col-span-2" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <AdminBreadcrumb
                segments={[
                    { label: "Mapa", href: "/admin/tracking" },
                    { label: employee?.fullName || `Mensajero #${messengerId}` }
                ]}
            />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/admin/tracking")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{employee?.fullName || `Mensajero #${messengerId}`}</h1>
                        <p className="text-muted-foreground text-sm">{employee?.document}</p>
                    </div>
                </div>
                <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-500" : ""}>
                    {isActive ? "Activo" : "Inactivo"}
                </Badge>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Column - Info + History */}
                <div className="space-y-4">
                    {/* Current Status Card */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Información
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {employee?.phone && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <a href={`tel:${employee.phone}`} className="hover:underline">{employee.phone}</a>
                                </div>
                            )}
                            {speed !== null && speed > 0 && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Navigation className="h-4 w-4 text-muted-foreground" />
                                    <span>{(speed * 3.6).toFixed(1)} km/h</span>
                                </div>
                            )}
                            {lastUpdate && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>{formatDistanceToNow(lastUpdate, { addSuffix: true, locale: es })}</span>
                                </div>
                            )}
                            {currentLocation && (
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-mono text-xs">
                                        {currentLocation.lat.toFixed(5)}, {currentLocation.lng.toFixed(5)}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* History Card */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Route className="h-4 w-4" />
                                Historial de recorrido
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {/* Date Picker */}
                            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {format(historyDate, "PPP", { locale: es })}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={historyDate}
                                        onSelect={(date) => {
                                            if (date) {
                                                setHistoryDate(date)
                                                setCalendarOpen(false)
                                            }
                                        }}
                                        locale={es}
                                        disabled={(date) => date > new Date()}
                                    />
                                </PopoverContent>
                            </Popover>

                            {/* Toggle Route */}
                            {historyPath.length > 0 && (
                                <Button
                                    variant={showHistoryRoute ? "default" : "outline"}
                                    size="sm"
                                    className="w-full"
                                    onClick={() => setShowHistoryRoute(!showHistoryRoute)}
                                >
                                    <Route className="h-4 w-4 mr-2" />
                                    {showHistoryRoute ? "Ocultar ruta" : "Mostrar ruta"}
                                </Button>
                            )}

                            {/* History List */}
                            {loadingHistory ? (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : historyData.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    Sin registros para esta fecha
                                </p>
                            ) : (
                                <ScrollArea className="h-64">
                                    <div className="space-y-2 pr-4">
                                        {historyData.map((item, i) => (
                                            <div key={item.id || i} className="p-2 rounded-lg bg-muted/50 text-sm">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium">
                                                        {format(new Date(item.timestamp), "HH:mm:ss")}
                                                    </span>
                                                    {item.speed !== undefined && item.speed > 0 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {(item.speed * 3.6).toFixed(1)} km/h
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1 font-mono">
                                                    {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
                                                </p>
                                            </div>
                                        ))}
                                        <div className="pt-2 border-t text-sm text-muted-foreground text-center">
                                            {historyData.length} puntos registrados
                                        </div>
                                    </div>
                                </ScrollArea>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Map */}
                <Card className="lg:col-span-2 overflow-hidden">
                    <CardContent className="p-0 h-[500px]">
                        <MapComponent className="w-full h-full" center={mapCenter} zoom={15}>
                            {currentLocation && (
                                <MessengerMarker
                                    position={currentLocation}
                                    color={isActive ? '#10b981' : '#6b7280'}
                                />
                            )}

                            {showHistoryRoute && historyPath.length > 1 && (
                                <Polyline
                                    path={historyPath}
                                    options={{
                                        strokeColor: '#4f46e5',
                                        strokeOpacity: 0.8,
                                        strokeWeight: 4,
                                    }}
                                />
                            )}
                        </MapComponent>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
