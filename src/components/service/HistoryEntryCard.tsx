import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Clock, User, Expand } from "lucide-react"
import type { StatusHistoryInfo, PhotoInfo } from "@/types/service.types"

interface HistoryEntryCardProps {
    entry: StatusHistoryInfo
    platePhotos: PhotoInfo[]
    signaturePath?: string
    getImageUrl: (url: string) => string
    className?: string
    onImageClick?: (url: string) => void
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
    onImageClick,
}: HistoryEntryCardProps) {
    const handleImageClick = (path: string) => {
        const url = getImageUrl(path)
        if (onImageClick) {
            onImageClick(url)
        } else {
            window.open(url, '_blank')
        }
    }

    return (
        <div className={`bg-muted/30 rounded-lg p-3 space-y-2.5 border border-border/50 ${className}`}>
            {/* Date and User Info */}
            <div className="flex flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span>{format(new Date(entry.changeDate), "PPp", { locale: es })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <User className="h-4 w-4 flex-shrink-0" />
                    <span>{entry.changedBy?.fullName || 'Sistema'}</span>
                </div>
            </div>

            {entry.newStatus === 'ASSIGNED' && platePhotos.length > 0 && (
                <div className="pt-2 border-t border-border/50">
                    <p className="text-xs font-medium text-muted-foreground mb-1 text-center">Lectura de placa</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                        {platePhotos.map((photo) => (
                            <div
                                key={photo.idPhoto}
                                className="relative group cursor-pointer"
                                onClick={() => handleImageClick(photo.photoPath)}
                            >
                                <img
                                    src={getImageUrl(photo.photoPath)}
                                    alt="Lectura de placa"
                                    className="w-12 h-12 object-cover rounded border border-border/50"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-black/60 rounded-full p-1">
                                        <Expand className="h-3 w-3 text-white" />
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
                    <p className="text-xs font-medium text-muted-foreground mb-1 text-center">Firma digital</p>
                    <div className="flex justify-center">
                        <div
                            className="relative group cursor-pointer h-12 w-20 bg-white rounded border border-border/50 flex items-center justify-center"
                            onClick={() => handleImageClick(signaturePath)}
                        >
                            <img
                                src={getImageUrl(signaturePath)}
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

            {/* Other photos */}
            {entry.photos && entry.photos.length > 0 && (
                <div className="pt-2 border-t border-border/50">
                    <p className="text-xs font-medium text-muted-foreground mb-1 text-center">Evidencia fotográfica</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                        {entry.photos.map((photo) => (
                            <div
                                key={photo.idPhoto}
                                className="relative group cursor-pointer"
                                onClick={() => handleImageClick(photo.photoPath)}
                            >
                                <img
                                    src={getImageUrl(photo.photoPath)}
                                    alt="Evidencia"
                                    className="w-12 h-12 object-cover rounded border border-border/50"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-black/60 rounded-full p-1">
                                        <Expand className="h-3 w-3 text-white" />
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
