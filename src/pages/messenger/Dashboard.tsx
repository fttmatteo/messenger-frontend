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
        <div className="flex flex-col">
            <div className={`flex flex-col p-3 gap-3`}>
                {/* Header with Dealership Filter */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <Select value={selectedDealership} onValueChange={setSelectedDealership} name="dealership-filter">
                            <SelectTrigger
                                id="dealership-filter"
                                className="w-full h-12 px-4 bg-card/80 backdrop-blur-xl border-border/30 rounded-2xl shadow-lg hover:bg-card/90 transition-all duration-200"
                            >
                                <div className="flex items-center gap-3 truncate">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10">
                                        <Building2 className="h-4 w-4 text-primary" />
                                    </div>
                                    <SelectValue placeholder="Filtrar por concesionario" />
                                </div>
                            </SelectTrigger>
                            <SelectContent align="start" className="rounded-2xl border-border/30 bg-card/95 backdrop-blur-xl shadow-2xl">
                                <SelectItem value="all" className="font-semibold rounded-xl my-1">
                                    <div className="flex items-center gap-2">
                                        <span>Todos los concesionarios</span>
                                        <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">{pendingServices.length}</span>
                                    </div>
                                </SelectItem>
                                {dealerships.map((d) => {
                                    const count = pendingServices.filter(s => s.dealership.idDealership === Number(d.id)).length;
                                    return (
                                        <SelectItem key={d.id} value={String(d.id)} className="rounded-xl my-0.5">
                                            <div className="flex items-center gap-2">
                                                <span>{d.name}</span>
                                                <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">{count}</span>
                                            </div>
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
                        className="h-12 w-12 shrink-0 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/30 shadow-lg hover:bg-card/90"
                    >
                        <RefreshCw className={`h-5 w-5 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
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
                <div className="">
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

