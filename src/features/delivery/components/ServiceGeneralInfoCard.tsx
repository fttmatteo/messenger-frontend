import { createElement } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip"
import { User, Calendar, PhoneCall, MapPin, Flag } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { PlacaBadge } from "@/shared/components/ui/PlacaBadge"
import { getPlateTypeIcon } from "@/shared/lib/status-utils"
import type { ServiceDelivery } from "@/features/delivery/types/service.types"

interface ServiceGeneralInfoCardProps {
    service: ServiceDelivery
    className?: string
}

/**
 * Tarjeta que muestra la información detallada de un servicio (placa, concesionario, mensajero, etc.).
 */
export function ServiceGeneralInfoCard({ service, className }: ServiceGeneralInfoCardProps) {
    const messengerName = service.messenger?.fullName ?? 'No asignado'
    const messengerPhone = service.messenger?.phone

    return (
        <Card className={`h-full flex flex-col ${className}`}>
            <CardHeader className="p-2 pb-0">
                <CardTitle className="text-base text-foreground font-semibold">Información general</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 overflow-y-auto">

                <div className="flex items-start gap-3">
                    {createElement(getPlateTypeIcon(), {
                        className: "h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0"
                    })}
                    <div className="flex-1">
                        <p className="text-sm font-medium">Chasis</p>
                        <div className="mt-1">
                            <PlacaBadge plateNumber={service.plate.plateNumber} size="lg" />
                        </div>
                    </div>
                </div>


                <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-medium">Concesionario origen</p>
                        <p className="text-sm text-muted-foreground">{service.originDealership.name}</p>
                        <p className="text-sm text-muted-foreground">
                            {service.originDealership.address} • {service.originDealership.zone}
                        </p>
                        {service.originDealership.phone && (
                            <p className="text-sm text-muted-foreground mt-1">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <a href={`tel:${service.originDealership.phone}`} className="hover:underline hover:text-primary transition-colors inline-flex items-center gap-1">
                                            <PhoneCall className="h-3 w-3" />
                                            {service.originDealership.phone}
                                        </a>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Llamar</p>
                                    </TooltipContent>
                                </Tooltip>
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <Flag className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-medium">Concesionario destino</p>
                        <p className="text-sm text-muted-foreground">{service.dealership.name}</p>
                        <p className="text-sm text-muted-foreground">
                            {service.dealership.address} • {service.dealership.zone}
                        </p>
                        {service.dealership.phone && (
                            <p className="text-sm text-muted-foreground mt-1">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <a href={`tel:${service.dealership.phone}`} className="hover:underline hover:text-primary transition-colors inline-flex items-center gap-1">
                                            <PhoneCall className="h-3 w-3" />
                                            {service.dealership.phone}
                                        </a>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Llamar</p>
                                    </TooltipContent>
                                </Tooltip>
                            </p>
                        )}
                    </div>
                </div>


                <div className="flex items-start gap-3">
                    <User className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-medium">Transportista</p>
                        <p className="text-sm text-muted-foreground">{messengerName}</p>
                        {messengerPhone && (
                            <p className="text-sm text-muted-foreground">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <a href={`tel:${messengerPhone}`} className="hover:underline hover:text-primary transition-colors inline-flex items-center gap-1">
                                            <PhoneCall className="h-3 w-3" />
                                            {messengerPhone}
                                        </a>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Llamar</p>
                                    </TooltipContent>
                                </Tooltip>
                            </p>
                        )}
                    </div>
                </div>


                <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-medium">Fecha de creación</p>
                        <p className="text-sm text-muted-foreground">
                            {format(new Date(service.createdAt), "PPPp", { locale: es })}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
