import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Navigation, Edit } from "lucide-react"
import type { ServiceDelivery } from "@/types/service.types"
import { useNavigate } from "react-router-dom"
import { PlacaBadge } from "@/components/PlacaBadge"
import { Button } from "@/components/ui/button"
import { trackingService } from "@/services/tracking.service"
import { toast } from "sonner"
import { getStatusIconConfig } from "@/lib/status-utils"
import { useStatusColors } from "@/hooks/use-status-colors"

interface ServiceCardProps {
    service: ServiceDelivery
}

export function ServiceCard({ service }: ServiceCardProps) {
    const navigate = useNavigate()
    const { colors } = useStatusColors()

    const handleClick = () => {
        navigate(`/messenger/servicio/${service.idServiceDelivery}`)
    }

    // Get status color from centralized system
    const statusColor = colors[service.currentStatus] || '#6b7280'
    const statusConfig = getStatusIconConfig(service.currentStatus, colors)

    const handleNavigate = (e: React.MouseEvent) => {
        e.stopPropagation()

        if (!service?.dealership) return

        const { latitude, longitude, address } = service.dealership

        const toastId = toast.loading("Obteniendo ubicación...", { duration: 2000 })

        const openMaps = (originLat?: number, originLng?: number) => {
            let url = ''

            if (latitude && longitude) {
                url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
                if (originLat && originLng) {
                    url += `&origin=${originLat},${originLng}`
                }
            } else if (address) {
                url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
            } else {
                toast.error('Ubicación no disponible', { id: toastId })
                return
            }

            toast.dismiss(toastId)
            window.open(url, '_blank')
        }

        // 1. Try cache
        const cached = trackingService.getLastKnownLocation()
        if (cached && (Date.now() - cached.timestamp < 120000)) {
            toast.dismiss(toastId)
            openMaps(cached.latitude, cached.longitude)
            return
        }

        // 2. Try GPS
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    openMaps(position.coords.latitude, position.coords.longitude)
                },
                (error) => {
                    console.warn("GPS error", error)
                    toast.warning("Usando ubicación aproximada", { id: toastId })
                    openMaps()
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            )
        } else {
            openMaps()
        }
    }

    const handleUpdate = (e: React.MouseEvent) => {
        e.stopPropagation()
        navigate(`/messenger/servicio/${service.idServiceDelivery}/actualizar`)
    }

    return (
        <Card
            className="active:bg-muted/50 transition-all cursor-pointer touch-manipulation border-l-4 overflow-hidden relative shadow-sm"
            style={{
                borderLeftColor: statusColor
            }}
            onClick={handleClick}
        >
            <CardContent className="p-2 flex flex-col gap-1.5">
                {/* Top Row: Plate + Status + Actions */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <PlacaBadge
                            plateNumber={service.plate.plateNumber}
                            plateType={service.plate.plateType}
                            size="sm"
                            className="shadow-sm shrink-0 scale-90 origin-left"
                        />
                        {/* Status */}
                        <div
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full shrink-0"
                            style={{ backgroundColor: statusConfig.pillBackground }}
                        >
                            <div className="w-2 h-2 rounded-full" style={statusConfig.dotStyle} />
                            <span className="text-[10px] font-bold uppercase tracking-tight">
                                {statusConfig.label}
                            </span>
                        </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 rounded-full shadow-sm"
                            onClick={handleNavigate}
                            title="Navegar"
                        >
                            <Navigation className="h-4 w-4" />
                        </Button>

                        {service.currentStatus === 'ASSIGNED' && (
                            <Button
                                variant="default"
                                size="icon"
                                className="h-8 w-8 rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-sm"
                                onClick={handleUpdate}
                                title="Actualizar"
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Bottom Section: Dealership + Address */}
                <div className="flex flex-col px-0.5">
                    <p className="text-xs font-bold text-foreground truncate leading-tight">
                        {service.dealership.name}
                    </p>

                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground min-w-0 mt-0.5">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">
                            {service.dealership.address || 'Sin dirección'}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
