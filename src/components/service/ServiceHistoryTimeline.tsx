import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Timeline, TimelineItem, TimelineHeader, TimelineContent } from "@/components/ui/timeline"
import { HistoryEntryCard } from "@/components/service/HistoryEntryCard"
import { getStatusIconConfig } from "@/lib/status-utils"
import { getImageUrl } from "@/lib/image-utils"
import { useStatusColors } from "@/hooks/use-status-colors"
import type { ServiceDelivery } from "@/types/service.types"

interface ServiceHistoryTimelineProps {
    service: ServiceDelivery
    onImageClick: (url: string) => void
    className?: string
}

/**
 * Línea de tiempo que visualiza el historial de estados de un servicio.
 * Cada entrada muestra detalles del cambio, incluyendo fotos y firmas asociadas.
 */
export function ServiceHistoryTimeline({ service, onImageClick, className }: ServiceHistoryTimelineProps) {
    const { colors } = useStatusColors()

    return (
        <Card className={`h-full flex flex-col ${className}`}>
            <CardHeader className="p-2 pb-0">
                <CardTitle className="text-base text-foreground font-semibold">Historial de estados</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto max-h-[50vh] pr-2">
                {service.history && service.history.length > 0 ? (
                    <div className="py-2 pl-2">
                        <Timeline className="w-full">
                            {[...(service.history || [])].reverse().map((entry, index) => {
                                const platePhotos = service.photos?.filter(p => p.photoType === 'PLATE_DETECTION') || []

                                return (
                                    <TimelineItem
                                        key={entry.idStatusHistory}
                                        isLast={index === (service.history?.length || 0) - 1}
                                    >
                                        <TimelineHeader size="sm" statusStyle={getStatusIconConfig(entry.newStatus, colors).dotStyle}>
                                            <div
                                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ml-1"
                                                style={{ backgroundColor: getStatusIconConfig(entry.newStatus, colors).pillBackground }}
                                            >
                                                <span className="text-xs font-bold">
                                                    {getStatusIconConfig(entry.newStatus, colors).label}
                                                </span>
                                            </div>
                                        </TimelineHeader>
                                        <TimelineContent>
                                            <HistoryEntryCard
                                                entry={entry}
                                                platePhotos={platePhotos}
                                                signaturePath={service.signature?.signaturePath}
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
