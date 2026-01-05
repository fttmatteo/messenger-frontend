import { createElement } from "react"
// ... imports

// ... component
export function ServiceGeneralInfoCard({ service, className }: ServiceGeneralInfoCardProps) {
    // Removed const PlateIcon = ...

    return (
        <Card className={`h-[calc(100vh-135px)] min-h-[500px] flex flex-col ${className}`}>
            <CardHeader className="p-2 pb-0">
                <CardTitle className="text-base text-foreground font-semibold">Información general</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 flex-1 overflow-y-auto">
                {/* Placa */}
                <div className="flex items-start gap-3">
                    {createElement(getPlateTypeIcon(service.plate.plateType), {
                        className: "h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0"
                    })}
                    <div className="flex-1">
                        <p className="text-sm font-medium">Placa</p>
                        <div className="mt-1">
                            <PlacaBadge plateNumber={service.plate.plateNumber} plateType={service.plate.plateType} size="lg" />
                        </div>
                    </div>
                </div>

                {/* Concesionario */}
                <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-medium">Concesionario</p>
                        <p className="text-sm text-muted-foreground">{service.dealership.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {service.dealership.address} • {service.dealership.zone}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
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
                    </div>
                </div>

                {/* Mensajero */}
                <div className="flex items-start gap-3">
                    <User className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-medium">Mensajero</p>
                        <p className="text-sm text-muted-foreground">{service.messenger.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <a href={`tel:${service.messenger.phone}`} className="hover:underline hover:text-primary transition-colors inline-flex items-center gap-1">
                                        <PhoneCall className="h-3 w-3" />
                                        {service.messenger.phone}
                                    </a>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Llamar</p>
                                </TooltipContent>
                            </Tooltip>
                        </p>
                    </div>
                </div>

                {/* Fecha */}
                <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
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
