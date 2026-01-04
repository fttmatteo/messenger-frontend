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
    // Loading skeletons - matches ServiceCard layout
    if (loading) {
        return (
            <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="relative flex items-center bg-card border border-border/50 rounded-lg overflow-hidden shadow-sm"
                    >
                        {/* Status Strip Skeleton */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-muted animate-pulse" />

                        <div className="flex items-center w-full pl-4 pr-3 py-3 gap-3">
                            {/* Plate Badge Skeleton */}
                            <Skeleton className="h-9 w-24 rounded-md" />

                            {/* Spacer */}
                            <div className="flex-1" />

                            {/* Action Buttons Skeleton */}
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                        </div>
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

    // Service list - Compact List Container with subtle spacing
    return (
        <div className="space-y-2">
            {services.map((service) => (
                <ServiceCard key={service.idServiceDelivery} service={service} />
            ))}
        </div>
    )
}

