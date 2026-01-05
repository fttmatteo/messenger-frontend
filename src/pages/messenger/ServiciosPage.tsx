import { useMessengerServices } from "@/hooks/use-messenger-services"
import { ServiceList } from "@/components/messenger/ServiceList"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, CalendarIcon, Filter, Check } from "lucide-react"
import { useState, useMemo } from "react"
import { format, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { getStatusLabel } from "@/lib/status-colors"
import { getStatusIconConfig } from "@/lib/status-utils"
import { cn } from "@/lib/utils"
import { useStatusColors } from "@/hooks/use-status-colors"
import { useDeviceType } from "@/hooks/use-device-type"

export default function ServiciosPage() {
    const { loading, completedServices, error } = useMessengerServices()
    const { colors } = useStatusColors()
    const { isIOS } = useDeviceType()
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [calendarOpen, setCalendarOpen] = useState(false)
    const [statusFilterOpen, setStatusFilterOpen] = useState(false)
    const [statusFilter, setStatusFilter] = useState<string>("all")

    // Get the last status change date for a service
    const getLastChangeDate = (service: typeof completedServices[0]) => {
        if (service.history && service.history.length > 0) {
            // Get the most recent change date from history
            const lastChange = service.history[service.history.length - 1]
            return new Date(lastChange.changeDate)
        }
        return new Date(service.createdAt)
    }

    const filteredServices = useMemo(() => {
        // We use global search if there's a search term OR a status filter active.
        // Otherwise, we filter by the selected date.
        const isGlobalSearch = searchTerm.trim() !== "" || statusFilter !== "all"

        let services = isGlobalSearch
            ? completedServices
            : completedServices.filter(service =>
                isSameDay(getLastChangeDate(service), selectedDate)
            )

        // Apply Status Filter
        if (statusFilter !== "all") {
            services = services.filter(s => s.currentStatus === statusFilter)
        }

        // Apply Plate/Dealership Search filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase()
            services = services.filter(service =>
                service.plate.plateNumber.toLowerCase().includes(term) ||
                service.dealership.name.toLowerCase().includes(term) ||
                service.dealership.zone?.toLowerCase().includes(term)
            )
        }

        return services
    }, [completedServices, selectedDate, searchTerm, statusFilter])

    const isToday = isSameDay(selectedDate, new Date())

    return (
        <div className="flex flex-col h-full p-3 gap-3">
            {/* Search Bar + Filters */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="search-services"
                        name="search"
                        autoComplete="off"
                        placeholder="Buscar por placa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-10 border-input/60"
                    />
                </div>

                {/* Status Filter Popover */}
                <Popover open={statusFilterOpen} onOpenChange={setStatusFilterOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                                "h-10 w-10 shrink-0 border-input/60",
                                statusFilter !== 'all' && "text-primary border-primary bg-primary/5 shadow-sm"
                            )}
                        >
                            <Filter className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-2" align="end">
                        <div className="space-y-1">
                            <button
                                onClick={() => { setStatusFilter("all"); setStatusFilterOpen(false); }}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors",
                                    statusFilter === "all" ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                                )}
                            >
                                <span>Ver todos</span>
                                {statusFilter === "all" && <Check className="h-4 w-4" />}
                            </button>
                            <div className="h-px bg-border my-1" />
                            {['PENDING', 'DELIVERED', 'RETURNED', 'CANCELED', 'RESOLVED'].map((status) => {
                                const config = getStatusIconConfig(status, colors);
                                const isSelected = statusFilter === status;
                                return (
                                    <button
                                        key={status}
                                        onClick={() => { setStatusFilter(status); setStatusFilterOpen(false); }}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                                            isSelected ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                                        )}
                                    >
                                        <div className="w-2.5 h-2.5 rounded-full" style={config.dotStyle} />
                                        <span className="flex-1 text-left">{config.label}</span>
                                        {isSelected && <Check className="h-4 w-4" />}
                                    </button>
                                );
                            })}
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Date Filter Popover */}
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 shrink-0 border-input/60"
                        >
                            <CalendarIcon className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                                if (date) {
                                    setSelectedDate(date)
                                    setCalendarOpen(false)
                                }
                            }}
                            locale={es}
                            disabled={(date) => date > new Date()}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Date indicator + Results count */}
            <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 overflow-hidden">
                    {statusFilter !== 'all' && (
                        <span className="font-semibold text-primary shrink-0">
                            {getStatusLabel(statusFilter)}
                        </span>
                    )}
                    {statusFilter !== 'all' && <span className="shrink-0">·</span>}
                    <span className="truncate">
                        {searchTerm.trim() || statusFilter !== "all"
                            ? "Historial global"
                            : (isToday ? "Hoy" : format(selectedDate, "d MMM yyyy", { locale: es }))
                        }
                    </span>
                    <span className="shrink-0">·</span>
                    <span className="font-medium shrink-0">{filteredServices.length} servicio{filteredServices.length !== 1 ? 's' : ''}</span>
                </p>
                {!isToday && !searchTerm.trim() && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] px-2 text-primary font-semibold hover:bg-primary/5"
                        onClick={() => setSelectedDate(new Date())}
                    >
                        Volver a hoy
                    </Button>
                )}
            </div>

            {/* Services List */}
            <div className={`flex-1 overflow-auto ${isIOS ? 'pb-[104px]' : 'pb-[92px]'}`}>
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

            {/* Error State */}
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
