import { Clock, MessageSquare, Phone, MapPin, Flag } from "lucide-react"
import type { ServiceDelivery } from "@/types/service.types"
import { useNavigate } from "react-router-dom"
import { PlacaBadge } from "@/components/PlacaBadge"
import { trackingService } from "@/services/tracking.service"
import { showToast } from "@/config/toast-config"
import { useStatusColors } from "@/hooks/use-status-colors"
import { openMaps } from "@/lib/navigation-utils"
import { createLogger } from "@/utils/logger"
import { getStatusIconConfig } from "@/lib/status-utils"
import React, { memo } from "react"

const logger = createLogger('ServiceCard')

interface ServiceCardProps {
    service: ServiceDelivery
}

/**
 * Tarjeta optimizada y minimalista para mostrar información detallada de un servicio 
 * directamente en la lista del mensajero. Permite navegar al concesionario 
 * haciendo clic en la dirección, llamarlo haciendo clic en el teléfono, y actualizar 
 * el estado del servicio rápidamente.
 */
export const ServiceCard = memo(({ service }: ServiceCardProps) => {
    const navigate = useNavigate()
    const { colors } = useStatusColors()

    const statusColor = colors[service.currentStatus] || '#6b7280'
    const statusConfig = getStatusIconConfig(service.currentStatus, colors)

    const handleNavigate = (dealership: ServiceDelivery['dealership'], e: React.MouseEvent) => {
        e.stopPropagation()

        if (!dealership) return

        const { latitude, longitude, address } = dealership

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

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('es-CO', {
            day: 'numeric',
            month: 'short',
        }) + ', ' + date.toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    }
    const canUpdate = service.currentStatus === 'ASSIGNED' ||
                      service.currentStatus === 'PENDING' ||
                      service.currentStatus === 'RETURNED'

    return (
        <div
            onClick={canUpdate ? handleUpdate : undefined}
            className={`group relative flex flex-col bg-card border border-border/40 rounded-xl overflow-hidden shadow-sm transition-all ${
                canUpdate ? "cursor-pointer hover:bg-muted/15 active:scale-[0.99] select-none" : ""
            }`}
        >
            {/* Banda lateral con color de estado */}
            <div
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ backgroundColor: statusColor }}
            />

            <div className="flex flex-col p-3.5 pl-4.5 gap-2.5">
                {/* Cabecera: Chasis e Insignia de Estado */}
                <div className="flex items-center justify-between">
                    <PlacaBadge
                        plateNumber={service.plate.plateNumber}
                        size="md"
                    />
                    {statusConfig && (
                        <div
                            className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: statusConfig.pillBackground }}
                        >
                            <div className="w-3 h-3 rounded-full" style={statusConfig.dotStyle} />
                            <span className="text-sm font-medium text-foreground">
                                {statusConfig.label}
                            </span>
                        </div>
                    )}
                </div>

                <div className="space-y-3.5">
                    {/* Ruta de Concesionarios */}
                    <div className="flex flex-col pl-1">
                        {/* Origen Row */}
                        {service.originDealership && (
                            <div className="flex gap-3 items-stretch">
                                {/* Left Column: Icon and Line */}
                                <div className="flex flex-col items-center shrink-0 w-[18px] relative z-10">
                                    <MapPin className="h-[18px] w-[18px] text-muted-foreground shrink-0 mt-0.5" strokeWidth={2} />
                                    <div className="flex-1 w-0.5 border-l border-dashed border-muted-foreground/30 my-1" />
                                </div>
                                
                                {/* Right Column: Content */}
                                <div className="flex-1 min-w-0 pb-4">
                                    <span className="text-[11px] text-muted-foreground font-black uppercase tracking-wider block leading-none font-bold">Origen</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span
                                            onClick={(e) => handleNavigate(service.originDealership, e)}
                                            className="font-extrabold text-primary hover:text-primary/80 cursor-pointer underline underline-offset-2 text-[15px] truncate block max-w-[85%]"
                                            title="Haz clic para navegar con Google Maps al origen"
                                        >
                                            {service.originDealership.name}
                                        </span>
                                        {service.originDealership.phone && (
                                            <a
                                                href={`tel:${service.originDealership.phone}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-primary hover:text-primary/80 transition-colors p-1 -m-1 rounded-full hover:bg-muted/30 flex items-center justify-center"
                                                title={`Llamar al origen: ${service.originDealership.phone}`}
                                            >
                                                <Phone className="h-[18px] w-[18px] shrink-0 text-primary" strokeWidth={2} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Destino Row */}
                        {service.dealership && (
                            <div className="flex gap-3 items-stretch">
                                {/* Left Column: Icon */}
                                <div className="flex flex-col items-center shrink-0 w-[18px] z-10">
                                    <Flag className="h-[18px] w-[18px] text-muted-foreground shrink-0 mt-0.5" strokeWidth={2} />
                                </div>

                                {/* Right Column: Content */}
                                <div className="flex-1 min-w-0">
                                    <span className="text-[11px] text-muted-foreground font-black uppercase tracking-wider block leading-none font-bold">Destino</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span
                                            onClick={(e) => handleNavigate(service.dealership, e)}
                                            className="font-extrabold text-primary hover:text-primary/80 cursor-pointer underline underline-offset-2 text-[15px] truncate block max-w-[85%]"
                                            title="Haz clic para navegar con Google Maps al destino"
                                        >
                                            {service.dealership.name}
                                        </span>
                                        {service.dealership.phone && (
                                            <a
                                                href={`tel:${service.dealership.phone}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-primary hover:text-primary/80 transition-colors p-1 -m-1 rounded-full hover:bg-muted/30 flex items-center justify-center"
                                                title={`Llamar al destino: ${service.dealership.phone}`}
                                            >
                                                <Phone className="h-[18px] w-[18px] shrink-0 text-primary" strokeWidth={2} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Fecha de Asignación */}
                    <div className="flex items-center gap-2.5 text-xs text-muted-foreground font-semibold pl-1">
                        <Clock className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
                        <span>{formatDateTime(service.createdAt)}</span>
                    </div>
                </div>

                {/* Observaciones (si existen) */}
                {service.observation && (
                    <div className="flex items-start gap-2.5 bg-muted/65 border border-border/40 rounded-lg p-3 text-[13px] text-foreground/95 font-medium leading-relaxed shadow-sm">
                        <MessageSquare className="h-[18px] w-[18px] shrink-0 text-primary mt-0.5" />
                        <p className="line-clamp-2">{service.observation}</p>
                    </div>
                )}
            </div>
        </div>
    )
})

