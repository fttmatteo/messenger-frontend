// Components
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Clock, User, Expand } from "lucide-react"

// Types
import type { StatusHistoryInfo, PhotoInfo } from "@/types/service.types"

interface HistoryEntryCardProps {
    entry: StatusHistoryInfo
    platePhotos: PhotoInfo[]
    signaturePath?: string
    getImageUrl: (url: string) => string
    className?: string
}

/**
 * Renders the content card for a history entry.
 * Used in both desktop and mobile timeline views.
 */
export function HistoryEntryCard({
    entry,
    platePhotos,
    signaturePath,
    getImageUrl,
    className = "",
}: HistoryEntryCardProps) {
    return (
        <div className={`bg-muted/30 rounded-lg p-3 space-y-2.5 border border-border/50 ${className}`}>
            {/* Date and User Info */}
            <div className="flex flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{format(new Date(entry.changeDate), "PPp", { locale: es })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>@{entry.changedBy.userName}</span>
                </div>
            </div>

            {/* Plate photos for ASSIGNED */}
            {entry.newStatus === 'ASSIGNED' && platePhotos.length > 0 && (
                <div className="pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-2">Lectura de placa</p>
                    <div className="flex flex-wrap gap-2">
                        {platePhotos.map((photo) => (
                            <div
                                key={photo.idPhoto}
                                className="relative group cursor-pointer"
                                onClick={() => window.open(getImageUrl(photo.photoPath), '_blank')}
                            >
                                <img
                                    src={getImageUrl(photo.photoPath)}
                                    alt="Lectura de placa"
                                    className="w-28 h-28 object-cover rounded-md border border-border/50"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-black/60 rounded-full p-1.5">
                                        <Expand className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Signature for DELIVERED */}
            {entry.newStatus === 'DELIVERED' && signaturePath && (
                <div className="pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-2">Firma digital</p>
                    <div
                        className="relative group cursor-pointer w-28 h-28 bg-white rounded-md border border-border/50 flex items-center justify-center"
                        onClick={() => window.open(getImageUrl(signaturePath), '_blank')}
                    >
                        <img
                            src={getImageUrl(signaturePath)}
                            alt="Firma"
                            className="max-w-full max-h-full object-contain p-1"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                            <div className="bg-black/60 rounded-full p-1.5">
                                <Expand className="h-4 w-4 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Other photos */}
            {entry.photos && entry.photos.length > 0 && (
                <div className="pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-2">Evidencia fotográfica</p>
                    <div className="flex flex-wrap gap-2">
                        {entry.photos.map((photo) => (
                            <div
                                key={photo.idPhoto}
                                className="relative group cursor-pointer"
                                onClick={() => window.open(getImageUrl(photo.photoPath), '_blank')}
                            >
                                <img
                                    src={getImageUrl(photo.photoPath)}
                                    alt="Evidencia"
                                    className="w-28 h-28 object-cover rounded-md border border-border/50"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-black/60 rounded-full p-1.5">
                                        <Expand className="h-4 w-4 text-white" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
