import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Timeline, TimelineItem, TimelineHeader, TimelineContent } from "@/shared/components/ui/timeline"
import { HistoryEntryCard } from "@/features/delivery/components/HistoryEntryCard"
import { getStatusIconConfig } from "@/shared/lib/status-utils"
import { getImageUrl } from "@/shared/lib/image-utils"
import type { ServiceDelivery } from "@/features/delivery/types/service.types"

interface ServiceHistoryTimelineProps {
    service: ServiceDelivery
    onImageClick: (urls: string[], index: number) => void
    className?: string
}

/**
 * Línea de tiempo que visualiza el historial de estados de un servicio.
 * Cada entrada muestra detalles del cambio, incluyendo fotos y firmas asociadas.
 */
export function ServiceHistoryTimeline({ service, onImageClick, className }: ServiceHistoryTimelineProps) {
    return (
        <Card className={`h-full flex flex-col overflow-hidden ${className}`}>
            <CardHeader className="p-2 pb-0">
                <CardTitle className="text-base text-foreground font-semibold">Historial de estados</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto min-h-0 pr-2">
                {service.history && service.history.length > 0 ? (
                    <div className="py-2 pl-2">
                        <Timeline className="w-full">
                            {[...(service.history || [])].reverse().map((entry, index) => {
                                const config = getStatusIconConfig(entry.newStatus)
                                return (
                                    <TimelineItem
                                        key={entry.idStatusHistory}
                                        isLast={index === (service.history?.length || 0) - 1}
                                    >
                                        <TimelineHeader size="sm" statusStyle={config.dotStyle}>
                                            <div
                                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ml-1"
                                                style={{ backgroundColor: config.pillBackground }}
                                            >
                                                <span className="text-xs font-bold">
                                                    {config.label}
                                                </span>
                                            </div>
                                        </TimelineHeader>
                                        <TimelineContent>
                                            <HistoryEntryCard
                                                entry={entry}
                                                getImageUrl={getImageUrl}
                                                onImageClick={onImageClick}
                                            />
                                        </TimelineContent>
                                    </TimelineItem>
                                )
                            })}
                        </Timeline>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-muted-foreground text-center">
                            Sin historial de cambios
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
