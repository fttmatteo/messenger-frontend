import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Map as MapComponent } from "@/components/Map"
import { Polyline } from "@react-google-maps/api"
import { useTheme } from "next-themes"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessengerDetailsSkeleton } from "@/components/tracking/TrackingSkeletons"
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb"
import { MessengerMarker } from "@/components/tracking"
import { ArrowLeft, MapPin, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { trackingApiService } from "@/services/tracking-api.service"
import { employeeService } from "@/services/employee.service"
import type { Employee } from "@/types/employee.types"
import type { TrackingHistoryItem } from "@/types/tracking.types"

// New components
import { MessengerInfoCard } from "@/components/tracking/MessengerInfoCard"
import { TrackingHistoryList } from "@/components/tracking/TrackingHistoryList"

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
                } catch {

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

    // History path for polyline
    const historyPath = historyData
        .filter(h => h.latitude && h.longitude && h.latitude !== 0)
        .map(h => ({ lat: h.latitude, lng: h.longitude }))

    const mapCenter = currentLocation || { lat: 6.2442, lng: -75.5812 } // Medellín default

    if (loading) {
        return <MessengerDetailsSkeleton />
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
            {/* Header: Nav left, Title center, Status right */}
            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-3">
                <div className="justify-self-start">
                    <AdminBreadcrumb
                        segments={[
                            { label: "Monitoreo", href: "/admin/tracking" },
                            { label: employee?.fullName || `Mensajero #${messengerId}` }
                        ]}
                    />
                </div>

                <h1 className="text-xl md:text-2xl font-bold text-center">
                    {employee?.fullName || `Mensajero #${messengerId}`}
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
                        {isActive ? "Activo ahora" : "Desconectado"}
                    </Badge>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Info + History */}
                <div className="space-y-6">
                    {/* Current Status Card */}
                    <MessengerInfoCard
                        employee={employee}
                        speed={speed}
                        lastUpdate={lastUpdate}
                        currentLocation={currentLocation}
                    />

                    {/* History Card */}
                    <TrackingHistoryList
                        historyData={historyData}
                        loading={loadingHistory}
                        date={historyDate}
                        onDateSelect={setHistoryDate}
                        showRoute={showHistoryRoute}
                        onToggleRoute={() => setShowHistoryRoute(!showHistoryRoute)}
                        calendarOpen={calendarOpen}
                        setCalendarOpen={setCalendarOpen}
                    />
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
