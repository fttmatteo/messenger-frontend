import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "./StatusBadge"
import { MapPin, Clock, ChevronRight, Navigation, Edit } from "lucide-react"
import type { ServiceDelivery } from "@/types/service.types"
import { useNavigate } from "react-router-dom"
import { PlacaBadge } from "@/components/PlacaBadge"
import { Button } from "@/components/ui/button"
import { trackingService } from "@/services/tracking.service"
import { toast } from "sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

interface ServiceCardProps {
    service: ServiceDelivery
}

export function ServiceCard({ service }: ServiceCardProps) {
    const navigate = useNavigate()

    const handleClick = () => {
        navigate(`/messenger/servicio/${service.idServiceDelivery}`)
    }

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const today = new Date()
        const isToday = date.toDateString() === today.toDateString()

        if (isToday) return 'Hoy'

        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        if (date.toDateString() === yesterday.toDateString()) return 'Ayer'

        return date.toLocaleDateString('es-CO', {
            day: 'numeric',
            month: 'short'
        })
    }

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
                borderLeftColor: service.currentStatus === 'ASSIGNED' ? '#3b82f6' :
                    service.currentStatus === 'DELIVERED' ? '#22c55e' :
                        service.currentStatus === 'RETURNED' ? '#f97316' :
                            service.currentStatus === 'CANCELED' ? '#ef4444' : '#a855f7'
            }}
            onClick={handleClick}
        >
            <CardContent className="p-3">
                <div className="flex flex-col gap-3">
                    {/* Header: Plate + Status + Actions */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <PlacaBadge
                                plateNumber={service.plate.plateNumber}
                                plateType={service.plate.plateType}
                                size="sm"
                                className="shadow-sm"
                            />
                            {/* Status Icon Only */}
                            <TooltipProvider>
                                <StatusBadge
                                    status={service.currentStatus}
                                    size="sm"
                                    className="h-7 w-7 p-0 flex items-center justify-center rounded-full shadow-sm"
                                />
                            </TooltipProvider>
                        </div>

                        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-full border border-border/50">
                            {/* Navigation */}
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600 rounded-full transition-colors"
                                onClick={handleNavigate}
                                title="Iniciar Navegación"
                            >
                                <Navigation className="h-4 w-4" />
                            </Button>

                            {/* Update - Only if active */}
                            {service.currentStatus === 'ASSIGNED' && (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 hover:bg-green-100 hover:text-green-600 rounded-full transition-colors"
                                    onClick={handleUpdate}
                                    title="Actualizar Estado"
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Dealership Info */}
                    <div className="grid gap-1 mr-4">
                        <p className="text-sm font-medium text-foreground truncate leading-none">
                            {service.dealership.name}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1 min-w-0">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate max-w-[150px]">
                                    {service.dealership.address || 'Sin dirección'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <Clock className="h-3 w-3" />
                                <span>{formatDate(service.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chevron decoration (absolute right) */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                    <ChevronRight className="h-6 w-6" />
                </div>
            </CardContent>
        </Card>
    )
}
