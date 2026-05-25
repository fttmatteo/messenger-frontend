import { useMessengerServices } from "@/features/delivery/hooks/use-messenger-services"
import { ServiceList } from "@/features/delivery/components/ServiceList"
import { Input } from "@/shared/components/ui/input"
import { Button } from "@/shared/components/ui/button"
import { Search, CalendarIcon, Filter } from "lucide-react"
import { useMemo, useCallback } from "react"
import { format, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { getStatusLabel } from "@/shared/lib/status-colors"
import { cn } from "@/shared/lib/utils"
import { useSearchParams } from "react-router-dom"

/**
 * Página principal de listado de servicios para el perfil Mensajero.
 * Proporciona funcionalidades de búsqueda, filtrado por fecha y estado,
 * y visualización del historial completo de entregas y asignaciones.
 */
export default function ServicesPage() {
    const { loading, completedServices, error } = useMessengerServices()
    const [searchParams, setSearchParams] = useSearchParams()

    const searchTerm = searchParams.get("q") || ""
    const statusFilter = searchParams.get("status") || "all"
    const dateParam = searchParams.get("date")
    const selectedDate = useMemo(() => {
        if (dateParam) {
            const [y, m, d] = dateParam.split('-')
            if (y && m && d) {
                return new Date(Number(y), Number(m) - 1, Number(d))
            }
        }
        return new Date()
    }, [dateParam])

    const setSearchTerm = (val: string) => {
        setSearchParams(prev => {
            if (!val) prev.delete("q")
            else prev.set("q", val)
            return prev
        }, { replace: true })
    }

    const setStatusFilter = (val: string) => {
        setSearchParams(prev => {
            if (val === "all") prev.delete("status")
            else prev.set("status", val)
            return prev
        }, { replace: true })
    }

    const setSelectedDate = (val: Date) => {
        setSearchParams(prev => {
            if (isSameDay(val, new Date())) prev.delete("date")
            else prev.set("date", format(val, "yyyy-MM-dd"))
            return prev
        }, { replace: true })
    }

    const getLastChangeDate = useCallback((service: typeof completedServices[0]) => {
        if (service.history && service.history.length > 0) {
            const lastChange = service.history[service.history.length - 1]
            return new Date(lastChange.changeDate)
        }
        return new Date(service.createdAt)
    }, [])

    const filteredServices = useMemo(() => {
        const isGlobalSearch = searchTerm.trim() !== "" || statusFilter !== "all"

        let services = isGlobalSearch
            ? completedServices
            : completedServices.filter(service =>
                isSameDay(getLastChangeDate(service), selectedDate)
            )

        if (statusFilter !== "all") {
            services = services.filter(s => s.currentStatus === statusFilter)
        }

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase()
            services = services.filter(service =>
                service.plate.plateNumber.toLowerCase().includes(term) ||
                service.dealership.name.toLowerCase().includes(term) ||
                service.dealership.zone?.toLowerCase().includes(term) ||
                service.originDealership?.name.toLowerCase().includes(term) ||
                service.originDealership?.zone?.toLowerCase().includes(term)
            )
        }

        return [...services].sort((a, b) =>
            getLastChangeDate(b).getTime() - getLastChangeDate(a).getTime()
        )
    }, [completedServices, selectedDate, searchTerm, statusFilter, getLastChangeDate])

    const isToday = isSameDay(selectedDate, new Date())

    return (
        <div className="flex flex-col p-3 gap-3 pb-8">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={2.5} />
                    <Input
                        id="search-services"
                        name="search"
                        autoComplete="off"
                        placeholder="Buscar por chasis..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-10 border-input/60"
                    />
                </div>

                <div className="relative">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer text-base bg-background text-foreground"
                    >
                        <option value="all">Ver todos los estados</option>
                        {['PENDING', 'DELIVERED', 'RETURNED', 'CANCELED', 'RESOLVED'].map((status) => (
                            <option key={status} value={status}>
                                {getStatusLabel(status)}
                            </option>
                        ))}
                    </select>
                    <Button
                        variant="outline"
                        size="icon"
                        type="button"
                        className={cn(
                            "h-10 w-10 shrink-0 border-input/60 relative z-0 pointer-events-none",
                            statusFilter !== 'all' && "text-primary border-primary bg-primary/5 shadow-sm"
                        )}
                    >
                        <Filter className="h-4 w-4" strokeWidth={2.5} />
                    </Button>
                </div>

                <div className="relative">
                    <input
                        type="date"
                        value={format(selectedDate, "yyyy-MM-dd")}
                        max={format(new Date(), "yyyy-MM-dd")}
                        onChange={(e) => {
                            if (e.target.value) {
                                const [y, m, d] = e.target.value.split('-');
                                setSelectedDate(new Date(Number(y), Number(m) - 1, Number(d)));
                            }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer text-base bg-background text-foreground"
                    />
                    <Button
                        variant="outline"
                        size="icon"
                        type="button"
                        className="h-10 w-10 shrink-0 border-input/60 relative z-0 pointer-events-none"
                    >
                        <CalendarIcon className="h-4 w-4" strokeWidth={2.5} />
                    </Button>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-[11px] font-black text-muted-foreground/80 flex items-center gap-1.5 overflow-hidden uppercase tracking-[0.18em]">
                    {statusFilter !== 'all' && (
                        <span className="text-primary shrink-0">
                            {getStatusLabel(statusFilter)}
                        </span>
                    )}
                    {statusFilter !== 'all' && <span className="shrink-0 opacity-40">·</span>}
                    <span className="truncate">
                        {searchTerm.trim() || statusFilter !== "all"
                            ? "Historial global"
                            : (isToday ? "Hoy" : format(selectedDate, "d MMM yyyy", { locale: es }))
                        }
                    </span>
                    <span className="shrink-0 opacity-40">·</span>
                    <span className="shrink-0">{filteredServices.length} servicio{filteredServices.length !== 1 ? 's' : ''}</span>
                </p>
                {!isToday && !searchTerm.trim() && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] px-2 text-primary font-bold uppercase tracking-wider hover:bg-primary/5 active:scale-95"
                        onClick={() => setSelectedDate(new Date())}
                    >
                        Volver a hoy
                    </Button>
                )}
            </div>

            <div className="">
                <ServiceList
                    services={filteredServices}
                    loading={loading}
                    emptyMessage={
                        statusFilter !== 'all'
                            ? `No hay servicios "${getStatusLabel(statusFilter)}"`
                            : searchTerm ? "No se encontraron resultados"
                                : `No hay servicios para esta fecha`
                    }
                />
            </div>

            {error && !loading && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-600 dark:text-red-400 text-sm text-center">
                        {error}
                    </p>
                </div>
            )}
        </div>
    )
}
