import { useEffect, useState, useCallback, useRef } from "react"
import { Map as MapComponent } from "@/components/Map"
import { InfoWindow, useGoogleMap, Polyline } from "@react-google-maps/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { trackingApiService } from "@/services/tracking-api.service"
import { trackingService, type LiveTrackingUpdate } from "@/services/tracking.service"
import type { TrackingHistoryItem } from "@/types/location.types"
import { RefreshCw, Users, Wifi, WifiOff, CalendarIcon, Clock, MapPin, Navigation, History, PanelRightOpen } from "lucide-react"
import { useAdminUI } from "@/context/AdminUIContext"
import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { formatDisplayName } from "@/lib/format-utils"
import { employeeService } from "@/services/employee.service"

// Componente para manejar AdvancedMarkerElement
function AdvancedMarker({ position, onClick, title, color = '#4f46e5' }: { position: google.maps.LatLngLiteral, onClick?: () => void, title?: string, color?: string }) {
    const map = useGoogleMap()
    const markerRef = useRef<any>(null)

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

        marker.addListener('click', () => {
            if (onClick) onClick()
        })

        markerRef.current = marker

        return () => {
            if (markerRef.current) {
                markerRef.current.map = null
            }
        }
    }, [map, color])

    useEffect(() => {
        if (markerRef.current) {
            markerRef.current.position = position
        }
    }, [position])

    return null
}

