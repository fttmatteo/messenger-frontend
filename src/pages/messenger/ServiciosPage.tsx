import { useMessengerServices } from "@/hooks/useMessengerServices"
import { ServiceList } from "@/components/messenger/ServiceList"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, CalendarIcon } from "lucide-react"
import { useState, useMemo } from "react"
import { format, isSameDay } from "date-fns"
import { es } from "date-fns/locale"

export default function ServiciosPage() {
    const { loading, completedServices, error } = useMessengerServices()
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [calendarOpen, setCalendarOpen] = useState(false)

    // Filter services based on date and search
    const filteredServices = useMemo(() => {
        // First filter by date
        let services = completedServices.filter(service =>
            isSameDay(new Date(service.createdAt), selectedDate)
        )

        // Then filter by search term
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase()
            services = services.filter(service =>
                service.plate.plateNumber.toLowerCase().includes(term) ||
                service.dealership.name.toLowerCase().includes(term) ||
                service.dealership.zone?.toLowerCase().includes(term)
            )
        }

        return services
    }, [completedServices, selectedDate, searchTerm])

    const isToday = isSameDay(selectedDate, new Date())

    return (
        <div className="flex flex-col h-full p-3 gap-3">
            {/* Search Bar + Calendar */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por placa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-10"
                    />
                </div>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 shrink-0"
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
                <p className="text-xs text-muted-foreground">
                    {isToday ? "Hoy" : format(selectedDate, "d MMM yyyy", { locale: es })}
                    {" · "}
                    {filteredServices.length} servicio{filteredServices.length !== 1 ? 's' : ''}
                </p>
                {!isToday && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs px-2"
                        onClick={() => setSelectedDate(new Date())}
                    >
                        Volver a hoy
                    </Button>
                )}
            </div>

            {/* Services List */}
            <div className="flex-1 overflow-auto">
                <ServiceList
                    services={filteredServices}
                    loading={loading}
                    emptyMessage={searchTerm ? "No se encontraron servicios" : `No hay servicios que hayan cambiado de estado para ${isToday ? 'hoy' : 'esta fecha'}`}
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
