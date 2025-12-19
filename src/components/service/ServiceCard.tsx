import { motion } from "framer-motion"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Building2, User, Calendar, Edit, Eye } from "lucide-react"

// Components
import { PlacaBadge } from "@/components/PlacaBadge"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Utils
import { getStatusBadge, getPlateTypeLabel } from "@/lib/status-utils"

// Types
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

    return (
        <motion.div exit="exit" layout>
            <Card className="mb-3 hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2 min-w-0">
                            <div className="flex flex-col items-start gap-2">
                                <div className="flex flex-col items-center gap-2 w-fit">
                                    <Badge className={`${statusConfig.className} text-base px-3 py-1`}>
                                        {statusConfig.label}
                                    </Badge>
                                    <div className="flex flex-col items-center">
                                        <PlacaBadge
                                            plateNumber={service.plate.plateNumber}
                                            plateType={service.plate.plateType}
                                            size="md"
                                        />
                                        <span className="text-sm text-muted-foreground mt-0.5 uppercase font-semibold">
                                            {getPlateTypeLabel(service.plate.plateType)}
                                        </span>
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
                                    <span className="truncate">{service.messenger.fullName}</span>
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
                                size="sm"
                                onClick={() => onUpdate(service)}
                                className="bg-primary hover:bg-primary/90"
                            >
                                <Edit className="h-4 w-4 mr-1" />
                                Actualizar
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onViewDetails(service.idServiceDelivery)}
                            >
                                <Eye className="h-4 w-4 mr-1" />
                                Detalles
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
