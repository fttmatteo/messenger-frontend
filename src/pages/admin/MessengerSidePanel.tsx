import React, { useEffect, useState, useCallback } from "react"
import {
    X,
    Clock,
    Phone,
    MapPin,
    AlertCircle,
    Calendar as CalendarIcon,
    ChevronDown,
    TrendingUp
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover"
import {
    Timeline,
    TimelineItem,
    TimelineHeader,
    TimelineContent
} from "@/components/ui/timeline"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatDisplayName } from "@/lib/format-utils"
import { formatDistanceToNow, format, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { employeeService } from "@/services/employee.service"
import { serviceDeliveryService } from "@/services/service.service"
import { Progress } from "@/components/ui/progress"
import { useStatusColors } from "@/hooks/useStatusColors"
import { getStatusIconConfig } from "@/lib/status-utils"
import type { DailyStats, ServiceStatus } from "@/types/service.types"
import type { LiveTrackingUpdate } from "@/services/tracking.service"
import type { Employee } from "@/types/employee.types"
import type { TrackingHistoryItem } from "@/types/location.types"

interface MessengerSidePanelProps {
    messenger: LiveTrackingUpdate | null
    messengerId: number | null
    isOpen: boolean
    onClose: () => void
    onFollow: (id: number) => void
    isFollowing: boolean
}

interface TimelineEvent {
    id: string
    time: string
    endTime?: string
    title: string
    description: string
    lat?: number
    lng?: number
    type: 'pickup' | 'delivery' | 'status' | 'point' | 'service'
    pillBackground?: string
    dotStyle?: React.CSSProperties
    statusLabel?: string
    icon: React.ReactNode
    rawTimestamp: number
    changedByName?: string
}

// Reverse Geocoding Logic from MessengerDetails.tsx
const addressCache = new Map<string, string>()
const requestQueue: Array<() => Promise<void>> = []
let isProcessingQueue = false

const processQueue = async () => {
    if (isProcessingQueue || requestQueue.length === 0) return
    isProcessingQueue = true

    while (requestQueue.length > 0) {
        const request = requestQueue.shift()
        if (request) {
            await request()
            await new Promise(resolve => setTimeout(resolve, 300))
        }
    }
    isProcessingQueue = false
}

const addToQueue = (request: () => Promise<void>) => {
    requestQueue.push(request)
    processQueue()
}

function AddressDisplay({ lat, lng }: { lat?: number, lng?: number }) {
    const [address, setAddress] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const cacheKey = (lat !== undefined && lng !== undefined) ? `${lat.toFixed(4)},${lng.toFixed(4)}` : null

    useEffect(() => {
        if (!cacheKey) {
            setAddress("Ubicación no disponible")
            setLoading(false)
            return
        }

        if (addressCache.has(cacheKey)) {
            setAddress(addressCache.get(cacheKey)!)
            setLoading(false)
            return
        }

        const fetchAddress = async () => {
            try {
                if (!window.google?.maps?.Geocoder || lat === undefined || lng === undefined) {
                    setAddress(lat !== undefined && lng !== undefined ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : "...")
                    setLoading(false)
                    return
                }

                const geocoder = new google.maps.Geocoder()
                const response = await geocoder.geocode({ location: { lat, lng } })

                if (response.results?.[0]) {
                    const addr = response.results[0].formatted_address
                    addressCache.set(cacheKey, addr)
                    setAddress(addr)
                } else {
                    setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
                }
            } catch (err) {
                console.error('Reverse geocode error:', err)
                setAddress(lat !== undefined && lng !== undefined ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : "Error")
            } finally {
                setLoading(false)
            }
        }

        addToQueue(fetchAddress)
    }, [lat, lng, cacheKey])

    if (loading) return <Skeleton className="h-3 w-32" />
    return <span className="truncate max-w-[180px] block" title={address || ''}>{address}</span>
}

export function MessengerSidePanel({
    messenger,
    messengerId,
    isOpen,
    onClose
}: MessengerSidePanelProps) {
    const [employee, setEmployee] = useState<Employee | null>(null)
    const [history, setHistory] = useState<TrackingHistoryItem[]>([])
    const [loadingHistory, setLoadingHistory] = useState(false)
    const [historyError, setHistoryError] = useState<string | null>(null)
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [dailyStats, setDailyStats] = useState<DailyStats | null>(null)
    const { colors } = useStatusColors()

    const fetchDetails = useCallback(async () => {
        if (!messengerId) return

        try {
            const emp = await employeeService.getById(messengerId)
            setEmployee(emp)
        } catch (error) {
            console.error("Error fetching messenger details:", error)
        }
    }, [messengerId])

    const fetchActivity = useCallback(async () => {
        if (!messengerId) return

        try {
            setLoadingHistory(true)
            setHistoryError(null)

            // 1. Fetch Daily Stats
            const stats = await serviceDeliveryService.getDailyStats(messengerId, selectedDate, selectedDate)
            if (stats && stats.length > 0) {
                setDailyStats(stats[0])
            } else {
                setDailyStats({
                    date: format(selectedDate, 'yyyy-MM-dd'),
                    assigned: 0,
                    delivered: 0,
                    returned: 0,
                    canceled: 0,
                    total: 0
                })
            }

            // 2. Fetch Services to build Milestones
            const allServices = await serviceDeliveryService.getAll()
            const messengerServices = allServices.filter(s => s.messenger?.idEmployee === messengerId)

            const milestones: TimelineEvent[] = []

            messengerServices.forEach(service => {
                // Add History events if match date
                service.history?.forEach(h => {
                    const changeDate = new Date(h.changeDate)
                    if (isSameDay(changeDate, selectedDate)) {
                        const config = getStatusIconConfig(h.newStatus as ServiceStatus, colors)

                        milestones.push({
                            id: `history-${h.idStatusHistory}`,
                            time: format(changeDate, 'HH:mm'),
                            title: config.label,
                            description: `${service.plate.plateNumber} - ${service.dealership.name}`,
                            lat: h.deliveryLatitude,
                            lng: h.deliveryLongitude,
                            type: 'status',
                            statusLabel: config.label,
                            icon: null,
                            pillBackground: config.pillBackground,
                            dotStyle: config.dotStyle,
                            rawTimestamp: changeDate.getTime(),
                            changedByName: h.changedBy?.role === 'ADMIN' ? (() => {
                                const names = h.changedBy.fullName.split(' ')
                                if (names.length >= 2) {
                                    return `${names[0]} ${names[1].charAt(0)}.`
                                }
                                return h.changedBy.fullName
                            })() : undefined
                        })
                    }
                })
            })

            // Sort by time descending (newest first)
            milestones.sort((a, b) => b.rawTimestamp - a.rawTimestamp)

            setHistory(milestones as any) // Typecast for now as we changed history meaning here

        } catch (error) {
            console.error("Error fetching activity:", error)
            setHistoryError("No se pudo cargar la actividad")
        } finally {
            setLoadingHistory(false)
        }
    }, [messengerId, selectedDate])

    useEffect(() => {
        if (isOpen && messengerId) {
            fetchDetails()
        }
    }, [isOpen, messengerId, fetchDetails])

    useEffect(() => {
        if (isOpen && messengerId) {
            fetchActivity()
        }
    }, [isOpen, messengerId, selectedDate, fetchActivity])

    // Reset history when messenger changes
    useEffect(() => {
        if (messengerId) {
            setHistory([])
            setEmployee(null)
        }
    }, [messengerId])

    const safeFormatDistanceToNow = (dateString: string | undefined) => {
        if (!dateString) return 'Sin registro'
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return 'Fecha inválida'
        return formatDistanceToNow(date, { addSuffix: true, locale: es })
    }

    if (!isOpen) return null

    return (
        <div className={cn(
            "absolute right-4 top-4 bottom-4 w-72 z-20 transition-all duration-300 flex flex-col",
            "bg-background/60 backdrop-blur-xl border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-right-full",
            !messenger && "hidden"
        )}>
            {/* Header */}
            <div className="p-3 border-b bg-background/40 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <a
                        href={`tel:${employee?.phone}`}
                        className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center border shrink-0 transition-colors",
                            employee?.phone
                                ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                                : "bg-muted text-muted-foreground border-transparent cursor-not-allowed opacity-50"
                        )}
                        title={employee?.phone ? `Llamar a ${employee.phone}` : "Sin número"}
                        onClick={(e) => !employee?.phone && e.preventDefault()}
                    >
                        <Phone className="h-4 w-4" />
                    </a>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-xs font-bold truncate">
                            {messenger?.messengerName ? formatDisplayName(messenger.messengerName) : 'Cargando...'}
                        </h3>
                        <Badge variant="outline" className={cn(
                            "text-[9px] h-3.5 px-1 leading-none uppercase tracking-tighter",
                            messenger?.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-muted text-muted-foreground"
                        )}>
                            {messenger?.status === 'ACTIVE' ? 'En línea' : 'Offline'}
                        </Badge>
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">

                    <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 rounded-full">
                        <X className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-3 space-y-4">
                    {/* Real-time Stats */}
                    <div className="bg-secondary/5 rounded-xl px-3 py-2 border border-secondary/10">
                        <div className="flex justify-between items-center">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Última señal</p>
                            <p className="text-xs font-semibold">
                                {safeFormatDistanceToNow(messenger?.lastUpdate)}
                            </p>
                        </div>
                    </div>

                    {/* Productivity Summary */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <TrendingUp className="h-3 w-3" />
                                Resumen del Día
                            </h4>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5">
                            <div className="bg-background/40 border p-2 rounded-lg text-center">
                                <p className="text-[8px] text-muted-foreground uppercase font-semibold leading-none mb-1">Entregados</p>
                                <p className="text-sm font-bold">{dailyStats?.delivered || 0}</p>
                            </div>
                            <div className="bg-background/40 border p-2 rounded-lg text-center">
                                <p className="text-[8px] text-muted-foreground uppercase font-semibold leading-none mb-1">Devueltos</p>
                                <p className="text-sm font-bold">{dailyStats?.returned || 0}</p>
                            </div>
                            <div className="bg-background/40 border p-2 rounded-lg text-center">
                                <p className="text-[8px] text-muted-foreground uppercase font-semibold leading-none mb-1">Pendientes</p>
                                <p className="text-sm font-bold">{dailyStats?.assigned ? dailyStats.assigned - (dailyStats.delivered + dailyStats.returned + dailyStats.canceled) : 0}</p>
                            </div>
                        </div>

                        <div className="space-y-1.5 bg-background/40 border p-2.5 rounded-lg">
                            <div className="flex justify-between items-end">
                                <p className="text-[10px] text-muted-foreground uppercase font-medium">Efectividad</p>
                                <p className="text-xs font-bold text-primary">
                                    {dailyStats?.total ? Math.round((dailyStats.delivered / dailyStats.total) * 100) : 0}%
                                </p>
                            </div>
                            <Progress value={dailyStats?.total ? (dailyStats.delivered / dailyStats.total) * 100 : 0} className="h-1" />
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="pt-2">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                Actividad
                            </h4>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-7 text-[10px] px-2 gap-1 bg-background/50 border-dashed">
                                        <CalendarIcon className="h-3 w-3" />
                                        {format(selectedDate, "dd MMM", { locale: es })}
                                        <ChevronDown className="h-3 w-3 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(date) => date && setSelectedDate(date)}
                                        disabled={(date) => date > new Date() || date < new Date("2024-01-01")}
                                        initialFocus
                                        locale={es}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {loadingHistory ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-4">
                                        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                                        <div className="space-y-2 flex-1 pt-1">
                                            <Skeleton className="h-3 w-24" />
                                            <Skeleton className="h-3 w-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : historyError ? (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <AlertCircle className="h-8 w-8 text-red-500/50 mb-2" />
                                <p className="text-xs text-muted-foreground">{historyError}</p>
                                <button onClick={() => fetchActivity()} className="text-[10px] h-auto p-0 mt-1 text-primary hover:underline">
                                    Reintentar
                                </button>
                            </div>
                        ) : history.length > 0 ? (
                            <Timeline>
                                {(history as any as TimelineEvent[]).map((event, index) => (
                                    <TimelineItem key={event.id} isLast={index === history.length - 1} data-small="true">
                                        <TimelineHeader statusStyle={event.dotStyle} size="sm">
                                            <div
                                                className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full ml-1"
                                                style={{ backgroundColor: event.pillBackground }}
                                            >
                                                <span className="text-[10px] font-bold">
                                                    {event.title}
                                                </span>
                                            </div>
                                            <div className="flex-1 text-right">
                                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                    {event.time} {event.endTime && ` - ${event.endTime}`}
                                                </span>
                                            </div>
                                        </TimelineHeader>
                                        <TimelineContent>
                                            <div className="flex flex-col gap-1">
                                                {event.description && (
                                                    <p className="text-[10px] text-muted-foreground/60 leading-relaxed italic">
                                                        {event.description}
                                                    </p>
                                                )}
                                                {event.lat && event.lng ? (
                                                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                                                        <MapPin className="h-3 w-3 shrink-0 opacity-50" />
                                                        <AddressDisplay lat={event.lat} lng={event.lng} />
                                                    </div>
                                                ) : null}
                                                {event.changedByName && (
                                                    <div className="mt-0.5 flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-muted/50 w-fit border border-muted-foreground/10">
                                                        <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Admin:</span>
                                                        <span className="text-[10px] font-medium text-foreground">{event.changedByName}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </TimelineContent>
                                    </TimelineItem>
                                ))}
                            </Timeline>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <AlertCircle className="h-8 w-8 text-muted-foreground/30 mb-2" />
                                <p className="text-xs text-muted-foreground">Sin actividad registrada el {format(selectedDate, "dd/MM")}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
