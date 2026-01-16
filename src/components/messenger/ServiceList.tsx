import { ServiceCard } from "./ServiceCard"
import { Package } from "lucide-react"
import type { ServiceDelivery } from "@/types/service.types"
import { ServiceListSkeleton } from "@/components/service/ServiceSkeletons"

interface ServiceListProps {
    services: ServiceDelivery[]
    loading: boolean
    emptyMessage?: string
}

export function ServiceList({ services, loading, emptyMessage = "No hay servicios" }: ServiceListProps) {
    if (loading) {
        return <ServiceListSkeleton count={3} />
    }

    if (services.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 rounded-full bg-muted/50 mb-4">
                    <Package className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">{emptyMessage}</p>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            {services.map((service) => (
                <ServiceCard key={service.idServiceDelivery} service={service} />
            ))}
        </div>
    )
}

