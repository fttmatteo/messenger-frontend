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
 * Tarjeta que muestra una entrada individual en el historial de estados de un servicio.
 * Visualiza la fecha, el usuario, observaciones y multimedia asociada (fotos/firmas).
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
        <div className={`bg-muted/30 rounded-lg p-2.5 space-y-2 border border-border/50 ${className}`}>
            <div className="flex flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{format(new Date(entry.changeDate), "PPp", { locale: es })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{entry.changedBy?.fullName || 'Sistema'}</span>
                </div>
            </div>

            {entry.observation && (
                <div className="pt-1.5 text-xs">
                    <span className="font-medium text-foreground">Observación: </span>
                    <span className="text-muted-foreground">{entry.observation}</span>
                </div>
            )}

            {entry.newStatus === 'ASSIGNED' && platePhotos.length > 0 && (
                <div className="pt-1.5 border-t border-border/50">
                    <p className="text-[10px] font-medium text-muted-foreground mb-1 text-center uppercase tracking-wider">Lectura de placa</p>
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
                                    className="w-16 h-16 object-cover rounded border border-border/50"
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

            {(((entry.newStatus === 'DELIVERED' || entry.newStatus === 'PENDING') && (entry.signature?.signaturePath || signaturePath)) || (entry.photos && entry.photos.length > 0)) && (
                <div className="pt-1.5 border-t border-border/50 flex flex-row gap-2 justify-center">
                    {(entry.newStatus === 'DELIVERED' || entry.newStatus === 'PENDING') && (entry.signature?.signaturePath || signaturePath) && (
                        <div className="flex flex-col items-center">
                            <p className="text-[10px] font-medium text-muted-foreground mb-1 text-center uppercase tracking-wider">Firma</p>
                            <div className="flex rounded border border-border/50 overflow-hidden bg-white">
                                <div
                                    className="relative group cursor-pointer h-16 w-32 flex items-center justify-center"
                                    onClick={() => handleImageClick(entry.signature?.signaturePath || signaturePath!)}
                                >
                                    <img
                                        src={getImageUrl(entry.signature?.signaturePath || signaturePath!)}
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
                                {entry.photos.map((photo) => (
                                    <div
                                        key={photo.idPhoto}
                                        className="relative group cursor-pointer"
                                        onClick={() => handleImageClick(photo.photoPath)}
                                    >
                                        <img
                                            src={getImageUrl(photo.photoPath)}
                                            alt="Evidencia"
                                            className="w-16 h-16 object-cover rounded border border-border/50"
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
            )}
        </div>
    )
}
