import { useEffect, useState, useCallback } from "react"
import {
    X,
    Phone,
    Navigation,
    MessageSquare
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatDisplayName } from "@/lib/format-utils"
import { isMessengerOnline } from "@/lib/messenger-utils"
import { formatDistanceToNow, format } from "date-fns"
import { es } from "date-fns/locale"
import { employeeService } from "@/services/employee.service"
import { useStatusColors } from "@/hooks/use-status-colors"
import { getStatusIconConfig } from "@/lib/status-utils"
import type { DailyStats, ServiceStatus } from "@/types/service.types"
import type { LiveTrackingUpdate } from "@/services/tracking.service"
import type { Employee } from "@/types/employee.types"
import { logger } from "@/utils/logger"
import {
    MessengerProductivity,
    MessengerActivityTimeline,
    type TimelineEvent
} from "@/components/admin/MessengerActivity"

interface MessengerSidePanelProps {
    messenger: LiveTrackingUpdate | null
    messengerId: number | null
    isOpen: boolean
    onClose: () => void
    onFollow: (id: number) => void
    isFollowing: boolean
    /** Unified timestamp for synchronization */
    now: number
}

export function MessengerSidePanel({
    messenger,
    messengerId,
    isOpen,
    onClose,
    onFollow,
    isFollowing,
    now
}: MessengerSidePanelProps) {
    const [employee, setEmployee] = useState<Employee | null>(null)
    const [history, setHistory] = useState<TimelineEvent[]>([])
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
            logger.error("Error fetching messenger details in MessengerSidePanel:", error)
        }
    }, [messengerId])

    const fetchActivity = useCallback(async () => {
        if (!messengerId) return

        try {
            setLoadingHistory(true)
            setHistoryError(null)

            const { monitoringService } = await import('@/services/monitoring.service')
            const response = await monitoringService.getMessengerActivity(messengerId, selectedDate)

            setDailyStats({
                date: format(selectedDate, 'yyyy-MM-dd'),
                assigned: response.dailyStats.assigned,
                delivered: response.dailyStats.delivered,
                returned: response.dailyStats.returned,
                canceled: response.dailyStats.canceled,
                pending: response.dailyStats.pending,
                total: response.dailyStats.total
            })

            const milestones: TimelineEvent[] = response.timeline.map(event => {
                const eventDate = new Date(event.timestamp)
                const config = getStatusIconConfig(event.status as ServiceStatus, colors)

                return {
                    id: `history-${event.id}`,
                    time: format(eventDate, 'HH:mm'),
                    title: config.label,
                    description: `${event.plateNumber} - ${event.dealershipName}`,
                    lat: event.latitude,
                    lng: event.longitude,
                    type: 'status' as const,
                    statusLabel: config.label,
                    icon: null,
                    pillBackground: config.pillBackground,
                    dotStyle: config.dotStyle,
                    rawTimestamp: eventDate.getTime(),
                    changedByName: event.changedByRole === 'ADMIN' && event.changedByName ? (() => {
                        const names = event.changedByName.split(' ')
                        if (names.length >= 2) {
                            return `${names[0]} ${names[1].charAt(0)}.`
                        }
                        return event.changedByName
                    })() : undefined
                }
            })

            setHistory(milestones)

        } catch (error) {
            logger.error("Error fetching activity in MessengerSidePanel:", error)
            setHistoryError("No se pudo cargar la actividad")
        } finally {
            setLoadingHistory(false)
        }
    }, [messengerId, selectedDate, colors])

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
        // Use the passed 'now' for distance calculation to ensure synchronization
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
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-1 shrink-0">
                        {/* Phone Call */}
                        <a
                            href={`tel:${employee?.phone}`}
                            className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center border transition-all duration-200",
                                employee?.phone
                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
                                    : "bg-muted text-muted-foreground border-transparent cursor-not-allowed opacity-50"
                            )}
                            title={employee?.phone ? `Llamar a ${employee.phone}` : "Sin número"}
                            onClick={(e) => !employee?.phone && e.preventDefault()}
                        >
                            <Phone className="h-3.5 w-3.5" />
                        </a>

                        {/* WhatsApp/Message */}
                        <a
                            href={employee?.phone ? `https://wa.me/${employee.phone.replace(/\D/g, '')}` : '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center border transition-all duration-200",
                                employee?.phone
                                    ? "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20"
                                    : "bg-muted text-muted-foreground border-transparent cursor-not-allowed opacity-50"
                            )}
                            title={employee?.phone ? `Enviar WhatsApp` : "Sin número"}
                            onClick={(e) => !employee?.phone && e.preventDefault()}
                        >
                            <MessageSquare className="h-3.5 w-3.5" />
                        </a>

                        {/* Follow on Map */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => messengerId && onFollow(messengerId)}
                            className={cn(
                                "h-8 w-8 rounded-full border transition-all duration-200",
                                isFollowing
                                    ? "bg-primary/20 text-primary border-primary/30 shadow-sm"
                                    : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                            )}
                            title={isFollowing ? "Dejar de seguir" : "Seguir en mapa"}
                        >
                            <Navigation className={cn("h-3.5 w-3.5", isFollowing && "fill-current")} />
                        </Button>
                    </div>

                    <div className="min-w-0 flex-1 ml-1">
                        <h3 className="text-[13px] font-bold truncate leading-tight">
                            {messenger?.messengerName ? formatDisplayName(messenger.messengerName) : 'Cargando...'}
                        </h3>
                        <Badge variant="outline" className={cn(
                            "text-[8px] h-3 px-1 leading-none uppercase tracking-tighter border-0 font-bold",
                            isMessengerOnline(messenger?.status || '', messenger?.lastHeartbeat || messenger?.lastUpdate, 2, now)
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-muted text-muted-foreground"
                        )}>
                            {isMessengerOnline(messenger?.status || '', messenger?.lastHeartbeat || messenger?.lastUpdate, 2, now) ? '• En línea' : 'Offline'}
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
                    <MessengerProductivity stats={dailyStats} />

                    {/* Timeline */}
                    <MessengerActivityTimeline
                        history={history}
                        loading={loadingHistory}
                        error={historyError}
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                        onRetry={fetchActivity}
                    />
                </div>
            </div>
        </div>
    )
}
