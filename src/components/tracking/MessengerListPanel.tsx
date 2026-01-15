import { memo, useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Navigation, Clock, ChevronRight, ChevronLeft, Wifi, MapPin } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { formatDisplayName } from "@/lib/format-utils"
import type { LiveTrackingUpdate } from "@/services/tracking.service"

/** Tiempo máximo para considerar "reciente" (2 minutos) */
const RECENT_THRESHOLD_MS = 2 * 60 * 1000

/** Helper para verificar si un timestamp es reciente */
const isRecent = (timestamp: string | undefined, now: number): boolean => {
    if (!timestamp) return false
    const date = new Date(timestamp).getTime()
    return !isNaN(date) && (now - date) < RECENT_THRESHOLD_MS
}

export interface MessengerListPanelProps {
    /** List of messengers to display */
    messengers: LiveTrackingUpdate[]
    /** Currently selected messenger */
    selectedMessengerId: number | null
    /** Messenger being followed (for visual indicator) */
    followingMessengerId: number | null
    /** Whether data is loading */
    loading: boolean
    /** Whether panel is collapsed */
    isCollapsed: boolean
    /** Toggle collapsed state */
    onToggleCollapse: () => void
    /** Called when a messenger is selected */
    onSelect: (messenger: LiveTrackingUpdate) => void
}

/**
 * Collapsible side panel showing list of messengers with status.
 */
export const MessengerListPanel = memo(function MessengerListPanel({
    messengers,
    selectedMessengerId,
    followingMessengerId,
    loading,
    isCollapsed,
    onToggleCollapse,
    onSelect
}: MessengerListPanelProps) {
    // Internal timer for relative times - only this component re-renders
    const [now, setNow] = useState(() => Date.now())
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 60000)
        return () => clearInterval(timer)
    }, [])
    return (
        <div className="h-full bg-background/60 backdrop-blur-xl rounded-lg shadow-lg border flex flex-col overflow-hidden">
            {/* Header */}
            <div className={cn(
                "flex items-center border-b shrink-0 h-10",
                isCollapsed ? "justify-center p-0" : "justify-between px-3"
            )}>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleCollapse}
                    className="h-6 w-6 p-0"
                    title={isCollapsed ? "Expandir" : "Colapsar"}
                >
                    {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
                {!isCollapsed && (
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Mensajeros</span>
                    </div>
                )}
            </div>

            {/* Content */}
            {!isCollapsed && (
                <ScrollArea className="flex-1">
                    {loading && messengers.length === 0 ? (
                        <div className="space-y-2 p-3">
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
                            {messengers.map((messenger) => {
                                const lastUpdateDate = messenger.lastUpdate ? new Date(messenger.lastUpdate) : null
                                const hasRecentUpdate = lastUpdateDate && (now - lastUpdateDate.getTime() < 60000)

                                // Indicadores separados: Conectado (heartbeat) vs GPS (lastUpdate)
                                const isConnected = isRecent(messenger.lastHeartbeat, now) || isRecent(messenger.lastUpdate, now)
                                const hasGps = isRecent(messenger.lastUpdate, now)

                                return (
                                    <button
                                        key={messenger.messengerId}
                                        className={cn(
                                            "w-full p-3 text-left hover:bg-muted/50 transition-colors",
                                            selectedMessengerId === messenger.messengerId && "bg-muted",
                                            followingMessengerId === messenger.messengerId && "ring-2 ring-inset ring-green-500"
                                        )}
                                        onClick={() => onSelect(messenger)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-sm truncate">
                                                {messenger.messengerName ? formatDisplayName(messenger.messengerName) : `#${messenger.messengerId}`}
                                            </span>
                                            {/* Indicadores de estado */}
                                            <div className="flex items-center gap-1">
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "h-5 px-1.5 text-[10px] gap-0.5",
                                                        isConnected ? "bg-green-500/10 text-green-600 border-green-500/30" : "bg-gray-500/10 text-gray-500 border-gray-500/30"
                                                    )}
                                                    title={isConnected ? "Conectado" : "Desconectado"}
                                                >
                                                    <Wifi className="h-2.5 w-2.5" />
                                                </Badge>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "h-5 px-1.5 text-[10px] gap-0.5",
                                                        hasGps ? "bg-blue-500/10 text-blue-600 border-blue-500/30" : "bg-gray-500/10 text-gray-500 border-gray-500/30"
                                                    )}
                                                    title={hasGps ? "GPS Activo" : "Sin GPS"}
                                                >
                                                    <MapPin className="h-2.5 w-2.5" />
                                                </Badge>
                                            </div>
                                        </div>
                                        {messenger.speed !== undefined && messenger.speed > 0 && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                <Navigation className="h-3 w-3 inline mr-1" />
                                                {(messenger.speed * 3.6).toFixed(1)} km/h
                                            </p>
                                        )}
                                        {lastUpdateDate && (
                                            <p className="text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3 inline mr-1" />
                                                {hasRecentUpdate
                                                    ? "Actualizado ahora"
                                                    : formatDistanceToNow(lastUpdateDate, { addSuffix: true, locale: es })}
                                            </p>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </ScrollArea>
            )}
        </div>
    )
})

