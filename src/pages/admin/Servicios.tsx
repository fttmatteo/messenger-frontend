import { useNavigate, useOutletContext } from "react-router-dom"
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
import { Bike, Car, Calendar, Building2, User, PackageCheck, Settings, Edit, X } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { getStatusIconConfig } from "@/lib/status-utils"
import { formatDisplayName } from "@/lib/format-utils"
import { useStatusColors } from "@/hooks/use-status-colors"

// Available statuses for selection
const AVAILABLE_STATUSES: { value: ServiceStatus; label: string }[] = [
    { value: 'ASSIGNED', label: 'Asignado' },
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'DELIVERED', label: 'Entregado' },
    { value: 'RETURNED', label: 'Devuelto' },
    { value: 'CANCELED', label: 'Cancelado' },
    { value: 'RESOLVED', label: 'Revisado' },
]

export default function Servicios() {
    const navigate = useNavigate()
    const { searchQuery } = useOutletContext<{ searchQuery: string }>()
    const { colors } = useStatusColors()

    // Use custom hooks
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
    } = useServices({ searchQuery })

    const handleUpdateStatus = (service: ServiceDelivery) => {
        navigate(`/admin/servicios/actualizar/${service.idServiceDelivery}`)
    }

    const filterLabel = statusFilter.length > 0
        ? `${statusFilter.length} filtro${statusFilter.length > 1 ? 's' : ''} activo${statusFilter.length > 1 ? 's' : ''}`
        : undefined

    return (
        <div className="flex flex-col h-full gap-1">
            {/* Header: Breadcrumb left, Title+Filters center */}
            <div className="flex items-center justify-between min-h-[48px] mb-2 gap-4">
                <div className="flex-1">
                    <AdminBreadcrumb segments={[{ label: "Servicios" }]} />
                </div>

                <div className="flex-1 flex items-center justify-center gap-3">
                    <h1 className="text-xl md:text-2xl font-bold whitespace-nowrap">Servicios</h1>
                    <Select
                        value={statusFilter.length === 1 ? statusFilter[0] : "all"}
                        onValueChange={(value) => {
                            if (value === "all") setStatusFilter([])
                            else setStatusFilter([value as ServiceStatus])
                        }}
                    >
                        <SelectTrigger className="h-8 w-[160px] text-xs">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="text-xs">Todos los estados</SelectItem>
                            {AVAILABLE_STATUSES.map(status => (
                                <SelectItem key={status.value} value={status.value} className="text-xs">{status.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {statusFilter.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={() => setStatusFilter([])} className="h-8 text-xs">
                            <X className="h-3 w-3 mr-1" />Limpiar
                        </Button>
                    )}
                </div>

                <div className="hidden md:flex md:flex-1"></div>
            </div>

            <Card className="flex-1 flex flex-col gap-1 py-1 min-h-0">
                <CardContent className="flex-1 flex flex-col min-h-0">
                    {loading ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Placa</TableHead>
                                    <TableHead>Concesionario</TableHead>
                                    <TableHead>Mensajero</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Creado</TableHead>
                                    <TableHead>Acción</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)}
                            </TableBody>
                        </Table>
                    ) : services.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center h-full">
                            <ListEmptyState
                                isSearchResult={!!searchQuery}
                                searchQuery={searchQuery}
                                emptyIcon={<PackageCheck />}
                                emptyTitle="Sin servicios"
                                emptyDescription="Aún no hay servicios de entrega registrados en el sistema"
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
                                                    <Car className="h-4 w-4 mr-1" />Placa
                                                    <SortIndicator field="plateNumber" currentSortField={sortField} sortDirection={sortDirection} />
                                                </div>
                                            </TableHead>
                                            <TableHead className="max-w-[150px] md:max-w-[200px] cursor-pointer hover:bg-muted/50 transition-colors select-none truncate" onClick={() => handleSort("dealershipName")}>
                                                <div className="flex items-center">
                                                    <Building2 className="h-4 w-4 mr-1 shrink-0" />Concesionario
                                                    <SortIndicator field="dealershipName" currentSortField={sortField} sortDirection={sortDirection} />
                                                </div>
                                            </TableHead>
                                            <TableHead className="max-w-[150px] md:max-w-[200px] cursor-pointer hover:bg-muted/50 transition-colors select-none truncate" onClick={() => handleSort("messengerName")}>
                                                <div className="flex items-center">
                                                    <User className="h-4 w-4 mr-1 shrink-0" />Mensajero
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
                                                    onClick={() => navigate(`/admin/servicios/${service.idServiceDelivery}`)}
                                                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
                                                >
                                                    <TableCell>
                                                        <PlacaBadge plateNumber={service.plate.plateNumber} plateType={service.plate.plateType} size="md" />
                                                    </TableCell>
                                                    <TableCell className="max-w-[150px] md:max-w-[200px] truncate font-medium" title={service.dealership.name}>
                                                        {service.dealership.name}
                                                    </TableCell>
                                                    <TableCell className="max-w-[150px] md:max-w-[200px] truncate">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="cursor-default truncate block">{formatDisplayName(service.messenger.fullName)}</span>
                                                            </TooltipTrigger>
                                                            <TooltipContent><p>{service.messenger.fullName}</p></TooltipContent>
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
        </div>
    )
}
