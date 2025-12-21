import { useEffect, useState, useCallback, useRef } from "react"
import { Map } from "@/components/Map"
import { InfoWindow, useGoogleMap, Polyline } from "@react-google-maps/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { trackingApiService } from "@/services/tracking-api.service"
import { trackingService, type LiveTrackingUpdate } from "@/services/tracking.service"
import type { TrackingHistoryItem } from "@/types/location.types"
import { RefreshCw, Users, Wifi, WifiOff, CalendarIcon, Clock, MapPin, Navigation, History, PanelRightOpen } from "lucide-react"
import { toast } from "sonner"
import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

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

/**
 * Formats a full name to show first name and initial of last name
 */
function formatDisplayName(fullName: string): string {
    const parts = fullName.trim().split(/\s+/)
    if (parts.length === 1) return parts[0]
    const firstName = parts[0]
    const lastName = parts[parts.length - 1]
    return `${firstName} ${lastName.charAt(0).toUpperCase()}.`
}

export default function LiveTracking() {
    const [messengers, setMessengers] = useState<LiveTrackingUpdate[]>([])
    const [selectedMessenger, setSelectedMessenger] = useState<LiveTrackingUpdate | null>(null)
    const [loading, setLoading] = useState(true)
    const [connected, setConnected] = useState(false)
    const [mapCenter, setMapCenter] = useState({ lat: 6.2442, lng: -75.5812 }) // Medellín
    const [sheetOpen, setSheetOpen] = useState(false)

    // History state
    const [historyDate, setHistoryDate] = useState<Date>(new Date())
    const [historyData, setHistoryData] = useState<TrackingHistoryItem[]>([])
    const [loadingHistory, setLoadingHistory] = useState(false)
    const [showHistoryRoute, setShowHistoryRoute] = useState(false)

    // Fetch initial data via REST
    const fetchActiveMessengers = useCallback(async (manual = false) => {
        try {
            setLoading(true)
            const data = await trackingApiService.getActiveMessengers()
            const updatedMessengers = data || []
            setMessengers(updatedMessengers)

            if (selectedMessenger) {
                const refreshed = updatedMessengers.find(m => m.messengerId === selectedMessenger.messengerId)
                if (refreshed) {
                    setSelectedMessenger(refreshed)
                }
            }

            if (manual) {
                toast.success("Monitoreo actualizado", {
                    description: `${updatedMessengers.length} mensajeros activos`,
                    id: "manual-refresh-success"
                })
            }

            if (!manual && updatedMessengers.length > 0 && updatedMessengers[0].latitude && updatedMessengers[0].longitude) {
                setMapCenter({ lat: updatedMessengers[0].latitude, lng: updatedMessengers[0].longitude })
            }
        } catch (error: any) {
            console.error("Error fetching messengers:", error)
            const status = error.response?.status
            if (status !== 404) {
                toast.error("Error al cargar mensajeros", {
                    description: error.response?.data?.message || error.message,
                    id: "error-cargar-mensajeros"
                })
            }
            setMessengers([])
        } finally {
            setLoading(false)
        }
    }, [selectedMessenger])

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
        if (update.status === 'OFFLINE') {
            setMessengers(prev => prev.filter(m => m.messengerId !== update.messengerId))
            setSelectedMessenger(prev => prev?.messengerId === update.messengerId ? null : prev)
            return
        }

        setMessengers(prev => {
            const existing = prev.findIndex(m => m.messengerId === update.messengerId)
            if (existing >= 0) {
                const updated = [...prev]
                updated[existing] = update
                return updated
            }
            return [...prev, update]
        })

        setSelectedMessenger(prev => prev?.messengerId === update.messengerId ? update : prev)
    }, [])

    // Connect to WebSocket on mount
    useEffect(() => {
        fetchActiveMessengers()

        trackingService.connect(() => {
            setConnected(true)
            trackingService.subscribeToAll(handleTrackingUpdate)
        })

        return () => {
            trackingService.disconnect()
            setConnected(false)
        }
    }, [fetchActiveMessengers, handleTrackingUpdate])

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
        setMapCenter({ lat: messenger.latitude, lng: messenger.longitude })
        setSheetOpen(true)
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
            {/* Header */}
            <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight">Monitoreo en Vivo</h1>
                    <Badge className={`gap-1 min-w-[110px] h-7 justify-center border-transparent shadow-sm ${connected ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-500 text-white hover:bg-red-600'}`}>
                        {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                        {connected ? "Conectado" : "Desconectado"}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className={`gap-1 min-w-[110px] h-7 justify-center border-transparent shadow-sm ${messengers.length > 0 ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-500 text-white hover:bg-red-600'}`}>
                        <Users className="h-3 w-3" />
                        {messengers.length} Activos
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => fetchActiveMessengers(true)} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex gap-4">
                {/* Messenger List (Desktop) */}
                <Card className="hidden lg:flex lg:flex-col w-72 shrink-0">
                    <CardHeader className="py-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Mensajeros
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1">
                        <ScrollArea className="h-full">
                            {loading && messengers.length === 0 ? (
                                <div className="space-y-2 p-4">
                                    {[1, 2, 3].map(i => (
                                        <Skeleton key={i} className="h-16 w-full" />
                                    ))}
                                </div>
                            ) : messengers.length === 0 ? (
                                <div className="p-4 text-center text-muted-foreground text-sm">
                                    No hay mensajeros activos
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
                            <Map className="w-full h-full rounded-md" center={mapCenter} zoom={13}>
                                {messengers.map((messenger) => (
                                    messenger.latitude && messenger.longitude && (
                                        <AdvancedMarker
                                            key={messenger.messengerId}
                                            position={{ lat: messenger.latitude, lng: messenger.longitude }}
                                            onClick={() => selectMessenger(messenger)}
                                            title={messenger.messengerName || `Mensajero #${messenger.messengerId}`}
                                            color={selectedMessenger?.messengerId === messenger.messengerId ? '#10b981' : '#4f46e5'}
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
                            </Map>
                        )}

                        {/* Mobile FAB to open messenger list */}
                        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="default"
                                    size="icon"
                                    className="lg:hidden absolute bottom-4 right-4 h-12 w-12 rounded-full shadow-lg"
                                >
                                    <PanelRightOpen className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-80 p-0">
                                <SheetHeader className="p-4 border-b">
                                    <SheetTitle>
                                        {selectedMessenger
                                            ? (selectedMessenger.messengerName ? formatDisplayName(selectedMessenger.messengerName) : `Mensajero #${selectedMessenger.messengerId}`)
                                            : "Mensajeros"
                                        }
                                    </SheetTitle>
                                </SheetHeader>

                                {selectedMessenger ? (
                                    <Tabs defaultValue="info" className="h-full">
                                        <TabsList className="w-full rounded-none">
                                            <TabsTrigger value="info" className="flex-1">
                                                <MapPin className="h-4 w-4 mr-2" />
                                                Info
                                            </TabsTrigger>
                                            <TabsTrigger value="history" className="flex-1">
                                                <History className="h-4 w-4 mr-2" />
                                                Historial
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="info" className="p-4 space-y-4 m-0">
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
                                        </TabsContent>

                                        <TabsContent value="history" className="p-4 space-y-4 m-0">
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

                                            {/* History list */}
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
                                                <ScrollArea className="h-[300px]">
                                                    <div className="space-y-2">
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

                                            {historyData.length > 0 && (
                                                <div className="pt-2 border-t text-sm text-muted-foreground">
                                                    <p>{historyData.length} puntos registrados</p>
                                                </div>
                                            )}
                                        </TabsContent>
                                    </Tabs>
                                ) : (
                                    <ScrollArea className="h-full">
                                        {messengers.length === 0 ? (
                                            <div className="p-4 text-center text-muted-foreground text-sm">
                                                No hay mensajeros activos
                                            </div>
                                        ) : (
                                            <div className="divide-y">
                                                {messengers.map((messenger) => (
                                                    <button
                                                        key={messenger.messengerId}
                                                        className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
                                                        onClick={() => {
                                                            setSelectedMessenger(messenger)
                                                            setMapCenter({ lat: messenger.latitude, lng: messenger.longitude })
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
                                )}
                            </SheetContent>
                        </Sheet>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
