import React from "react"
import { TrendingUp, Clock, AlertCircle, MapPin, Calendar as CalendarIcon, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Timeline, TimelineItem, TimelineHeader, TimelineContent } from "@/components/ui/timeline"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { AddressDisplay } from "@/components/tracking"
import type { DailyStats } from "@/types/service.types"

export interface TimelineEvent {
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

interface MessengerProductivityProps {
    stats: DailyStats | null
}

export function MessengerProductivity({ stats }: MessengerProductivityProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-3 w-3" />
                    Resumen del Día
                </h4>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
                <div className="bg-background/40 border p-2 rounded-lg text-center">
                    <p className="text-[8px] text-muted-foreground uppercase font-semibold leading-none mb-1">Entregados</p>
                    <p className="text-sm font-bold">{stats?.delivered || 0}</p>
                </div>
                <div className="bg-background/40 border p-2 rounded-lg text-center">
                    <p className="text-[8px] text-muted-foreground uppercase font-semibold leading-none mb-1">Devueltos</p>
                    <p className="text-sm font-bold">{stats?.returned || 0}</p>
                </div>
                <div className="bg-background/40 border p-2 rounded-lg text-center">
                    <p className="text-[8px] text-muted-foreground uppercase font-semibold leading-none mb-1">Asignados</p>
                    <p className="text-sm font-bold">{stats?.total || 0}</p>
                </div>
                <div className="bg-background/40 border p-2 rounded-lg text-center">
                    <p className="text-[8px] text-muted-foreground uppercase font-semibold leading-none mb-1">Pendientes</p>
                    <p className="text-sm font-bold">{stats?.pending || 0}</p>
                </div>
            </div>
        </div>
    )
}

interface MessengerActivityTimelineProps {
    history: TimelineEvent[]
    loading: boolean
    error: string | null
    selectedDate: Date
    onDateSelect: (date: Date) => void
    onRetry: () => void
}

export function MessengerActivityTimeline({
    history,
    loading,
    error,
    selectedDate,
    onDateSelect,
    onRetry
}: MessengerActivityTimelineProps) {
    return (
        <div className="pt-2">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    Actividad
                </h4>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 text-[10px] px-2 gap-1 bg-transparent hover:bg-background/20 border-border/50">
                            <CalendarIcon className="h-3 w-3" />
                            {format(selectedDate, "dd MMM", { locale: es })}
                            <ChevronDown className="h-3 w-3 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50 bg-background/60 backdrop-blur-xl" align="start" side="left" sideOffset={12} collisionPadding={20}>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && onDateSelect(date)}
                            disabled={(date) => date > new Date() || date < new Date("2024-01-01")}
                            autoFocus
                            locale={es}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-4">
                            <Skeleton static className="h-8 w-8 rounded-full shrink-0" />
                            <div className="space-y-2 flex-1 pt-1">
                                <Skeleton static className="h-3 w-full max-w-[96px]" />
                                <Skeleton static className="h-3 w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                    <AlertCircle className="h-8 w-8 text-red-500/50 mb-2" />
                    <p className="text-xs text-muted-foreground">{error}</p>
                    <button onClick={onRetry} className="text-[10px] h-auto p-0 mt-1 text-primary hover:underline">
                        Reintentar
                    </button>
                </div>
            ) : history.length > 0 ? (
                <Timeline>
                    {history.map((event, index) => (
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
                                            <AddressDisplay lat={event.lat} lng={event.lng} className="truncate max-w-[180px] block" />
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
    )
}
