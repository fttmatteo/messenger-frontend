import { useMessengerServices } from "@/features/delivery/hooks/use-messenger-services"
import { useNetwork } from "@/shared/hooks/use-network"
import { ServiceList } from "@/features/delivery/components/ServiceList"
import { ChevronDown, RefreshCw, Database, Building2, Navigation, X } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { useState, useMemo, useCallback, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

/**
 * Panel principal (Dashboard) para la aplicación del mensajero.
 * Muestra la lista de servicios pendientes asignados al mensajero actual.
 */
export default function MessengerDashboard() {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const { loading, pendingServices, refetch, error, isFromCache } = useMessengerServices()
    const { isOnline } = useNetwork()
    const [isRefreshing, setIsRefreshing] = useState(false)

    useEffect(() => {
        const savedFilter = sessionStorage.getItem("messenger_dealership_filter")
        if (savedFilter && !searchParams.has("dealership")) {
            setSearchParams(prev => {
                prev.set("dealership", savedFilter)
                return prev
            }, { replace: true })
        }
    }, [searchParams, setSearchParams])

    const selectedDealership = searchParams.get("dealership") || "all"

    useEffect(() => {
        if (selectedDealership === "all") {
            sessionStorage.removeItem("messenger_dealership_filter")
        } else {
            sessionStorage.setItem("messenger_dealership_filter", selectedDealership)
        }
    }, [selectedDealership])

    const handleRefresh = useCallback(async () => {
        if (!isOnline || isRefreshing) return
        setIsRefreshing(true)
        await refetch()
        setIsRefreshing(false)
    }, [isOnline, isRefreshing, refetch])

    const { originDealerships, destinationDealerships } = useMemo(() => {
        const originMap = new Map<number, string>();
        const destMap = new Map<number, string>();
        pendingServices.forEach(s => {
            if (s.originDealership && !originMap.has(s.originDealership.idDealership)) {
                originMap.set(s.originDealership.idDealership, s.originDealership.name);
            }
            if (s.dealership && !destMap.has(s.dealership.idDealership)) {
                destMap.set(s.dealership.idDealership, s.dealership.name);
            }
        });
        return {
            originDealerships: Array.from(originMap.entries()).map(([id, name]) => ({ id, name })),
            destinationDealerships: Array.from(destMap.entries()).map(([id, name]) => ({ id, name }))
        };
    }, [pendingServices]);

    const filteredServices = useMemo(() => {
        if (selectedDealership === "all") return pendingServices;
        const [type, idStr] = selectedDealership.split('-');
        if (!type || !idStr) return pendingServices;

        const filtered = pendingServices.filter(s => {
            if (type === 'orig') return String(s.originDealership.idDealership) === idStr;
            if (type === 'dest') return String(s.dealership.idDealership) === idStr;
            return false;
        });
        return filtered;
    }, [pendingServices, selectedDealership]);

    useEffect(() => {
        if (selectedDealership !== "all" && pendingServices.length > 0 && filteredServices.length === 0) {
            sessionStorage.removeItem("messenger_dealership_filter")
            setSearchParams(prev => {
                prev.delete("dealership")
                return prev
            }, { replace: true })
        }
    }, [filteredServices.length, pendingServices.length, selectedDealership, setSearchParams])

    return (
        <div className="flex flex-col p-3 gap-3 relative min-h-full pb-4">
            <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                    <div className="relative w-full">
                        <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                            <div className="flex shrink-0 items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                                <Building2 className="h-4 w-4 text-primary" strokeWidth={2.5} />
                            </div>
                        </div>
                        <select
                            id="dealership-filter"
                            name="dealership-filter"
                            value={selectedDealership}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSearchParams(prev => {
                                    if (val === "all") prev.delete("dealership");
                                    else prev.set("dealership", val);
                                    return prev;
                                }, { replace: true });
                            }}
                            className="block w-full h-11 pl-12 pr-10 text-base text-foreground bg-card border-border/60 border rounded-2xl shadow-sm appearance-none focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                        >
                            <option value="all">
                                Todos los concesionarios ({pendingServices.length})
                            </option>
                            {originDealerships.length > 0 && (
                                <optgroup label="Origen">
                                    {originDealerships.map((d) => {
                                        const count = pendingServices.filter(s => s.originDealership.idDealership === Number(d.id)).length;
                                        return (
                                            <option key={`orig-${d.id}`} value={`orig-${d.id}`}>
                                                {d.name} ({count})
                                            </option>
                                        );
                                    })}
                                </optgroup>
                            )}
                            {destinationDealerships.length > 0 && (
                                <optgroup label="Destino">
                                    {destinationDealerships.map((d) => {
                                        const count = pendingServices.filter(s => s.dealership.idDealership === Number(d.id)).length;
                                        return (
                                            <option key={`dest-${d.id}`} value={`dest-${d.id}`}>
                                                {d.name} ({count})
                                            </option>
                                        );
                                    })}
                                </optgroup>
                            )}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-muted-foreground">
                            <ChevronDown className="h-4 w-4 opacity-50" />
                        </div>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={isRefreshing || !isOnline}
                    className="h-11 w-11 shrink-0 rounded-2xl bg-card border border-border/60 shadow-sm hover:bg-accent/10 active:scale-95 transition-all"
                >
                    <RefreshCw className={`h-4 w-4 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            <div className="flex items-center justify-between px-1.5 flex-wrap gap-2">
                <p className="text-[11px] font-black text-muted-foreground/80 uppercase tracking-[0.18em]">
                    {filteredServices.length} {selectedDealership !== 'all' ? 'filtrados' : 'asignados'}
                </p>
                <div className="flex items-center gap-1.5 ml-auto">
                    {selectedDealership !== 'all' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                sessionStorage.removeItem("messenger_dealership_filter");
                                setSearchParams(prev => {
                                    prev.delete("dealership");
                                    return prev;
                                }, { replace: true });
                            }}
                            className="h-6 text-[10px] px-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold uppercase tracking-wider active:scale-95 flex items-center gap-1 rounded-lg transition-all"
                        >
                            <X className="h-3 w-3" />
                            Limpiar
                        </Button>
                    )}
                    {pendingServices.length > 1 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate("/messenger/ruta-optimizada")}
                            className="h-6 text-[10px] px-2 text-primary font-bold uppercase tracking-wider hover:bg-primary/5 active:scale-95 flex items-center gap-1 rounded-lg"
                        >
                            <Navigation className="h-3 w-3" />
                            Optimizar
                        </Button>
                    )}
                    {pendingServices.length <= 1 && isFromCache && !loading && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                            <Database className="h-3 w-3" />
                            <span className="text-[10px] font-black uppercase tracking-widest italic">Offline cache</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="">
                <ServiceList
                    services={filteredServices}
                    loading={loading}
                    emptyMessage={selectedDealership === "all" ? "No tienes servicios asignados" : "No hay servicios en este concesionario"}
                />
            </div>


            {error && !loading && (
                <div className="fixed bottom-[calc(6rem+var(--safe-area-bottom))] left-4 right-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl shadow-lg z-40 animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-red-600 dark:text-red-400 text-sm text-center font-medium">
                        {error}
                    </p>
                </div>
            )}
            {/* Spacer for bottom scroll area */}
            <div className="h-4 w-full shrink-0" aria-hidden="true" />
        </div>
    )
}
