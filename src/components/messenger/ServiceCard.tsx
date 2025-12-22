import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "./StatusBadge"
import { MapPin, Clock, ChevronRight } from "lucide-react"
import type { ServiceDelivery } from "@/types/service.types"
import { useNavigate } from "react-router-dom"
import { PlacaBadge } from "@/components/PlacaBadge"

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

    return (
        <Card
            className="active:bg-muted/50 active:scale-[0.99] transition-all cursor-pointer touch-manipulation border-l-4"
            style={{
                borderLeftColor: service.currentStatus === 'ASSIGNED' ? '#3b82f6' :
                    service.currentStatus === 'DELIVERED' ? '#22c55e' :
                        service.currentStatus === 'RETURNED' ? '#f97316' :
                            service.currentStatus === 'CANCELED' ? '#ef4444' : '#a855f7'
            }}
            onClick={handleClick}
        >
            <CardContent className="p-2.5 sm:p-3">
                <div className="flex items-center justify-between gap-2">
                    {/* Main Content */}
                    <div className="flex-1 min-w-0 grid gap-1">
                        <div className="flex items-center justify-between mr-1">
                            <PlacaBadge
                                plateNumber={service.plate.plateNumber}
                                plateType={service.plate.plateType}
                                size="sm"
                                className="scale-90 origin-left"
                            />
                            <StatusBadge status={service.currentStatus} size="sm" className="scale-90 origin-right" />
                        </div>

                        {/* Dealership Name */}
                        <p className="text-sm font-medium text-foreground truncate leading-none">
                            {service.dealership.name}
                        </p>

                        {/* Footer: Address & Time */}
                        <div className="flex items-center gap-3 text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                            <div className="flex items-center gap-1 min-w-0">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">
                                    {service.dealership.address || 'Sin dirección'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0 ml-auto mr-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatDate(service.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Chevron */}
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                </div>
            </CardContent>
        </Card>
    )
}
