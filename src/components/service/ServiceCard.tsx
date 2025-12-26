import { motion } from "framer-motion"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Building2, User, Calendar, Edit } from "lucide-react"
import { PlacaBadge } from "@/components/PlacaBadge"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { getStatusBadge, getPlateTypeIcon } from "@/lib/status-utils"
import { formatDisplayName } from "@/lib/format-utils"
import type { ServiceDelivery } from "@/types/service.types"

interface ServiceCardProps {
    service: ServiceDelivery
    onUpdate: (service: ServiceDelivery) => void
    onViewDetails: (serviceId: number) => void
}

/**
 * Mobile card component for displaying a service in list view.
 * Shows plate, status, dealership, messenger, and date with action buttons.
 */
export function ServiceCard({ service, onUpdate, onViewDetails }: ServiceCardProps) {
    const statusConfig = getStatusBadge(service.currentStatus)

    const PlateIcon = getPlateTypeIcon(service.plate.plateType)

    return (
        <motion.div exit="exit" layout>
            <Card
                className="mb-3 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onViewDetails(service.idServiceDelivery)}
            >
                <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2 min-w-0">
                            <div className="flex flex-col items-start gap-2">
                                <div className="flex flex-col items-start gap-2 w-fit">
                                    <Badge className={`${statusConfig.className} text-base px-3 py-1`}>
                                        {statusConfig.label}
                                    </Badge>
                                    <div className="flex items-center gap-2">
                                        <PlacaBadge
                                            plateNumber={service.plate.plateNumber}
                                            plateType={service.plate.plateType}
                                            size="md"
                                        />
                                        <PlateIcon className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1 text-base text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate">{service.dealership.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="h-3.5 w-3.5 shrink-0" />
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="truncate cursor-default">{formatDisplayName(service.messenger.fullName)}</span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{service.messenger.fullName}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                                    <span>{format(new Date(service.createdAt), "PPP", { locale: es })}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                            <Button
                                variant="default"
                                size="lg"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onUpdate(service)
                                }}
                                className="bg-primary hover:bg-primary/90"
                                aria-label="Actualizar"
                            >
                                <Edit className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
