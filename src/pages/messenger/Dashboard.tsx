import { useMessengerServices } from "@/hooks/use-messenger-services"
import { useNetwork } from "@/hooks/use-network"
import { ServiceList } from "@/components/messenger/ServiceList"
import { RefreshCw, Database, Building2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useMemo, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"

/**
 * Panel principal (Dashboard) para la aplicación del mensajero.
 * Muestra la lista de servicios pendientes asignados al mensajero actual.
 */
export default function MessengerDashboard() {
    const { loading, pendingServices, refetch, error, isFromCache } = useMessengerServices()
    const { isOnline } = useNetwork()
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [selectedDealership, setSelectedDealership] = useState<string>("all")
    const navigate = useNavigate()

    // Lógica para ocultar/mostrar FAB al hacer scroll
    const [isFabVisible, setIsFabVisible] = useState(true)
    const lastScrollY = useRef(0)

    useEffect(() => {
        const mainContent = document.getElementById('main-content')
        if (!mainContent) return

        const handleScroll = () => {
            const currentScrollY = mainContent.scrollTop
            
            // Si scrollea hacia abajo y ha pasado un umbral, ocultar
            if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                setIsFabVisible(false)
            } 
            // Si scrollea hacia arriba, mostrar
            else if (currentScrollY < lastScrollY.current) {
                setIsFabVisible(true)
            }
            
            lastScrollY.current = currentScrollY
        }

        mainContent.addEventListener('scroll', handleScroll, { passive: true })
        return () => mainContent.removeEventListener('scroll', handleScroll)
    }, [])

    const handleRefresh = async () => {
        if (!isOnline || isRefreshing) return
        setIsRefreshing(true)
        await refetch()
        setIsRefreshing(false)
    }

    // Extraer concesionarios únicos de los servicios disponibles
    const dealerships = useMemo(() => {
        const map = new Map();
        pendingServices.forEach(s => {
            if (s.dealership && !map.has(s.dealership.idDealership)) {
                map.set(s.dealership.idDealership, s.dealership.name);
            }
        });
        return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    }, [pendingServices]);

    // Filtrar servicios
    const filteredServices = useMemo(() => {
        if (selectedDealership === "all") return pendingServices;
        return pendingServices.filter(s => String(s.dealership.idDealership) === selectedDealership);
    }, [pendingServices, selectedDealership]);

    return (
        <div className="flex flex-col p-3 gap-3 relative min-h-full pb-20">
            <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                    <Select value={selectedDealership} onValueChange={setSelectedDealership} name="dealership-filter">
                        <SelectTrigger
                            id="dealership-filter"
                            className="w-full h-11 px-3 bg-card border-border/60 rounded-2xl shadow-sm hover:bg-accent/10 transition-all duration-200 outline-none ring-0 focus:ring-1 focus:ring-primary/20"
                        >
                            <div className="flex items-center gap-2.5 w-full min-w-0">
                                <div className="flex shrink-0 items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                                    <Building2 className="h-4 w-4 text-primary" strokeWidth={2.5} />
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <SelectValue placeholder="Filtrar por concesionario" />
                                </div>
                            </div>
                        </SelectTrigger>
                        <SelectContent align="start" className="w-[280px] rounded-2xl border-border/60 bg-card shadow-2xl p-1 custom-scrollbar">
                            <SelectItem value="all" className="rounded-xl font-semibold my-0.5">
                                <div className="flex items-center justify-between w-full gap-4">
                                    <span className="truncate">Todos los concesionarios</span>
                                    <span className="shrink-0 text-[10px] font-bold text-muted-foreground bg-muted/80 px-1.5 py-0.5 rounded-md min-w-[1.5rem] text-center">
                                        {pendingServices.length}
                                    </span>
                                </div>
                            </SelectItem>
                            {dealerships.map((d) => {
                                const count = pendingServices.filter(s => s.dealership.idDealership === Number(d.id)).length;
                                return (
                                    <SelectItem key={d.id} value={String(d.id)} className="rounded-xl my-0.5">
                                        <div className="flex items-center justify-between w-full gap-4">
                                            <span className="truncate">{d.name}</span>
                                            <span className="shrink-0 text-[10px] font-bold text-muted-foreground bg-muted/80 px-1.5 py-0.5 rounded-md min-w-[1.5rem] text-center">
                                                {count}
                                            </span>
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
                    className="h-11 w-11 shrink-0 rounded-2xl bg-card border border-border/60 shadow-sm hover:bg-accent/10 active:scale-95 transition-all"
                >
                    <RefreshCw className={`h-4 w-4 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            <div className="flex items-center justify-between px-1.5">
                <p className="text-[11px] font-black text-muted-foreground/80 uppercase tracking-[0.18em]">
                    {filteredServices.length} {filteredServices.length !== 1 ? 'Servicios' : 'Servicio'} {selectedDealership !== 'all' ? 'Filtrados' : 'Pendientes'}
                </p>
                {isFromCache && !loading && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                        <Database className="h-3 w-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest italic">offline cache</span>
                    </div>
                )}
            </div>

            <div className="">
                <ServiceList
                    services={filteredServices}
                    loading={loading}
                    emptyMessage={selectedDealership === "all" ? "No tienes servicios asignados" : "No hay servicios en este concesionario"}
                />
            </div>

            <AnimatePresence>
                {isFabVisible && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: 20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="fixed bottom-[calc(1rem+var(--safe-area-bottom))] left-1/2 -translate-x-1/2 z-50"
                    >
                        <Button
                            onClick={() => navigate('/messenger/crear')}
                            className="h-14 w-14 rounded-full bg-primary shadow-[0_8px_30px_rgb(0,0,0,0.15)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-primary/20 hover:scale-110 active:scale-90 transition-all duration-300 group"
                            size="icon"
                        >
                            <div className="relative flex items-center justify-center">
                                <Plus className="h-7 w-7 text-primary-foreground group-hover:rotate-90 transition-transform duration-500 ease-out" strokeWidth={3} />
                            </div>
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && !loading && (
                <div className="fixed bottom-[calc(6rem+var(--safe-area-bottom))] left-4 right-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl shadow-lg z-40 animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-red-600 dark:text-red-400 text-sm text-center font-medium">
                        {error}
                    </p>
                </div>
            )}
        </div>
    )
}