export default function LiveTracking() {
    const [messengers, setMessengers] = useState<LiveTrackingUpdate[]>([])
    const [selectedMessenger, setSelectedMessenger] = useState<LiveTrackingUpdate | null>(null)
    const [loading, setLoading] = useState(true)
    const [connected, setConnected] = useState(false)
    const [mapCenter, setMapCenter] = useState({ lat: 6.2442, lng: -75.5812 }) // Medellín
    const [sheetOpen, setSheetOpen] = useState(false)
    const { setSuccess, setError } = useAdminUI()

    // History state
    const [historyDate, setHistoryDate] = useState<Date>(new Date())
    const [historyData, setHistoryData] = useState<TrackingHistoryItem[]>([])
    const [loadingHistory, setLoadingHistory] = useState(false)
    const [showHistoryRoute, setShowHistoryRoute] = useState(false)

    // Fetch initial data via REST (All messengers + status)
    const fetchMessengers = useCallback(async (manual = false) => {
        try {
            setLoading(true)

            // 1. Get all messengers
            const allEmployees = await employeeService.getAll()
            const messengerEmployees = allEmployees.filter(e => e.role === 'MESSENGER')

            // 2. Get active sessions
            const activeMessengers = await trackingApiService.getActiveMessengers()
            const activeMap = new Map(activeMessengers.map(m => [m.messengerId, m]))

            // 3. Merge data
            const combinedRequests = messengerEmployees.map(async (emp) => {
                // If active, use active data
                if (activeMap.has(emp.idEmployee)) {
                    return activeMap.get(emp.idEmployee)!
                }

                // If offline, try to get last location
                try {
                    const lastLoc = await trackingApiService.getLastLocation(emp.idEmployee)
                    if (lastLoc) {
                        return { ...lastLoc, status: 'OFFLINE' as const, messengerName: emp.fullName }
                    }
                } catch (e) {
                    // Ignore 404/error, just fallback
                }

                // Default offline structure without location
                return {
                    messengerId: emp.idEmployee,
                    messengerName: emp.fullName,
                    latitude: 0,
                    longitude: 0,
                    lastUpdate: new Date().toISOString(),
                    status: 'OFFLINE' as const,
                    speed: 0,
                    heading: 0
                }
            })

            const updatedMessengers = await Promise.all(combinedRequests)
            setMessengers(updatedMessengers)

            // Update selected messenger if exists in new data
            setSelectedMessenger(current => {
                if (!current) return null
                const refreshed = updatedMessengers.find(m => m.messengerId === current.messengerId)
                return refreshed || current
            })

            if (manual) {
                setSuccess(`Monitoreo actualizado`)
            }

            // Center map on first active messenger if available and no manual update
            const firstActive = updatedMessengers.find(m => m.status === 'ACTIVE' && m.latitude !== 0)
            if (!manual && firstActive) {
                setMapCenter({ lat: firstActive.latitude, lng: firstActive.longitude })
            }
        } catch (error: any) {
            console.error("Error fetching messengers:", error)
            const status = error.response?.status
            if (status !== 404) {
                setError(error.response?.data?.message || error.message || "Error al cargar mensajeros")
            }
        } finally {
            setLoading(false)
        }
    }, [setSuccess, setError])

    // Fetch history for selected messenger
    const fetchHistory = useCallback(async () => {
        if (!selectedMessenger) return

        try {
            setLoadingHistory(true)
            const dateStr = format(historyDate, 'yyyy-MM-dd')
            const data = await trackingApiService.getHistory(selectedMessenger.messengerId, dateStr)
            setHistoryData(data || [])
        } catch (error: any) {
            console.error("Error fetching history:", error)
            setHistoryData([])
        } finally {
            setLoadingHistory(false)
        }
    }, [selectedMessenger, historyDate])

    // Handle real-time updates
    const handleTrackingUpdate = useCallback((update: LiveTrackingUpdate) => {
        setMessengers(prev => {
            const existingIndex = prev.findIndex(m => m.messengerId === update.messengerId)

            if (existingIndex >= 0) {
                const updatedList = [...prev]
                // Preserve name if update doesn't have it (though update usually has it)
                const existing = prev[existingIndex]
                updatedList[existingIndex] = { ...existing, ...update, messengerName: update.messengerName || existing.messengerName }
                return updatedList
            }

            return [...prev, update]
        })

        setSelectedMessenger(prev => {
            if (prev?.messengerId === update.messengerId) {
                return { ...prev, ...update }
            }
            return prev
        })
    }, [])

    // Connect to WebSocket on mount
    useEffect(() => {
        fetchMessengers()

        trackingService.connect(() => {
            setConnected(true)
            trackingService.subscribeToAll(handleTrackingUpdate)
        })

        return () => {
            trackingService.disconnect()
            setConnected(false)
        }
    }, [fetchMessengers, handleTrackingUpdate])

    // Fetch history when messenger or date changes
    useEffect(() => {
        if (selectedMessenger && sheetOpen) {
            fetchHistory()
        }
    }, [selectedMessenger, historyDate, sheetOpen, fetchHistory])

    // Generate polyline path from history
    const historyPath = historyData
        .filter(h => h.latitude && h.longitude)
        .map(h => ({ lat: h.latitude, lng: h.longitude }))

    const selectMessenger = (messenger: LiveTrackingUpdate) => {
        setSelectedMessenger(messenger)
        if (messenger.latitude && messenger.longitude) {
            setMapCenter({ lat: messenger.latitude, lng: messenger.longitude })
        }
        setSheetOpen(true)
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col gap-4 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center flex-wrap gap-2 shrink-0">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight">Monitoreo en vivo</h1>
                    <Badge className={`gap-1 min-w-[110px] h-7 justify-center border-transparent shadow-sm ${connected ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-500 text-white hover:bg-red-600'}`}>
                        {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                        {connected ? "Conectado" : "Desconectado"}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => fetchMessengers(true)} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex gap-4 overflow-hidden">
                {/* Messenger List (Desktop) */}
                <Card className="hidden lg:flex lg:flex-col w-72 shrink-0 overflow-hidden">
                    <CardHeader className="py-3 shrink-0">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Mensajeros
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-hidden">
                        <ScrollArea className="h-full">
                            {loading && messengers.length === 0 ? (
                                <div className="space-y-2 p-4">
                                    {[1, 2, 3].map(i => (
                                        <Skeleton key={i} className="h-16 w-full" />
                                    ))}
                                </div>
                            ) : messengers.length === 0 ? (
                                <div className="p-4 text-center text-muted-foreground text-sm">
                                    No hay mensajeros disponibles
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {messengers.map((messenger) => (
                                        <button
                                            key={messenger.messengerId}
                                            className={cn(
                                                "w-full p-4 text-left hover:bg-muted/50 transition-colors",
                                                selectedMessenger?.messengerId === messenger.messengerId && "bg-muted"
                                            )}
                                            onClick={() => selectMessenger(messenger)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">
                                                    {messenger.messengerName ? formatDisplayName(messenger.messengerName) : `#${messenger.messengerId}`}
                                                </span>
                                                <Badge variant={messenger.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-xs">
                                                    {messenger.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </div>
                                            {messenger.speed !== undefined && messenger.speed > 0 && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    <Navigation className="h-3 w-3 inline mr-1" />
                                                    {(messenger.speed * 3.6).toFixed(1)} km/h
                                                </p>
                                            )}
                                            {messenger.lastUpdate && (
                                                <p className="text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3 inline mr-1" />
                                                    {formatDistanceToNow(new Date(messenger.lastUpdate), { addSuffix: true, locale: es })}
                                                </p>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Map Container */}
                <Card className="flex-1 overflow-hidden border p-1 bg-muted/20">
                    <CardContent className="p-0 h-full w-full relative">
                        {loading && messengers.length === 0 ? (
                            <Skeleton className="w-full h-full rounded-md" />
                        ) : (
                            <MapComponent className="w-full h-full rounded-md" center={mapCenter} zoom={13}>
                                {messengers.map((messenger) => (
                                    messenger.latitude && messenger.longitude && messenger.latitude !== 0 && (
                                        <AdvancedMarker
                                            key={messenger.messengerId}
                                            position={{ lat: messenger.latitude, lng: messenger.longitude }}
                                            onClick={() => selectMessenger(messenger)}
                                            title={messenger.messengerName || `Mensajero #${messenger.messengerId}`}
                                            color={messenger.status === 'ACTIVE' ? '#10b981' : '#6b7280'}
                                        />
                                    )
                                ))}

                                {/* History route polyline */}
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

                                {selectedMessenger && selectedMessenger.latitude && selectedMessenger.longitude && (
                                    <InfoWindow
                                        position={{ lat: selectedMessenger.latitude, lng: selectedMessenger.longitude }}
                                        onCloseClick={() => setSelectedMessenger(null)}
                                    >
                                        <div className="p-2 min-w-[150px]">
                                            <p className="font-semibold text-sm">
                                                {selectedMessenger.messengerName || `Mensajero #${selectedMessenger.messengerId}`}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                {selectedMessenger.status === 'ACTIVE' ? '🟢 Activo' : '🔴 Inactivo'}
                                            </p>
                                            {selectedMessenger.speed !== undefined && selectedMessenger.speed > 0 && (
                                                <p className="text-xs text-gray-600">
                                                    Velocidad: {(selectedMessenger.speed * 3.6).toFixed(1)} km/h
                                                </p>
                                            )}
                                            {selectedMessenger.lastUpdate && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Actualizado {formatDistanceToNow(new Date(selectedMessenger.lastUpdate), { addSuffix: true, locale: es })}
                                                </p>
                                            )}
                                        </div>
                                    </InfoWindow>
                                )}
                            </MapComponent>
                        )}

                        {/* Mobile FAB and Details Popup */}
                        <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="default"
                                    size="icon"
                                    className="lg:hidden absolute bottom-4 right-4 h-12 w-12 rounded-full shadow-lg"
                                >
                                    <PanelRightOpen className="h-5 w-5" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md p-0 flex flex-col max-h-[90vh] overflow-hidden">
                                <DialogHeader className="p-4 border-b shrink-0">
                                    <DialogTitle>
                                        {selectedMessenger
                                            ? (selectedMessenger.messengerName ? formatDisplayName(selectedMessenger.messengerName) : `Mensajero #${selectedMessenger.messengerId}`)
                                            : "Mensajeros"
                                        }
                                    </DialogTitle>
                                </DialogHeader>

                                {selectedMessenger ? (
                                    <Tabs defaultValue="info" className="flex-1 flex flex-col overflow-hidden">
                                        <TabsList className="w-full rounded-none shrink-0">
                                            <TabsTrigger value="info" className="flex-1">
                                                <MapPin className="h-4 w-4 mr-2" />
                                                Info
                                            </TabsTrigger>
                                            <TabsTrigger value="history" className="flex-1">
                                                <History className="h-4 w-4 mr-2" />
                                                Historial
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="info" className="flex-1 p-0 m-0 overflow-hidden">
                                            <ScrollArea className="h-full">
                                                <div className="p-4 space-y-4">
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-muted-foreground">Estado</span>
                                                            <Badge variant={selectedMessenger.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                                                {selectedMessenger.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                                                            </Badge>
                                                        </div>
                                                        {selectedMessenger.speed !== undefined && (
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-muted-foreground">Velocidad</span>
                                                                <span className="font-medium">{(selectedMessenger.speed * 3.6).toFixed(1)} km/h</span>
                                                            </div>
                                                        )}
                                                        {selectedMessenger.lastUpdate && (
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-muted-foreground">Última actualización</span>
                                                                <span className="text-sm">
                                                                    {formatDistanceToNow(new Date(selectedMessenger.lastUpdate), { addSuffix: true, locale: es })}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-muted-foreground">Coordenadas</span>
                                                            <span className="text-sm font-mono">
                                                                {selectedMessenger.latitude.toFixed(5)}, {selectedMessenger.longitude.toFixed(5)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full"
                                                        onClick={() => setSelectedMessenger(null)}
                                                    >
                                                        Ver todos los mensajeros
                                                    </Button>
                                                </div>
                                            </ScrollArea>
                                        </TabsContent>

                                        <TabsContent value="history" className="flex-1 flex flex-col p-0 m-0 overflow-hidden">
                                            <div className="p-4 space-y-4 shrink-0">
                                                {/* Date Picker */}
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Fecha</label>
                                                    <Popover>
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
                                                                onSelect={(date) => date && setHistoryDate(date)}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>

                                                {/* Show route toggle */}
                                                <Button
                                                    variant={showHistoryRoute ? "default" : "outline"}
                                                    className="w-full"
                                                    onClick={() => setShowHistoryRoute(!showHistoryRoute)}
                                                    disabled={historyPath.length < 2}
                                                >
                                                    <Navigation className="mr-2 h-4 w-4" />
                                                    {showHistoryRoute ? "Ocultar ruta" : "Mostrar ruta en mapa"}
                                                </Button>
                                            </div>

                                            {/* History list */}
                                            <div className="flex-1 overflow-hidden px-4 pb-4">
                                                {loadingHistory ? (
                                                    <div className="space-y-2">
                                                        {[1, 2, 3].map(i => (
                                                            <Skeleton key={i} className="h-12 w-full" />
                                                        ))}
                                                    </div>
                                                ) : historyData.length === 0 ? (
                                                    <p className="text-center text-muted-foreground text-sm py-4">
                                                        No hay historial para esta fecha
                                                    </p>
                                                ) : (
                                                    <ScrollArea className="h-full">
                                                        <div className="space-y-2 pr-3">
                                                            {historyData.map((item, idx) => (
                                                                <div
                                                                    key={item.id || idx}
                                                                    className="p-3 rounded-lg bg-muted/50 text-sm"
                                                                >
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
                                                        </div>
                                                    </ScrollArea>
                                                )}

                                                {historyData.length > 0 && !loadingHistory && (
                                                    <div className="pt-2 border-t text-sm text-muted-foreground mt-2 sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                                                        <p>{historyData.length} puntos registrados</p>
                                                    </div>
                                                )}
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                ) : (
                                    <div className="flex-1 overflow-hidden">
                                        <ScrollArea className="h-full">
                                            {messengers.length === 0 ? (
                                                <div className="p-4 text-center text-muted-foreground text-sm">
                                                    No hay mensajeros disponibles
                                                </div>
                                            ) : (
                                                <div className="divide-y">
                                                    {messengers.map((messenger) => (
                                                        <button
                                                            key={messenger.messengerId}
                                                            className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
                                                            onClick={() => {
                                                                setSelectedMessenger(messenger)
                                                                if (messenger.latitude && messenger.longitude) {
                                                                    setMapCenter({ lat: messenger.latitude, lng: messenger.longitude })
                                                                }
                                                            }}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-medium">
                                                                    {messenger.messengerName ? formatDisplayName(messenger.messengerName) : `#${messenger.messengerId}`}
                                                                </span>
                                                                <Badge variant={messenger.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-xs">
                                                                    {messenger.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                                                                </Badge>
                                                            </div>
                                                            {messenger.lastUpdate && (
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    {formatDistanceToNow(new Date(messenger.lastUpdate), { addSuffix: true, locale: es })}
                                                                </p>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </div>
                                )}
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
