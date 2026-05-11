import { Navigation, Edit } from "lucide-react"
import type { ServiceDelivery } from "@/types/service.types"
import { useNavigate } from "react-router-dom"
import { PlacaBadge } from "@/components/PlacaBadge"
import { Button } from "@/components/ui/button"
import { trackingService } from "@/services/tracking.service"
import { showToast } from "@/config/toast-config"
import { useStatusColors } from "@/hooks/use-status-colors"
import { openMaps } from "@/lib/navigation-utils"
import { createLogger } from "@/utils/logger"

const logger = createLogger('ServiceCard')

interface ServiceCardProps {
    service: ServiceDelivery
}

import React, { memo } from "react"

/**
 * Tarjeta compacta para mostrar información básica de un servicio en la lista del mensajero.
 * Incluye acciones rápidas para navegar al concesionario y actualizar el estado.
 */
export const ServiceCard = memo(({ service }: ServiceCardProps) => {
    const navigate = useNavigate()
    const { colors } = useStatusColors()

    const handleClick = () => {
        navigate(`/messenger/servicio/${service.uuid}`)
    }

    const statusColor = colors[service.currentStatus] || '#6b7280'

    const handleNavigate = (e: React.MouseEvent) => {
        e.stopPropagation()

        if (!service?.dealership) return

        const { latitude, longitude, address } = service.dealership

        const toastId = showToast.loading("Obteniendo ubicación...", { duration: 2000 })

        const triggerNavigation = (originLat?: number, originLng?: number) => {
            showToast.dismiss(toastId)
            openMaps(
                { latitude, longitude, address },
                originLat,
                originLng
            )
        }

        const cached = trackingService.getLastKnownLocation()
        if (cached && (Date.now() - cached.timestamp < 120000)) {
            triggerNavigation(cached.latitude, cached.longitude)
            return
        }

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    triggerNavigation(position.coords.latitude, position.coords.longitude)
                },
                (error) => {
                    logger.warn('Error de GPS', error)
                    showToast.warning("Usando ubicación aproximada", { id: toastId })
                    triggerNavigation()
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            )
        } else {
            triggerNavigation()
        }
    }

    const handleUpdate = (e: React.MouseEvent) => {
        e.stopPropagation()
        navigate(`/messenger/servicio/${service.uuid}/actualizar`)
    }

    return (
        <div
            className="group relative flex items-center bg-card hover:bg-muted/30 transition-colors cursor-pointer border border-border/50 rounded-lg overflow-hidden shadow-sm"
            onClick={handleClick}
        >

            <div
                className="absolute left-0 top-0 bottom-0 w-1.5"
                style={{ backgroundColor: statusColor }}
            />

            <div className="flex items-center w-full pl-4 pr-3 py-3 gap-3">
                <div className="shrink-0">
                    <PlacaBadge
                        plateNumber={service.plate.plateNumber}
                        plateType={service.plate.plateType}
                        size="lg"
                    />
                </div>

                <div className="flex-1" />
                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full border-2 border-primary/20 bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm"
                        onClick={handleNavigate}
                        title="Navegar"
                    >
                        <Navigation className="h-5 w-5" strokeWidth={2.5} />
                    </Button>

                    {(service.currentStatus === 'ASSIGNED' ||
                        service.currentStatus === 'PENDING' ||
                        service.currentStatus === 'RETURNED') && (
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full border-2 border-primary/20 bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm"
                                onClick={handleUpdate}
                                title="Actualizar"
                            >
                                <Edit className="h-5 w-5" strokeWidth={2.5} />
                            </Button>
                        )}
                </div>
            </div>
        </div>
    )
})
