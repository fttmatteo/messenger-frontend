import { useNavigate, useOutletContext } from "react-router-dom"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { ServiceDelivery, ServiceStatus } from "@/types/service.types"
import { useServices } from "@/hooks/use-services"
import { listItemVariants } from "@/lib/animation-variants"
import { SortIndicator } from "@/components/ui/sort-indicator"
import { ListEmptyState } from "@/components/ui/list-empty-state"
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb"
import { PlacaBadge } from "@/components/PlacaBadge"
import { TableRowSkeleton } from "@/components/service/ServiceSkeletons"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TablePagination } from "@/components/ui/table-pagination"
import { Bike, Car, Calendar, Building2, User, PackageCheck, Settings, Edit, X, Plus } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { getStatusIconConfig } from "@/lib/status-utils"
import { formatDisplayName } from "@/lib/format-utils"
import { useStatusColors } from "@/hooks/use-status-colors"
import { UpdateStatusModal } from "@/components/service/UpdateStatusModal"

// Estados disponibles para selección
const AVAILABLE_STATUSES: { value: ServiceStatus; label: string }[] = [
    { value: 'ASSIGNED', label: 'Asignado' },
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'DELIVERED', label: 'Entregado' },
    { value: 'RETURNED', label: 'Devuelto' },
    { value: 'CANCELED', label: 'Cancelado' },
    { value: 'RESOLVED', label: 'Revisado' },
]

/**
 * Página de administración de servicios de entrega.
 * Muestra una lista paginada de todos los servicios registrados.
 * Permite filtrar por estado, buscar por chasis, concesionario o transportista,
 * y realizar actualizaciones rápidas de estado mediante un modal.
 */
