import { Navigation, Edit } from "lucide-react"
import type { ServiceDelivery } from "@/types/service.types"
import { useNavigate } from "react-router-dom"
import { PlacaBadge } from "@/components/PlacaBadge"
import { Button } from "@/components/ui/button"
import { trackingService } from "@/services/tracking.service"
import { toast } from "sonner"
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
        <div
            className="group relative flex items-center bg-card hover:bg-muted/30 transition-colors cursor-pointer border-b border-border/40 last:border-0"
            onClick={handleClick}
        >
            {/* Status Strip */}
            <div
                className="absolute left-0 top-0 bottom-0 w-1.5"
                style={{ backgroundColor: statusColor }}
            />

            <div className="flex items-center w-full pl-4 pr-3 py-3 gap-3">
                {/* Visual Identifier (Plate) */}
                <div className="shrink-0">
                    <PlacaBadge
                        plateNumber={service.plate.plateNumber}
                        plateType={service.plate.plateType}
                        size="lg"
                    />
                </div>

                {/* Spacer to push actions to the right */}
                <div className="flex-1" />

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full border-2 border-primary/20 bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm"
                        onClick={handleNavigate}
                        title="Navegar"
                    >
                        <Navigation className="h-3.5 w-3.5" />
                    </Button>

                    {service.currentStatus === 'ASSIGNED' && (
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full border-2 border-primary/20 bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm"
                            onClick={handleUpdate}
                            title="Actualizar"
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
