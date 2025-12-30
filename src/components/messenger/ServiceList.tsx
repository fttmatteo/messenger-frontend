import { ServiceCard } from "./ServiceCard"
import { Skeleton } from "@/components/ui/skeleton"
import { Package } from "lucide-react"
import type { ServiceDelivery } from "@/types/service.types"

interface ServiceListProps {
    services: ServiceDelivery[]
    loading: boolean
    emptyMessage?: string
}

export function ServiceList({ services, loading, emptyMessage = "No hay servicios" }: ServiceListProps) {
    // Loading skeletons
    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                ))}
            </div>
        )
    }

    // Empty state
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

    // Service list - Compact List Container
    return (
        <div className="border border-border/50 rounded-lg bg-card overflow-hidden shadow-sm">
            {services.map((service) => (
                <ServiceCard key={service.idServiceDelivery} service={service} />
            ))}
        </div>
    )
}

