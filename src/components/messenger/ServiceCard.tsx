import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "./StatusBadge"
import { MapPin, Clock, ChevronRight } from "lucide-react"
import type { ServiceDelivery } from "@/types/service.types"
import { useNavigate } from "react-router-dom"

interface ServiceCardProps {
    service: ServiceDelivery
}

export function ServiceCard({ service }: ServiceCardProps) {
    const navigate = useNavigate()

    const handleClick = () => {
        navigate(`/messenger/servicio/${service.idServiceDelivery}`)
    }

    // Format time
    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
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
            <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                    {/* Main Content */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                        {/* Plate Number - Prominent */}
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-base tracking-wide font-mono">
                                {service.plate.plateNumber}
                            </span>
                            <StatusBadge status={service.currentStatus} size="sm" />
                        </div>

                        {/* Dealership Name */}
                        <p className="text-sm font-medium text-foreground truncate">
                            {service.dealership.name}
                        </p>

                        {/* Address */}
                        <div className="flex items-start gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-1">
                                {service.dealership.address || 'Sin dirección'}
                            </span>
                        </div>

                        {/* Time Info */}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(service.createdAt)} · {formatTime(service.createdAt)}</span>
                        </div>
                    </div>

                    {/* Chevron */}
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-2" />
                </div>
            </CardContent>
        </Card>
    )
}
