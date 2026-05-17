import { MapPin, Building2, Clock, MessageSquare, Phone } from "lucide-react"
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

                {/* Cuerpo de Detalles */}
                <div className="space-y-1.5">
                    {/* Concesionario Destino */}
                    <div className="flex items-start gap-2 text-xs">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" strokeWidth={2} />
                        <div className="min-w-0">
                            <span className="font-bold text-foreground truncate block">{service.dealership.name}</span>
                            {service.dealership.zone && (
                                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{service.dealership.zone}</span>
                            )}
                        </div>
                    </div>

                    {/* Dirección Clickable para Navegación en Mapas */}
                    {service.dealership.address && (
                        <div
                            onClick={handleNavigate}
                            className="flex items-center gap-2 text-[11px] text-primary hover:text-primary/80 font-bold cursor-pointer underline underline-offset-2 w-fit max-w-full transition-colors"
                            title="Haz clic para navegar con Google Maps"
                        >
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={2} />
                            <span className="truncate">{service.dealership.address}</span>
                        </div>
                    )}

                    {/* Teléfono del Concesionario Clickable para Llamar */}
                    {service.dealership.phone && (
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 text-[11px] text-primary hover:text-primary/80 font-bold w-fit max-w-full transition-colors"
                        >
                            <Phone className="h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={2} />
                            <a
                                href={`tel:${service.dealership.phone}`}
                                className="underline underline-offset-2 cursor-pointer"
                                title="Haz clic para llamar al concesionario"
                            >
                                {service.dealership.phone}
                            </a>
                        </div>
                    )}

                    {/* Fecha de Asignación */}
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                        <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                        <span>{formatDateTime(service.createdAt)}</span>
                    </div>
                </div>

                {/* Observaciones (si existen) */}
                {service.observation && (
                    <div className="flex items-start gap-1.5 bg-muted/40 border border-border/20 rounded-lg p-2 text-[10px] text-muted-foreground italic leading-relaxed">
                        <MessageSquare className="h-3 w-3 shrink-0 text-muted-foreground/60 mt-0.5" />
                        <p className="line-clamp-2">{service.observation}</p>
                    </div>
                )}
            </div>
        </div>
    )
})

