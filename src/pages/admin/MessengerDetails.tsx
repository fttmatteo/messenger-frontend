import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Map as MapComponent } from "@/features/location/components/Map"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { AdminBreadcrumb } from "@/shared/components/ui/admin-breadcrumb"
import { MessengerMarker } from "@/features/tracking/components"
import { ArrowLeft, MapPin, User } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { format } from "date-fns"
import { trackingService, type LiveTrackingUpdate } from "@/features/tracking/services/tracking.service"
import { authService } from "@/features/auth/services/auth.service"
import { trackingApiService } from "@/features/tracking/services/tracking-api.service"
import { employeeService } from "@/features/employee/services/employee.service"
import type { Employee } from "@/features/employee/types/employee.types"
import type { TrackingHistoryItem } from "@/features/tracking/types/tracking.types"
import { logger } from "@/shared/utils/logger"
import { MessengerInfoCard } from "@/features/tracking/components/MessengerInfoCard"
import { TrackingHistoryList } from "@/features/tracking/components/TrackingHistoryList"

/**
 * Vista detallada de un mensajero específico.
 * Muestra información personal, estado actual en tiempo real, velocidad,
 * última ubicación conocida y permite consultar el historial de navegación
 * por fechas, visualizando la ruta recorrida en el mapa.
 */
