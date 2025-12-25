import { useMessengerServices } from "@/hooks/useMessengerServices"
import { ServiceList } from "@/components/messenger/ServiceList"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useState, useMemo } from "react"

export default function ServiciosPage() {
    const { loading, completedServices, error } = useMessengerServices()
    const [searchTerm, setSearchTerm] = useState("")

    // Filter services based on search
    const filteredServices = useMemo(() => {
        if (!searchTerm.trim()) return completedServices

        const term = searchTerm.toLowerCase()
        return completedServices.filter(service =>
            service.plate.plateNumber.toLowerCase().includes(term) ||
            service.dealership.name.toLowerCase().includes(term) ||
            service.dealership.zone?.toLowerCase().includes(term)
        )
    }, [completedServices, searchTerm])

    return (
        <div className="flex flex-col h-full p-3 gap-3">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por placa o concesionario..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-10"
                />
            </div>

            {/* Results count */}
            <p className="text-xs text-muted-foreground">
                {filteredServices.length} servicio{filteredServices.length !== 1 ? 's' : ''} completado{filteredServices.length !== 1 ? 's' : ''}
            </p>

            {/* Services List */}
            <div className="flex-1 overflow-auto">
                <ServiceList
                    services={filteredServices}
                    loading={loading}
                    emptyMessage={searchTerm ? "No se encontraron servicios" : "No hay servicios completados hoy"}
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