export default function Servicios() {
    const navigate = useNavigate()
    const outletContext = useOutletContext<{ searchQuery?: string }>()
    const searchQuery = outletContext?.searchQuery || ""
    const { colors } = useStatusColors()

    const {
        services,
        loading,
        currentPage,
        totalPages,
        totalElements,
        itemsPerPage,
        setCurrentPage,
        setItemsPerPage,
        sortField,
        sortDirection,
        handleSort,
        statusFilter,
        setStatusFilter,
        fetchServices,
    } = useServices({ searchQuery })

    // Estado del modal
    const [selectedService, setSelectedService] = useState<ServiceDelivery | null>(null)
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)

    const handleUpdateStatus = (service: ServiceDelivery) => {
        setSelectedService(service)
        setIsUpdateModalOpen(true)
    }

    const handleUpdateSuccess = () => {
        fetchServices() // refresca la lista
    }

    const filterLabel = (statusFilter?.length ?? 0) > 0
        ? `${statusFilter.length} filtro${statusFilter.length > 1 ? 's' : ''} activo${statusFilter.length > 1 ? 's' : ''}`
        : undefined

    return (
        <div className="flex flex-col h-full gap-1 overflow-hidden">
            <Card className="flex flex-row items-center justify-between min-h-[48px] !py-2 !px-4 mb-2 gap-4 shrink-0 rounded-xl">
                <div className="flex-1">
                    <AdminBreadcrumb segments={[{ label: "Servicios" }]} />
                </div>

                <div className="flex-1 flex items-center justify-center gap-3">
                    <h1 className="text-xl md:text-2xl font-bold whitespace-nowrap">Servicios</h1>
                    <Select
                        value={(statusFilter?.length ?? 0) === 1 ? statusFilter[0] : "all"}
                        onValueChange={(value) => {
                            if (value === "all") setStatusFilter([])
                            else setStatusFilter([value as ServiceStatus])
                        }}
                    >
                        <SelectTrigger className="h-8 w-[160px] text-xs">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="text-xs">Todos los Estados</SelectItem>
                            {AVAILABLE_STATUSES.map(status => (
                                <SelectItem key={status.value} value={status.value} className="text-xs">{status.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {(statusFilter?.length ?? 0) > 0 && (
                        <Button variant="ghost" size="sm" onClick={() => setStatusFilter([])} className="h-8 text-xs">
                            <X className="h-3 w-3 mr-1" />Limpiar
                        </Button>
                    )}
                </div>

                <div className="hidden md:flex md:flex-1 justify-end">
                    <Button onClick={() => navigate("/admin/servicios/crear")} size="sm" className="shrink-0 h-8 text-xs">
                        <Plus className="h-3 w-3 mr-1" />
                        Nuevo Servicio
                    </Button>
                </div>
            </Card>

            <Card className="flex-1 flex flex-col gap-1 py-1 min-h-0 !overflow-hidden">
                <CardContent className="flex-1 flex flex-col min-h-0 !overflow-hidden">
                    {loading ? (
                        <div className="flex-1 overflow-auto min-h-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Chasis</TableHead>
                                        <TableHead>Origen</TableHead>
                                        <TableHead>Destino</TableHead>
                                        <TableHead>Transportista</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Creado</TableHead>
                                        <TableHead>Acción</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (services?.length ?? 0) === 0 ? (
                        <div className="flex-1 flex items-center justify-center h-full">
                            <ListEmptyState
                                isSearchResult={!!searchQuery}
                                searchQuery={searchQuery}
                                emptyIcon={<PackageCheck />}
                                emptyTitle="Sin Servicios"
                                emptyDescription="Aún No Hay Servicios de Entrega Registrados en el Sistema"
                                className="py-0"
                            />
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-auto min-h-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px] cursor-pointer hover:bg-muted/50 transition-colors select-none" onClick={() => handleSort("plateNumber")}>
                                                <div className="flex items-center">
                                                    <Car className="h-4 w-4 mr-1" />Chasis
                                                    <SortIndicator field="plateNumber" currentSortField={sortField} sortDirection={sortDirection} />
                                                </div>
                                            </TableHead>
                                            <TableHead className="max-w-[150px] md:max-w-[200px] cursor-pointer hover:bg-muted/50 transition-colors select-none truncate" onClick={() => handleSort("originDealershipName")}>
                                                <div className="flex items-center">
                                                    <Building2 className="h-4 w-4 mr-1 shrink-0" />Origen
                                                    <SortIndicator field="originDealershipName" currentSortField={sortField} sortDirection={sortDirection} />
                                                </div>
                                            </TableHead>
                                            <TableHead className="max-w-[150px] md:max-w-[200px] cursor-pointer hover:bg-muted/50 transition-colors select-none truncate" onClick={() => handleSort("dealershipName")}>
                                                <div className="flex items-center">
                                                    <Building2 className="h-4 w-4 mr-1 shrink-0" />Destino
                                                    <SortIndicator field="dealershipName" currentSortField={sortField} sortDirection={sortDirection} />
                                                </div>
                                            </TableHead>
                                            <TableHead className="max-w-[150px] md:max-w-[200px] cursor-pointer hover:bg-muted/50 transition-colors select-none truncate" onClick={() => handleSort("messengerName")}>
                                                <div className="flex items-center">
                                                    <User className="h-4 w-4 mr-1 shrink-0" />Transportista
                                                    <SortIndicator field="messengerName" currentSortField={sortField} sortDirection={sortDirection} />
                                                </div>
                                            </TableHead>
                                            <TableHead className="w-[140px] cursor-pointer hover:bg-muted/50 transition-colors select-none" onClick={() => handleSort("currentStatus")}>
                                                <div className="flex items-center">
                                                    <Bike className="h-4 w-4 mr-1" />Estado
                                                    <SortIndicator field="currentStatus" currentSortField={sortField} sortDirection={sortDirection} />
                                                </div>
                                            </TableHead>
                                            <TableHead className="w-[120px] cursor-pointer hover:bg-muted/50 transition-colors select-none" onClick={() => handleSort("createdAt")}>
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-1" />Creado
                                                    <SortIndicator field="createdAt" currentSortField={sortField} sortDirection={sortDirection} />
                                                </div>
                                            </TableHead>
                                            <TableHead className="w-[120px] text-center">
                                                <div className="flex items-center justify-center"><Settings className="h-4 w-4 mr-1" /></div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <AnimatePresence mode="popLayout">
                                            {services.map((service, index) => (
                                                <motion.tr
                                                    key={service.idServiceDelivery}
                                                    variants={listItemVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="exit"
                                                    layout
                                                    custom={index}
                                                    onClick={() => navigate(`/admin/servicios/${service.uuid}`)}
                                                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
                                                >
                                                    <TableCell>
                                                        <PlacaBadge plateNumber={service.plate.plateNumber}  size="md" />
                                                    </TableCell>
                                                    <TableCell className="max-w-[150px] md:max-w-[200px] truncate font-medium" title={service.originDealership.name}>
                                                        {service.originDealership.name}
                                                    </TableCell>
                                                    <TableCell className="max-w-[150px] md:max-w-[200px] truncate font-medium" title={service.dealership.name}>
                                                        {service.dealership.name}
                                                    </TableCell>
                                                    <TableCell className="max-w-[150px] md:max-w-[200px] truncate">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="cursor-default truncate inline-block max-w-[100%] align-bottom">{formatDisplayName(service.messenger?.fullName ?? 'No asignado')}</span>
                                                            </TooltipTrigger>
                                                            <TooltipContent><p>{service.messenger?.fullName ?? 'No asignado'}</p></TooltipContent>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div
                                                            className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full"
                                                            style={{ backgroundColor: getStatusIconConfig(service.currentStatus, colors).pillBackground }}
                                                        >
                                                            <div className="w-3 h-3 rounded-full" style={getStatusIconConfig(service.currentStatus, colors).dotStyle} />
                                                            <span className="text-sm font-medium">
                                                                {getStatusIconConfig(service.currentStatus, colors).label}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap text-sm">
                                                        {format(new Date(service.createdAt), "dd MMM yyyy", { locale: es })}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={() => handleUpdateStatus(service)}
                                                                className="h-8 w-8 border-primary/20 hover:bg-primary/5 text-primary hover:text-primary transition-colors"
                                                                title="Actualizar estado"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                                <span className="sr-only">Actualizar</span>
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </TableBody>
                                </Table>
                            </div>
                            <TablePagination currentPage={currentPage} totalPages={totalPages} totalItems={totalElements} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={setItemsPerPage} filterLabel={filterLabel} />
                        </>
                    )}
                </CardContent>
            </Card>

            {selectedService && (
                <UpdateStatusModal
                    open={isUpdateModalOpen}
                    onOpenChange={setIsUpdateModalOpen}
                    service={selectedService}
                    onSuccess={handleUpdateSuccess}
                />
            )}
        </div>
    )
}