export default function MessengerDetails() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const messengerUuid = id // route param is now a UUID string

    // Estado
    const [employee, setEmployee] = useState<Employee | null>(null)
    const [loading, setLoading] = useState(true)
    const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number } | null>(null)
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
    const [speed, setSpeed] = useState<number | null>(null)
    const [isActive, setIsActive] = useState(false)

    // Estado del historial
    const [historyDate, setHistoryDate] = useState<Date>(new Date())
    const [historyData, setHistoryData] = useState<TrackingHistoryItem[]>([])
    const [loadingHistory, setLoadingHistory] = useState(false)
    const [calendarOpen, setCalendarOpen] = useState(false)

    // Manejar actualizaciones en tiempo real
    const handleTrackingUpdate = useCallback((update: LiveTrackingUpdate) => {
        if (employee && update.messengerId === employee.idEmployee) {
            setCurrentLocation({ lat: update.latitude, lng: update.longitude })
            if (update.lastUpdate) {
                setLastUpdate(new Date(update.lastUpdate))
            }
            setSpeed(update.speed || 0)
            setIsActive(update.status === 'ACTIVE')
        }
    }, [employee])

    // Conectar a WebSocket
    useEffect(() => {
        const connect = async () => {
            if (trackingService.isCurrentlyConnected()) {
                trackingService.subscribeToAll(handleTrackingUpdate)
                return
            }

            try {
                const token = await authService.getWsToken()
                trackingService.connect(token, () => {
                    trackingService.subscribeToAll(handleTrackingUpdate)
                })
            } catch (err) {
                // Fallback a autenticación por cookie/header si el endpoint ws-token falla
                logger.debug('Token de WS no disponible en Detalles, usando alternativa', err)
                trackingService.connect(undefined, () => {
                    trackingService.subscribeToAll(handleTrackingUpdate)
                })
            }
        }
        connect()

        return () => {
            trackingService.disconnect()
        }
    }, [handleTrackingUpdate])

    // Obtener datos del empleado y tracking
    const fetchData = useCallback(async () => {
        if (!messengerUuid) {
            setLoading(false)
            return
        }

        try {
            setLoading(true)

            // Obtener info del empleado by UUID
            const emp = await employeeService.getById(messengerUuid)
            setEmployee(emp)

            // Obtener tracking activo si existe
            const activeMessengers = await trackingApiService.getActiveMessengers()
            const activeData = activeMessengers.find(m => m.messengerId === emp.idEmployee)

            if (activeData) {
                setCurrentLocation({ lat: activeData.latitude, lng: activeData.longitude })
                const date = activeData.lastUpdate ? new Date(activeData.lastUpdate) : null
                setLastUpdate(date && isFinite(date.getTime()) ? date : null)
                setSpeed(activeData.speed || null)
                setIsActive(activeData.status === 'ACTIVE')
            } else {
                // Intentar obtener última ubicación conocida
                try {
                    const lastLocation = await trackingApiService.getLastLocation(messengerUuid)
                    if (lastLocation) {
                        setCurrentLocation({ lat: lastLocation.latitude, lng: lastLocation.longitude })
                        const date = lastLocation.lastUpdate ? new Date(lastLocation.lastUpdate) : null
                        setLastUpdate(date && isFinite(date.getTime()) ? date : null)
                    }
                } catch {
                    // Ignorar error si no se encuentra última ubicación
                }
                setIsActive(false)
            }
        } catch (error) {
            logger.error("Error al obtener los datos del mensajero en MessengerDetails:", error)
        } finally {
            setLoading(false)
        }
    }, [messengerUuid])

    // Obtener datos del historial
    const fetchHistory = useCallback(async () => {
        if (!messengerUuid) return

        try {
            setLoadingHistory(true)
            const dateStr = format(historyDate, 'yyyy-MM-dd')
            const response = await trackingApiService.getHistory(messengerUuid, dateStr, 0, 500) // Fetch first 500 points for trail

            if (response && Array.isArray(response.content)) {
                setHistoryData(response.content)
            } else {
                setHistoryData([])
            }
        } catch (error) {
            logger.error("Error al obtener el historial en MessengerDetails:", error)
            setHistoryData([])
        } finally {
            setLoadingHistory(false)
        }
    }, [messengerUuid, historyDate])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    useEffect(() => {
        fetchHistory()
    }, [fetchHistory])

    const mapCenter = currentLocation || { lat: 6.2442, lng: -75.5812 } // Medellín default

    if (loading) {
        return null
    }

    if (!employee && !loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="p-4 rounded-full bg-muted">
                    <User className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-semibold">Transportista no encontrado</h2>
                    <p className="text-muted-foreground">No pudimos cargar la información del transportista.</p>
                </div>
                <Button onClick={() => navigate("/admin/tracking")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al monitoreo
                </Button>
            </div>
        )
    }

    return (
        <>
        <Card className="flex flex-col h-full overflow-hidden min-h-0 animate-in fade-in duration-500 !p-0">
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-3 py-2 px-4 border-b shrink-0">
                <div className="justify-self-start">
                    <AdminBreadcrumb
                        segments={[
                            { label: "Monitoreo", href: "/admin/tracking" },
                            { label: employee?.fullName || `Mensajero` }
                        ]}
                    />
                </div>

                <h1 className="text-xl md:text-2xl font-bold text-center">
                    {employee?.fullName || `Mensajero`}
                </h1>

                <div className="justify-self-end">
                    <Badge
                        variant="outline"
                        className={cn(
                            "gap-1.5 h-7 justify-center text-[11px] font-medium border shadow-sm px-2.5",
                            isActive
                                ? "bg-green-500/10 text-green-600 border-green-500/30"
                                : "bg-red-500/10 text-red-600 border-red-500/30"
                        )}
                    >
                        <MapPin className="h-3 w-3" />
                        {isActive ? "Activo Ahora" : "Desconectado"}
                    </Badge>
                </div>
            </div>

            <CardContent className="flex-1 pt-2 pb-0 px-2 sm:px-4 min-h-0 !overflow-hidden">
                <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-2 overflow-y-auto pb-2">
                <div className="space-y-6">
                    <MessengerInfoCard
                        employee={employee}
                        speed={speed}
                        lastUpdate={lastUpdate}
                        currentLocation={currentLocation}
                    />

                    <TrackingHistoryList
                        historyData={historyData}
                        loading={loadingHistory}
                        date={historyDate}
                        onDateSelect={setHistoryDate}
                        calendarOpen={calendarOpen}
                        setCalendarOpen={setCalendarOpen}
                    />
                </div>

                <Card className="lg:col-span-2 overflow-hidden border-2 shadow-inner">
                    <CardContent className="p-0 h-[600px] bg-muted/20 relative">
                        <MapComponent className="w-full h-full" center={mapCenter} zoom={15}>
                            {currentLocation && (
                                <MessengerMarker
                                    position={currentLocation}
                                    color={isActive ? '#10b981' : '#6b7280'}
                                />
                            )}
                        </MapComponent>
                    </CardContent>
                </Card>
                </div>
            </CardContent>
        </Card>
        </>
    )
}
