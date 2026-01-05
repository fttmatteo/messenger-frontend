import { useMessengerServices } from "@/hooks/use-messenger-services"
import { useNetwork } from "@/hooks/use-network"
import { ServiceList } from "@/components/messenger/ServiceList"
import { RefreshCw, Database, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useMemo } from "react"

export default function MessengerDashboard() {
    const { loading, pendingServices, refetch, error, isFromCache } = useMessengerServices()
    const { isOnline } = useNetwork()
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [selectedDealership, setSelectedDealership] = useState<string>("all")

    const handleRefresh = async () => {
        if (!isOnline || isRefreshing) return
        setIsRefreshing(true)
        await refetch()
        setIsRefreshing(false)
    }

    // Extract unique dealerships from available services
    const dealerships = useMemo(() => {
        const map = new Map();
        pendingServices.forEach(s => {
            if (s.dealership && !map.has(s.dealership.idDealership)) {
                map.set(s.dealership.idDealership, s.dealership.name);
            }
        });
        return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    }, [pendingServices]);

    // Filter services
    const filteredServices = useMemo(() => {
        if (selectedDealership === "all") return pendingServices;
        return pendingServices.filter(s => String(s.dealership.idDealership) === selectedDealership);
    }, [pendingServices, selectedDealership]);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex flex-col h-full p-3 gap-3 overflow-auto pb-32">
                {/* Header with Dealership Filter */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <Select value={selectedDealership} onValueChange={setSelectedDealership}>
                            <SelectTrigger className="w-full h-10 border-input/60 bg-background/50 backdrop-blur-sm shadow-sm">
                                <div className="flex items-center gap-2 truncate">
                                    <Building2 className="h-4 w-4 text-primary shrink-0" />
                                    <SelectValue placeholder="Filtrar por concesionario" />
                                </div>
                            </SelectTrigger>
                            <SelectContent align="start">
                                <SelectItem value="all" className="font-medium">
                                    Todos los concesionarios - {pendingServices.length}
                                </SelectItem>
                                {dealerships.map((d) => {
                                    const count = pendingServices.filter(s => s.dealership.idDealership === Number(d.id)).length;
                                    return (
                                        <SelectItem key={d.id} value={String(d.id)}>
                                            {d.name}<span className="text-muted-foreground ml-1">- {count}</span>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRefresh}
                        disabled={isRefreshing || !isOnline}
                        className="h-10 w-10 shrink-0 rounded-lg"
                    >
                        <RefreshCw className={`h-4 w-4 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                </div>

                {/* Sub-header info */}
                <div className="flex items-center justify-between px-1">
                    <p className="text-xs text-muted-foreground font-medium">
                        {filteredServices.length} servicio{filteredServices.length !== 1 ? 's' : ''} visible{filteredServices.length !== 1 ? 's' : ''}
                    </p>
                    {isFromCache && !loading && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/60 bg-muted/30 px-1.5 py-0.5 rounded-full">
                            <Database className="h-2.5 w-2.5" />
                            cache
                        </span>
                    )}
                </div>

                {/* Assigned Services List */}
                <div className="flex-1 overflow-auto">
                    <ServiceList
                        services={filteredServices}
                        loading={loading}
                        emptyMessage={selectedDealership === "all" ? "No tienes servicios asignados" : "No hay servicios en este concesionario"}
                    />
                </div>

                {/* Error State */}
                {error && !loading && (
                    <div className="fixed bottom-24 left-4 right-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg z-40">
                        <p className="text-red-600 dark:text-red-400 text-sm text-center">
                            {error}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

