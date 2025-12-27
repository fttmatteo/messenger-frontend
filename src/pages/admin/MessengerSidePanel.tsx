import React, { useEffect, useState, useCallback } from "react"
import {
    X,
    Navigation,
    Clock,
    Phone,
    MoreVertical,
    Locate,
    MapPin,
    AlertCircle,
    Calendar as CalendarIcon,
    ChevronDown
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
import { formatDistanceToNow, format } from "date-fns"
import { es } from "date-fns/locale"
import { trackingApiService } from "@/services/tracking-api.service"
import { employeeService } from "@/services/employee.service"
import type { LiveTrackingUpdate } from "@/services/tracking.service"
import type { Employee } from "@/types/employee.types"

interface TrackingHistoryItem {
    latitude: number
    longitude: number
    recordedAt?: string
    timestamp?: string
    lastUpdate?: string
    speed?: number
}

interface MessengerSidePanelProps {
    messenger: LiveTrackingUpdate | null
    messengerId: number | null
    isOpen: boolean
    onClose: () => void
    onFollow: (id: number) => void
    isFollowing: boolean
    onHistoryChange?: (messengerId: number, history: TrackingHistoryItem[]) => void
}

interface TimelineEvent {
    id: string
    time: string
    endTime?: string
    title: string
    description: string
    lat: number
    lng: number
    type: 'pickup' | 'delivery' | 'status' | 'point'
    statusColor?: string
    icon: React.ReactNode
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
    onClose,
    onFollow,
    isFollowing,
    onHistoryChange
}: MessengerSidePanelProps) {
    const [employee, setEmployee] = useState<Employee | null>(null)
    const [history, setHistory] = useState<TrackingHistoryItem[]>([])
    const [loadingHistory, setLoadingHistory] = useState(false)
    const [historyError, setHistoryError] = useState<string | null>(null)
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())

    const fetchDetails = useCallback(async () => {
        if (!messengerId) return

        try {
            const emp = await employeeService.getById(messengerId)
            setEmployee(emp)
        } catch (error) {
            console.error("Error fetching messenger details:", error)
        }
    }, [messengerId])

    const fetchHistory = useCallback(async () => {
        if (!messengerId) return

        try {
            setLoadingHistory(true)
            setHistoryError(null)
            const dateStr = format(selectedDate, 'yyyy-MM-dd')
            const data = await trackingApiService.getHistory(messengerId, dateStr)
            setHistory(Array.isArray(data) ? data : [])
            if (onHistoryChange && messengerId) {
                onHistoryChange(messengerId, Array.isArray(data) ? data : [])
            }
        } catch (error) {
            console.error("Error fetching history:", error)
            setHistoryError("No se pudo cargar el historial")
            setHistory([])
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
            fetchHistory()
        }
    }, [isOpen, messengerId, selectedDate, fetchHistory])

    // Reset history when messenger changes
    useEffect(() => {
        if (messengerId) {
            setHistory([])
            setEmployee(null)
        }
    }, [messengerId])

    if (!isOpen) return null

    // Process history into timeline events - Simplified grouping by same location
    const timelineEvents: TimelineEvent[] = (() => {
        const sorted = [...history]
            .filter(item => item && (item.recordedAt || item.timestamp || item.lastUpdate))
            .sort((a, b) => {
                const timeA = new Date((a.recordedAt || a.timestamp || a.lastUpdate) as string).getTime()
                const timeB = new Date((b.recordedAt || b.timestamp || b.lastUpdate) as string).getTime()
                return timeA - timeB
            })

        if (sorted.length === 0) return []

        const grouped: TimelineEvent[] = []
        let currentGroup: {
            items: TrackingHistoryItem[]
            lat: number
            lng: number
            startTime: Date
            endTime: Date
        } | null = null

        sorted.forEach((item) => {
            const timestamp = (item.recordedAt || item.timestamp || item.lastUpdate) as string
            const date = new Date(timestamp)
            const lat = Number(Number(item.latitude).toFixed(5))
            const lng = Number(Number(item.longitude).toFixed(5))

            if (!currentGroup) {
                currentGroup = {
                    items: [item],
                    lat,
                    lng,
                    startTime: date,
                    endTime: date
                }
            } else if (lat === currentGroup.lat && lng === currentGroup.lng) {
                currentGroup.items.push(item)
                currentGroup.endTime = date
            } else {
                // Push previous group and start new one
                const avgSpeed = currentGroup.items.reduce((acc: number, curr: TrackingHistoryItem) => acc + (curr.speed || 0), 0) / currentGroup.items.length * 3.6
                grouped.push({
                    id: `group-${currentGroup.startTime.getTime()}`,
                    time: format(currentGroup.startTime, 'HH:mm'),
                    endTime: currentGroup.startTime.getTime() !== currentGroup.endTime.getTime() ? format(currentGroup.endTime, 'HH:mm') : undefined,
                    title: avgSpeed > 5 ? 'En movimiento' : avgSpeed > 0 ? 'Movimiento lento' : 'Detenido',
                    description: avgSpeed > 0.5 ? `Velocidad prom: ${avgSpeed.toFixed(1)} km/h` : '',
                    lat: currentGroup.lat,
                    lng: currentGroup.lng,
                    type: 'point',
                    icon: avgSpeed > 5 ? <Navigation className="h-3 w-3" /> : <MapPin className="h-3 w-3" />,
                    statusColor: avgSpeed > 5 ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground'
                })

                currentGroup = {
                    items: [item],
                    lat,
                    lng,
                    startTime: date,
                    endTime: date
                }
            }
        })

        // Final group
        if (currentGroup) {
            const avgSpeed = (currentGroup as any).items.reduce((acc: number, curr: any) => acc + (curr.speed || 0), 0) / (currentGroup as any).items.length * 3.6
            grouped.push({
                id: `group-${(currentGroup as any).startTime.getTime()}`,
                time: format((currentGroup as any).startTime, 'HH:mm'),
                endTime: (currentGroup as any).startTime.getTime() !== (currentGroup as any).endTime.getTime() ? format((currentGroup as any).endTime, 'HH:mm') : undefined,
                title: avgSpeed > 5 ? 'En movimiento' : avgSpeed > 0 ? 'Movimiento lento' : 'Detenido',
                description: avgSpeed > 0.5 ? `Velocidad prom: ${avgSpeed.toFixed(1)} km/h` : '',
                lat: (currentGroup as any).lat,
                lng: (currentGroup as any).lng,
                type: 'point',
                icon: avgSpeed > 5 ? <Navigation className="h-3 w-3" /> : <MapPin className="h-3 w-3" />,
                statusColor: avgSpeed > 5 ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground'
            })
        }

        return grouped.reverse().slice(0, 30)
    })()

    const safeFormatDistanceToNow = (dateString: string | undefined) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return 'Fecha inválida'
        return formatDistanceToNow(date, { addSuffix: true, locale: es })
    }

    return (
        <div className={cn(
            "absolute right-4 top-4 bottom-4 w-80 z-20 transition-all duration-300 flex flex-col",
            "bg-background/80 backdrop-blur-xl border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-right-full",
            !messenger && "hidden"
        )}>
            {/* Header */}
            <div className="p-4 border-b bg-background/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <a
                        href={`tel:${employee?.phone}`}
                        className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center border shrink-0 transition-colors",
                            employee?.phone
                                ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                                : "bg-muted text-muted-foreground border-transparent cursor-not-allowed opacity-50"
                        )}
                        title={employee?.phone ? `Llamar a ${employee.phone}` : "Sin número"}
                        onClick={(e) => !employee?.phone && e.preventDefault()}
                    >
                        <Phone className="h-5 w-5" />
                    </a>
                    <div className="min-w-0">
                        <h3 className="text-sm font-bold truncate">
                            {messenger?.messengerName ? formatDisplayName(messenger.messengerName) : 'Cargando...'}
                        </h3>
                        <Badge variant="outline" className={cn(
                            "text-[10px] h-4 px-1 leading-none uppercase tracking-tighter",
                            messenger?.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-muted text-muted-foreground"
                        )}>
                            {messenger?.status === 'ACTIVE' ? 'En línea' : 'Desconectado'}
                        </Badge>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-4 space-y-6">
                    {/* Real-time Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Velocidad</p>
                            <div className="flex items-end gap-1">
                                <span className="text-xl font-bold">{((messenger?.speed || 0) * 3.6).toFixed(0)}</span>
                                <span className="text-[10px] text-muted-foreground pb-1">km/h</span>
                            </div>
                        </div>
                        <div className="bg-secondary/5 rounded-xl p-3 border border-secondary/10">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Última señal</p>
                            <p className="text-xs font-semibold">
                                {safeFormatDistanceToNow(messenger?.lastUpdate)}
                            </p>
                        </div>
                    </div>

                    {/* Quick Info */}
                    <div className="space-y-3">
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
                                <Button variant="link" size="sm" onClick={() => fetchHistory()} className="text-[10px] h-auto p-0 mt-1">
                                    Reintentar
                                </Button>
                            </div>
                        ) : timelineEvents.length > 0 ? (
                            <Timeline>
                                {timelineEvents.map((event, index) => (
                                    <TimelineItem key={event.id} isLast={index === timelineEvents.length - 1}>
                                        <TimelineHeader
                                            icon={event.icon}
                                            statusColor={event.statusColor}
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <span className="text-xs font-bold">{event.title}</span>
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
                                                <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                                                    <MapPin className="h-3 w-3 shrink-0 opacity-50" />
                                                    <AddressDisplay lat={event.lat} lng={event.lng} />
                                                </div>
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

            {/* Actions */}
            <div className="p-4 bg-background/40 border-t flex gap-2">
                <Button
                    variant={isFollowing ? "default" : "outline"}
                    className={cn(
                        "flex-1 h-10 gap-2 text-xs",
                        isFollowing && "bg-emerald-500 hover:bg-emerald-600 border-none"
                    )}
                    onClick={() => messenger && onFollow(messenger.messengerId)}
                >
                    <Locate className={cn("h-4 w-4", isFollowing && "animate-pulse")} />
                    {isFollowing ? 'Siguiendo' : 'Seguir'}
                </Button>
                <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
