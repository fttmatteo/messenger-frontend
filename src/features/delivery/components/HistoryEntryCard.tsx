import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Clock, User, Expand, Calendar, MapPin } from "lucide-react"
import type { StatusHistoryInfo } from "@/features/delivery/types/service.types"
import { formatDisplayName } from "@/shared/lib/format-utils"

interface HistoryEntryCardProps {
    entry: StatusHistoryInfo
    previousEntry?: StatusHistoryInfo
    getImageUrl: (url: string) => string
    className?: string
    onImageClick?: (urls: string[], index: number) => void
    scheduledAt?: string
}

/**
 * Tarjeta que muestra una entrada individual en el historial de estados de un servicio.
 * Visualiza la fecha, el usuario, observaciones y multimedia asociada (fotos/firmas).
 */
export function HistoryEntryCard({
    entry,
    previousEntry,
    getImageUrl,
    className = "",
    onImageClick,
    scheduledAt,
}: HistoryEntryCardProps) {
    const handleImageClick = (paths: string[], startIndex: number = 0) => {
        const urls = paths.map(path => getImageUrl(path))
        if (onImageClick) {
            onImageClick(urls, startIndex)
        } else {
            window.open(urls[startIndex], '_blank')
        }
    }

    return (
        <div className={`bg-muted/30 rounded-lg p-2.5 space-y-2 border border-border/50 ${className}`}>
            <div className="flex flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span>{format(new Date(entry.changeDate), "dd/MM/yy - HH:mm", { locale: es })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <User className="h-4 w-4 flex-shrink-0" />
                    <span>{entry.changedBy?.fullName ? formatDisplayName(entry.changedBy.fullName) : 'Sistema'}</span>
                </div>
            </div>

            {entry.observation && (
                <div className="pt-1.5 text-sm">
                    <span className="font-medium text-foreground">Observación: </span>
                    <span className="text-muted-foreground">{entry.observation}</span>
                </div>
            )}

            {entry.newStatus === 'SCHEDULED' && scheduledAt && (
                <div className="mt-2 p-2.5 bg-primary/10 border border-primary/20 rounded-md flex items-center gap-2.5 shadow-sm">
                    <div className="flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Programado para</span>
                        <span className="text-xs font-semibold text-primary/90">{format(new Date(scheduledAt), "PPp", { locale: es })}</span>
                    </div>
                </div>
            )}

            {/* Mostrar detalles de edición de ruta */
            (() => {
                const isRouteEdit = entry.observation === "Edición de ruta por administrador";
                
                if (!isRouteEdit) return null;

                const hasPreviousOrigin = previousEntry?.snapshotOriginDealershipName != null;
                const hasPreviousDest = previousEntry?.snapshotDestinationDealershipName != null;
                
                const changedOrigin = previousEntry?.snapshotOriginDealershipId !== entry.snapshotOriginDealershipId;
                const changedDest = previousEntry?.snapshotDestinationDealershipId !== entry.snapshotDestinationDealershipId;

                return (
                    <div className="mt-2 p-2.5 bg-muted/50 border border-border/50 rounded-md flex flex-col gap-2 shadow-sm">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            <MapPin className="h-3 w-3" />
                            <span>Ruta tras la edición</span>
                        </div>
                        <div className="flex flex-col gap-1.5 text-xs text-foreground">
                            
                            {/* Origen */}
                            <div className="flex flex-col gap-0.5">
                                <span className="text-muted-foreground text-[10px] font-semibold uppercase">Origen:</span>
                                <div className="flex items-center gap-2">
                                    {hasPreviousOrigin && changedOrigin && (
                                        <>
                                            <span className="line-through text-muted-foreground max-w-[120px] truncate">{previousEntry.snapshotOriginDealershipName}</span>
                                            <span className="text-muted-foreground">➔</span>
                                        </>
                                    )}
                                    <span className="font-medium text-foreground max-w-[120px] truncate">
                                        {entry.snapshotOriginDealershipName || 'N/A'}
                                    </span>
                                </div>
                            </div>

                            {/* Destino */}
                            <div className="flex flex-col gap-0.5">
                                <span className="text-muted-foreground text-[10px] font-semibold uppercase">Destino:</span>
                                <div className="flex items-center gap-2">
                                    {hasPreviousDest && changedDest && (
                                        <>
                                            <span className="line-through text-muted-foreground max-w-[120px] truncate">{previousEntry.snapshotDestinationDealershipName}</span>
                                            <span className="text-muted-foreground">➔</span>
                                        </>
                                    )}
                                    <span className="font-medium text-foreground max-w-[120px] truncate">
                                        {entry.snapshotDestinationDealershipName || 'N/A'}
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>
                );
            })()}

            {(((entry.newStatus === 'DELIVERED') && entry.signature?.signaturePath) || (entry.photos && entry.photos.length > 0)) && (
                <div className="pt-1.5 border-t border-border/50 flex flex-row gap-2 justify-center">
                    {(entry.newStatus === 'DELIVERED') && entry.signature?.signaturePath && (
                        <div className="flex flex-col items-center">
                            <p className="text-[10px] font-medium text-muted-foreground mb-1 text-center uppercase tracking-wider">Firma</p>
                            <div className="flex rounded border border-border/50 overflow-hidden bg-white">
                                <div
                                    className="relative group cursor-pointer h-16 w-32 flex items-center justify-center"
                                    onClick={() => handleImageClick([entry.signature!.signaturePath], 0)}
                                >
                                    <img
                                        src={getImageUrl(entry.signature!.signaturePath)}
                                        alt="Firma"
                                        className="max-w-full max-h-full object-contain p-0.5"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                                        <div className="bg-black/60 rounded-full p-1">
                                            <Expand className="h-3 w-3 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {entry.photos && entry.photos.length > 0 && (
                        <div className="flex flex-col items-center">
                            <p className="text-[10px] font-medium text-muted-foreground mb-1 text-center uppercase tracking-wider">Evidencia</p>
                            <div className="flex flex-wrap gap-1 justify-center">
                                {entry.photos.length === 1 ? (
                                    <div
                                        className="relative group cursor-pointer"
                                        onClick={() => handleImageClick([entry.photos![0].photoPath], 0)}
                                    >
                                        <img
                                            src={getImageUrl(entry.photos![0].photoPath)}
                                            alt="Evidencia"
                                            className="w-16 h-16 object-cover rounded border border-border/50"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="bg-black/60 rounded-full p-1">
                                                <Expand className="h-3 w-3 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className="relative group cursor-pointer"
                                        onClick={() => handleImageClick(entry.photos!.map(p => p.photoPath), 0)}
                                    >
                                        <img
                                            src={getImageUrl(entry.photos![0].photoPath)}
                                            alt="Evidencia"
                                            className="w-16 h-16 object-cover rounded border border-border/50"
                                        />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 group-hover:bg-black/70 transition-colors rounded">
                                            <span className="text-white font-bold text-xs">+{entry.photos.length - 1}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
