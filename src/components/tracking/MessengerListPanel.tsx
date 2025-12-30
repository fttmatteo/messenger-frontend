import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Users, Navigation, Clock, ChevronRight, ChevronLeft } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { formatDisplayName } from "@/lib/format-utils"
import { isMessengerOnline } from "@/lib/messenger-utils"
import type { LiveTrackingUpdate } from "@/services/tracking.service"

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
    /** Current time in ms for relative time calculations */
    now: number
    /** Called when a messenger is selected */
    onSelect: (messenger: LiveTrackingUpdate) => void
}

/**
 * Collapsible side panel showing list of messengers with status.
 */
export function MessengerListPanel({
    messengers,
    selectedMessengerId,
    followingMessengerId,
    loading,
    isCollapsed,
    onToggleCollapse,
    now,
    onSelect
}: MessengerListPanelProps) {
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
                                const isRecent = lastUpdateDate && (now - lastUpdateDate.getTime() < 60000)

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
                                            <div className={cn(
                                                "w-2 h-2 rounded-full shrink-0",
                                                isMessengerOnline(messenger.status, messenger.lastUpdate) ? "bg-green-500" : "bg-gray-400"
                                            )} />
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
                                                {isRecent
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
}
