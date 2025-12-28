import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Navigation, Edit } from "lucide-react"
import type { ServiceDelivery } from "@/types/service.types"
import { useNavigate } from "react-router-dom"
import { PlacaBadge } from "@/components/PlacaBadge"
import { Button } from "@/components/ui/button"
import { trackingService } from "@/services/tracking.service"
import { toast } from "sonner"
import { getStatusIconConfig } from "@/lib/status-utils"
import { useStatusColors } from "@/context/StatusColorContext"

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
            className="active:bg-muted/50 transition-all cursor-pointer touch-manipulation border-l-4 overflow-hidden relative"
            style={{
                borderLeftColor: statusColor
            }}
            onClick={handleClick}
        >
            <CardContent className="p-2.5 flex items-center gap-3">
                {/* Left: Info */}
                <div className="flex-1 flex flex-col gap-2 min-w-0">
                    {/* Header: Plate + Status */}
                    <div className="flex flex-col items-start gap-1">
                        <PlacaBadge
                            plateNumber={service.plate.plateNumber}
                            plateType={service.plate.plateType}
                            size="sm"
                            className="shadow-sm"
                        />
                        {/* Status */}
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={statusConfig.dotStyle} />
                            <span className="text-xs font-medium" style={statusConfig.textStyle}>
                                {statusConfig.label}
                            </span>
                        </div>
                    </div>

                    {/* Dealership Info */}
                    <div className="grid gap-0.5">
                        <p className="text-sm font-medium text-foreground truncate leading-none">
                            {service.dealership.name}
                        </p>

                        <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">
                                {service.dealership.address || 'Sin dirección'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                    <Button
                        variant="default"
                        size="icon"
                        className="h-9 w-9 rounded-full shadow-sm text-white border-0"
                        style={{ backgroundColor: statusColor }}
                        onClick={handleNavigate}
                        title="Navegar"
                    >
                        <Navigation className="h-4 w-4" />
                    </Button>

                    {service.currentStatus === 'ASSIGNED' && (
                        <Button
                            variant="default"
                            size="icon"
                            className="h-9 w-9 rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-md border-0"
                            onClick={handleUpdate}
                            title="Actualizar"
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
