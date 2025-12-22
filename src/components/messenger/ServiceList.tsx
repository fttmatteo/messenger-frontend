import { ServiceCard } from "./ServiceCard"
import { Skeleton } from "@/components/ui/skeleton"
import { Package, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ServiceDelivery } from "@/types/service.types"

interface ServiceListProps {
    services: ServiceDelivery[]
    loading: boolean
    emptyMessage?: string
    onRefresh?: () => void
}

export function ServiceList({ services, loading, emptyMessage = "No hay servicios", onRefresh }: ServiceListProps) {
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
                <p className="text-muted-foreground text-sm mb-4">{emptyMessage}</p>
                {onRefresh && (
                    <Button variant="outline" size="sm" onClick={onRefresh}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Actualizar
                    </Button>
                )}
            </div>
        )
    }

    // Service list
    return (
        <div className="space-y-3">
            {services.map((service) => (
                <ServiceCard key={service.idServiceDelivery} service={service} />
            ))}
        </div>
    )
}
