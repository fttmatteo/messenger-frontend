import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Map as MapComponent } from "@/components/Map"
import { useGoogleMap, Polyline } from "@react-google-maps/api"
import { useTheme } from "next-themes"
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
    const { resolvedTheme } = useTheme()
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
        if (!messengerId || isNaN(messengerId)) {
            setLoading(false)
            return
        }

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
                const date = activeData.lastUpdate ? new Date(activeData.lastUpdate) : null
                setLastUpdate(date && isFinite(date.getTime()) ? date : null)
                setSpeed(activeData.speed || null)
                setIsActive(activeData.status === 'ACTIVE')
            } else {
                // Try to get last known location
                try {
                    const lastLocation = await trackingApiService.getLastLocation(messengerId)
                    if (lastLocation) {
                        setCurrentLocation({ lat: lastLocation.latitude, lng: lastLocation.longitude })
                        const date = lastLocation.lastUpdate ? new Date(lastLocation.lastUpdate) : null
                        setLastUpdate(date && isFinite(date.getTime()) ? date : null)
                    }
                } catch (e) {
                    console.debug("No previous location found for messenger", messengerId)
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
        if (!messengerId || isNaN(messengerId)) return

        try {
            setLoadingHistory(true)
            const dateStr = format(historyDate, 'yyyy-MM-dd')
            const data = await trackingApiService.getHistory(messengerId, dateStr)

            if (Array.isArray(data)) {
                setHistoryData(data)
                setShowHistoryRoute(data.length > 0)
            } else {
                setHistoryData([])
                setShowHistoryRoute(false)
            }
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

    // Helper for safe date formatting
    const safeFormat = (dateInput: string | Date | undefined, formatStr: string) => {
        if (!dateInput) return ""
        const date = new Date(dateInput)
        if (!isFinite(date.getTime())) return "Fecha inválida"
        return format(date, formatStr, { locale: es })
    }

    // History path for polyline
    const historyPath = historyData
        .filter(h => h.latitude && h.longitude && h.latitude !== 0)
        .map(h => ({ lat: h.latitude, lng: h.longitude }))

    const mapCenter = currentLocation || { lat: 6.2442, lng: -75.5812 } // Medellín default

    if (loading) {
        return (
            <div className="space-y-4 p-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <Skeleton className="h-[400px] lg:col-span-1" />
                    <Skeleton className="h-[400px] lg:col-span-2" />
                </div>
            </div>
        )
    }

    if (!employee && !loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="p-4 rounded-full bg-muted">
                    <User className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-semibold">Mensajero no encontrado</h2>
                    <p className="text-muted-foreground">No pudimos cargar la información de este empleado.</p>
                </div>
                <Button onClick={() => navigate("/admin/tracking")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al monitoreo
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <AdminBreadcrumb
                segments={[
                    { label: "Monitoreo", href: "/admin/tracking" },
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
                <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-500 hover:bg-green-600" : ""}>
                    {isActive ? "Activo ahora" : "Desconectado"}
                </Badge>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Info + History */}
                <div className="space-y-6">
                    {/* Current Status Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <User className="h-4 w-4 text-primary" />
                                Información General
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {employee?.phone && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <a href={`tel:${employee.phone}`} className="hover:underline font-medium text-primary">
                                        {employee.phone}
                                    </a>
                                </div>
                            )}
                            {speed !== null && speed > 0 && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Navigation className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{(speed * 3.6).toFixed(1)} km/h</span>
                                </div>
                            )}
                            {lastUpdate && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                        Última señal: {formatDistanceToNow(lastUpdate, { addSuffix: true, locale: es })}
                                    </span>
                                </div>
                            )}
                            {currentLocation && (
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-mono text-[10px] bg-muted px-2 py-1 rounded select-all">
                                        {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* History Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Route className="h-4 w-4 text-primary" />
                                Historial del Día
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Date Picker */}
                            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal h-10 border-dashed">
                                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
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
                                    className="w-full h-9"
                                    onClick={() => setShowHistoryRoute(!showHistoryRoute)}
                                >
                                    <Route className="h-4 w-4 mr-2" />
                                    {showHistoryRoute ? "Ocultar ruta" : "Ver ruta en mapa"}
                                </Button>
                            )}

                            {/* History List */}
                            {loadingHistory ? (
                                <div className="flex items-center justify-center py-10">
                                    <Loader2 className="h-7 w-7 animate-spin text-primary/40" />
                                </div>
                            ) : historyData.length === 0 ? (
                                <div className="text-center py-10 border-2 border-dashed rounded-lg bg-muted/30">
                                    <p className="text-sm text-muted-foreground font-medium">
                                        Sin movimientos
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mt-1">
                                        {format(historyDate, "dd MMM yyyy", { locale: es })}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <ScrollArea className="h-72 rounded-lg border bg-muted/10">
                                        <div className="p-4 space-y-3">
                                            {historyData.slice().reverse().map((item, i) => (
                                                <div key={item.id || i} className="p-3 rounded-lg border bg-card text-xs shadow-sm hover:border-primary/30 transition-colors">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="font-bold text-primary">
                                                            {safeFormat(item.timestamp, "HH:mm:ss")}
                                                        </span>
                                                        {item.speed !== undefined && item.speed > 0 && (
                                                            <Badge variant="secondary" className="text-[10px] px-1.5 h-4.5 font-mono">
                                                                {(item.speed * 3.6).toFixed(0)} km/h
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-muted-foreground font-mono">
                                                        <MapPin className="h-3 w-3 opacity-70" />
                                                        <span>{item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                    <p className="text-[10px] text-center text-muted-foreground uppercase tracking-wider">
                                        {historyData.length} puntos registrados
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Map */}
                <Card className="lg:col-span-2 overflow-hidden border-2 shadow-inner">
                    <CardContent className="p-0 h-[600px] bg-muted/20 relative">
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
                                        strokeColor: resolvedTheme === 'dark' ? '#818cf8' : '#4f46e5',
                                        strokeOpacity: 0.8,
                                        strokeWeight: 4,
                                        icons: [{
                                            icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW },
                                            offset: '100%',
                                            repeat: '100px'
                                        }]
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
