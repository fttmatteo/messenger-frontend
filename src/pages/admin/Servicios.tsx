import { useEffect, useState, useMemo } from "react"
import { useNavigate, useOutletContext, Link, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
import { serviceDeliveryService } from "@/services/service.service"
import type { ServiceDelivery, ServiceStatus } from "@/types/service.types"
import { useIsMobile } from "@/hooks/use-mobile"
import { PlacaBadge } from "@/components/PlacaBadge"
import { TableRowSkeleton, CardSkeleton } from "@/components/service/ServiceSkeletons"
import { ServiceCard } from "@/components/service/ServiceCard"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
    EmptyContent,
} from "@/components/ui/empty"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Plus,
    Eye,
    Home,
    Search,
    Bike,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Car,
    Calendar,
    Building2,
    User,
    PackageCheck,
    Settings,
    Edit,
    X,
    ChevronUp,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { getStatusBadge, getStatusIconConfig } from "@/lib/status-utils"

// Type Definitions
type SortField = "plateNumber" | "dealershipName" | "messengerName" | "currentStatus" | "createdAt" | null
type SortDirection = "asc" | "desc"

// Animation variants
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring" as const,
            stiffness: 300,
            damping: 24,
        },
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: { duration: 0.2 },
    },
}

// Available statuses for selection
const AVAILABLE_STATUSES: { value: ServiceStatus; label: string }[] = [
    { value: 'ASSIGNED', label: 'Asignado' },
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'DELIVERED', label: 'Entregado' },
    { value: 'RETURNED', label: 'Devuelto' },
    { value: 'CANCELED', label: 'Cancelado' },
    { value: 'RESOLVED', label: 'Resuelto' },
]

/**
 * Formats a full name to show first name and initial of last name
 * Example: "Juan Carlos Perez" → "Juan P."
 */
function formatDisplayName(fullName: string): string {
    const parts = fullName.trim().split(/\s+/)
    if (parts.length === 1) return parts[0]
    const firstName = parts[0]
    const lastName = parts[parts.length - 1]
    return `${firstName} ${lastName.charAt(0).toUpperCase()}.`
}

export default function Servicios() {
    const location = useLocation()
    const isMessenger = location.pathname.includes('/messenger')
    const basePath = isMessenger ? '/messenger/servicios' : '/admin/servicios'

    const navigate = useNavigate()
    const { searchQuery } = useOutletContext<{ searchQuery: string }>()
    const isMobile = useIsMobile()
    const [services, setServices] = useState<ServiceDelivery[]>([])
    const [loading, setLoading] = useState(true)

    // Sorting state
    const [sortField, setSortField] = useState<SortField>(null)
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Filter state
    const [statusFilter, setStatusFilter] = useState<ServiceStatus[]>([])
    const [showScrollTop, setShowScrollTop] = useState(false)

    const { user } = useAuth()
    const isAdmin = user?.role === 'ADMIN'
    const [selectedMessenger, setSelectedMessenger] = useState<string>("all")

    // Get unique messengers for filter
    const uniqueMessengers = useMemo(() => {
        const messengers = new Map()
        services.forEach(service => {
            if (service.messenger) {
                messengers.set(service.messenger.document, {
                    document: service.messenger.document,
                    name: formatDisplayName(service.messenger.fullName)
                })
            }
        })
        return Array.from(messengers.values())
    }, [services])

    const fetchServices = async () => {
        try {
            setLoading(true)
            const data = await serviceDeliveryService.getAll()
            setServices(data)
        } catch (error: any) {
            toast.error("Error al cargar servicios", {
                description: error.message,
                id: "error-cargar-servicios"
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchServices()
    }, [])

    // Update status handler
    const handleUpdateStatus = (service: ServiceDelivery) => {
        navigate(`${basePath}/actualizar/${service.idServiceDelivery}`)
    }


    // Filter and sort services
    const filteredAndSortedServices = useMemo(() => {
        let result = services.filter((service) => {
            // Search filter
            const query = searchQuery.toLowerCase()
            const matchesSearch = !searchQuery.trim() ||
                String(service.idServiceDelivery).includes(query) ||
                service.plate.plateNumber.toLowerCase().includes(query) ||
                service.dealership.name.toLowerCase().includes(query) ||
                service.messenger.fullName.toLowerCase().includes(query) ||
                service.currentStatus.toLowerCase().includes(query) ||
                getStatusBadge(service.currentStatus).label.toLowerCase().includes(query)

            if (!matchesSearch) return false

            // Status filter
            if (statusFilter.length > 0 && !statusFilter.includes(service.currentStatus)) {
                return false
            }

            // Messenger filter
            if (selectedMessenger !== "all" && String(service.messenger?.document) !== String(selectedMessenger)) {
                return false
            }

            return true
        })

        // Apply sorting
        if (sortField) {
            result = [...result].sort((a, b) => {
                let comparison = 0
                switch (sortField) {
                    case "plateNumber":
                        comparison = a.plate.plateNumber.localeCompare(b.plate.plateNumber)
                        break
                    case "dealershipName":
                        comparison = a.dealership.name.localeCompare(b.dealership.name)
                        break
                    case "messengerName":
                        comparison = a.messenger.fullName.localeCompare(b.messenger.fullName)
                        break
                    case "currentStatus":
                        comparison = a.currentStatus.localeCompare(b.currentStatus)
                        break
                    case "createdAt":
                        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                        break
                }
                return sortDirection === "asc" ? comparison : -comparison
            })
        }

        return result
    }, [services, searchQuery, statusFilter, sortField, sortDirection])

    // Pagination calculations
    const totalPages = Math.ceil(filteredAndSortedServices.length / itemsPerPage)
    const paginatedServices = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return filteredAndSortedServices.slice(start, start + itemsPerPage)
    }, [filteredAndSortedServices, currentPage, itemsPerPage])

    // Reset to page 1 when search, sort, or filters changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, sortField, sortDirection, statusFilter, itemsPerPage])

    // const fetchServices = async () => {
    //     try {
    //         setLoading(true)
    //         const data = await serviceDeliveryService.getAll()
    //         setServices(data)
    //     } catch (error: any) {
    //         toast.error("Error al cargar servicios", {
    //             description: error.message,
    //             id: "error-cargar-servicios"
    //         })
    //     } finally {
    //         setLoading(false)
    //     }
    // }

    // useEffect(() => {
    //     fetchServices()
    // }, [])



    // Scroll to top functionality for mobile
    useEffect(() => {
        if (!isMobile) return

        const handleScroll = () => {
            const scrolled = window.scrollY > 300
            setShowScrollTop(scrolled)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [isMobile])

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }


    // Sorting handler
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("asc")
        }
    }

    // Sort indicator component
    const SortIndicator = ({ field }: { field: SortField }) => {
        if (sortField !== field) {
            return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />
        }
        return sortDirection === "asc"
            ? <ArrowUp className="h-4 w-4 ml-1" />
            : <ArrowDown className="h-4 w-4 ml-1" />
    }

    // Empty state component
    const EmptyState = ({ isSearchResult }: { isSearchResult: boolean }) => (
        <Empty className="py-12">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    {isSearchResult ? <Search /> : <PackageCheck />}
                </EmptyMedia>
                <EmptyTitle>
                    {isSearchResult ? "Sin resultados" : "Sin servicios"}
                </EmptyTitle>
                <EmptyDescription>
                    {isSearchResult
                        ? `No se encontraron servicios que coincidan con "${searchQuery}"`
                        : "Aún no hay servicios de entrega registrados en el sistema"
                    }
                </EmptyDescription>
            </EmptyHeader>
            {!isSearchResult && (
                <EmptyContent>
                    <Button onClick={() => navigate(`${basePath}/crear`)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Crear primer servicio
                    </Button>
                </EmptyContent>
            )}
        </Empty>
    )

    // Enhanced Pagination component
    const PaginationControls = () => {
        const startItem = (currentPage - 1) * itemsPerPage + 1
        const endItem = Math.min(currentPage * itemsPerPage, filteredAndSortedServices.length)
        const hasResults = filteredAndSortedServices.length > 0

        return (
            <div className="mt-4 space-y-3">
                {/* Results info and items per page selector */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <p className="text-sm text-muted-foreground">
                        {hasResults ? (
                            <>
                                Mostrando <span className="font-medium">{startItem}-{endItem}</span> de{" "}
                                <span className="font-medium">{filteredAndSortedServices.length}</span> resultado(s)
                                {statusFilter.length > 0 && (
                                    <span className="text-primary ml-1">
                                        ({statusFilter.length} filtro{statusFilter.length > 1 ? 's' : ''} activo{statusFilter.length > 1 ? 's' : ''})
                                    </span>
                                )}
                            </>
                        ) : (
                            "Sin resultados"
                        )}
                    </p>

                    {hasResults && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground whitespace-nowrap">Items por página:</span>
                            <Select
                                value={itemsPerPage.toString()}
                                onValueChange={(value) => setItemsPerPage(Number(value))}
                            >
                                <SelectTrigger className="w-[70px] h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                {/* Pagination navigation */}
                {totalPages > 1 && (
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        if (currentPage > 1) setCurrentPage(prev => prev - 1)
                                    }}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    aria-disabled={currentPage === 1}
                                />
                            </PaginationItem>

                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum: number
                                if (totalPages <= 5) {
                                    pageNum = i + 1
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i
                                } else {
                                    pageNum = currentPage - 2 + i
                                }

                                return (
                                    <PaginationItem key={pageNum}>
                                        <PaginationLink
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                setCurrentPage(pageNum)
                                            }}
                                            isActive={currentPage === pageNum}
                                            className="cursor-pointer"
                                        >
                                            {pageNum}
                                        </PaginationLink>
                                    </PaginationItem>
                                )
                            })}

                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        if (currentPage < totalPages) setCurrentPage(prev => prev + 1)
                                    }}
                                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    aria-disabled={currentPage === totalPages}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Breadcrumbs */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link to={isMessenger ? "/messenger" : "/admin"}>
                                <Home className="h-4 w-4" />
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Servicios</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header with inline filters on desktop */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-4 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-bold">Servicios</h1>

                    {/* Desktop Filters - inline with title */}
                    {!isMobile && (
                        <div className="flex items-center gap-3">
                            <Select
                                value={statusFilter.length === 1 ? statusFilter[0] : "all"}
                                onValueChange={(value) => {
                                    if (value === "all") {
                                        setStatusFilter([])
                                    } else {
                                        setStatusFilter([value as ServiceStatus])
                                    }
                                }}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los estados</SelectItem>
                                    {AVAILABLE_STATUSES.map(status => (
                                        <SelectItem key={status.value} value={status.value}>
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {(statusFilter.length > 0) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setStatusFilter([])}
                                    className="h-9"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Limpiar filtro
                                </Button>
                            )}
                        </div>
                    )}
                </div>
                <Button
                    onClick={() => navigate(`${basePath}/crear`)}
                    size={isMobile ? "lg" : "default"}
                    className="shrink-0"
                >
                    <Plus className={isMobile ? "h-5 w-5" : "h-4 w-4 mr-2"} />
                    {!isMobile && "Nuevo servicio"}
                </Button>
            </div>

            {/* Mobile View */}
            {isMobile ? (
                <div>
                    {/* Mobile filter */}
                    <div className="mb-3 space-y-2">
                        <Select
                            value={statusFilter.length === 1 ? statusFilter[0] : "all"}
                            onValueChange={(value) => {
                                if (value === "all") {
                                    setStatusFilter([])
                                } else {
                                    setStatusFilter([value as ServiceStatus])
                                }
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Filtrar por estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los estados</SelectItem>
                                {AVAILABLE_STATUSES.map(status => (
                                    <SelectItem key={status.value} value={status.value}>
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Messenger Filter - Only for Admin */}
                        {isAdmin && (
                            <div className="w-full sm:w-[200px]">
                                <Select
                                    value={selectedMessenger}
                                    onValueChange={setSelectedMessenger}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filtrar por mensajero" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los mensajeros</SelectItem>
                                        {uniqueMessengers.map((messenger) => (
                                            <SelectItem
                                                key={messenger.document}
                                                value={messenger.document}
                                            >
                                                {messenger.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {statusFilter.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setStatusFilter([])}
                                className="w-full"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Limpiar filtro
                            </Button>
                        )}
                    </div>



                    <p className="text-sm text-muted-foreground mb-3">
                        {filteredAndSortedServices.length} de {services.length} servicio(s)
                        {searchQuery && ` - "${searchQuery}"`}
                        {statusFilter.length > 0 && ` (${statusFilter.length} filtro activo)`}
                    </p>
                    {loading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <CardSkeleton key={i} />
                            ))}
                        </div>
                    ) : filteredAndSortedServices.length === 0 ? (
                        <EmptyState isSearchResult={!!searchQuery} />
                    ) : (
                        <motion.div>
                            <AnimatePresence mode="popLayout">
                                {paginatedServices.map((service) => (
                                    <div key={service.idServiceDelivery} className="flex gap-2 mb-2">
                                        <div className="flex-1">
                                            <ServiceCard
                                                service={service}
                                                onUpdate={handleUpdateStatus}
                                                onViewDetails={(id) => navigate(`${basePath}/${id}`)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                    <PaginationControls />
                </div>
            ) : (
                /* Desktop View */
                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-1">
                            <CardTitle>Lista de servicios</CardTitle>
                            <CardDescription>
                                {filteredAndSortedServices.length} de {services.length} servicio(s)
                                {searchQuery && ` - Buscando "${searchQuery}"`}
                                {totalPages > 1 && ` • Página ${currentPage} de ${totalPages}`}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Placa</TableHead>
                                        <TableHead>Concesionario</TableHead>
                                        <TableHead>Mensajero</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Creado</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <TableRowSkeleton key={i} />
                                    ))}
                                </TableBody>
                            </Table>
                        ) : filteredAndSortedServices.length === 0 ? (
                            <EmptyState isSearchResult={!!searchQuery} />
                        ) : (
                            <>
                                <div className="overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead
                                                    className="cursor-pointer hover:bg-muted/50 transition-colors select-none"
                                                    onClick={() => handleSort("plateNumber")}
                                                >
                                                    <div className="flex items-center">
                                                        <Car className="h-4 w-4 mr-1" />
                                                        Placa
                                                        <SortIndicator field="plateNumber" />
                                                    </div>
                                                </TableHead>
                                                <TableHead
                                                    className="cursor-pointer hover:bg-muted/50 transition-colors select-none"
                                                    onClick={() => handleSort("dealershipName")}
                                                >
                                                    <div className="flex items-center">
                                                        <Building2 className="h-4 w-4 mr-1 shrink-0" />
                                                        <span className="truncate">Concesionario</span>
                                                        <SortIndicator field="dealershipName" />
                                                    </div>
                                                </TableHead>
                                                <TableHead
                                                    className="cursor-pointer hover:bg-muted/50 transition-colors select-none"
                                                    onClick={() => handleSort("messengerName")}
                                                >
                                                    <div className="flex items-center">
                                                        <User className="h-4 w-4 mr-1 shrink-0" />
                                                        <span className="truncate">Mensajero</span>
                                                        <SortIndicator field="messengerName" />
                                                    </div>
                                                </TableHead>
                                                <TableHead
                                                    className="cursor-pointer hover:bg-muted/50 transition-colors select-none"
                                                    onClick={() => handleSort("currentStatus")}
                                                >
                                                    <div className="flex items-center">
                                                        <Bike className="h-4 w-4 mr-1" />
                                                        Estado
                                                        <SortIndicator field="currentStatus" />
                                                    </div>
                                                </TableHead>
                                                <TableHead
                                                    className="cursor-pointer hover:bg-muted/50 transition-colors select-none"
                                                    onClick={() => handleSort("createdAt")}
                                                >
                                                    <div className="flex items-center">
                                                        <Calendar className="h-4 w-4 mr-1" />
                                                        Creado
                                                        <SortIndicator field="createdAt" />
                                                    </div>
                                                </TableHead>
                                                <TableHead className="text-right"><div className="flex items-center justify-end"><Settings className="h-4 w-4 mr-1" />
                                                    Acciones</div>
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <AnimatePresence mode="popLayout">
                                                {paginatedServices.map((service, index) => {
                                                    return (
                                                        <motion.tr
                                                            key={service.idServiceDelivery}
                                                            variants={itemVariants}
                                                            initial="hidden"
                                                            animate="visible"
                                                            exit="exit"
                                                            layout
                                                            custom={index}
                                                            className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                                        >
                                                            <TableCell>
                                                                <PlacaBadge plateNumber={service.plate.plateNumber} plateType={service.plate.plateType} size="md" />
                                                            </TableCell>
                                                            <TableCell className="truncate text-base" title={service.dealership.name}>
                                                                {service.dealership.name}
                                                            </TableCell>
                                                            <TableCell className="text-base">
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <span className="cursor-default">{formatDisplayName(service.messenger.fullName)}</span>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>{service.messenger.fullName}</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`w-3 h-3 rounded-full ${getStatusIconConfig(service.currentStatus).dotColor}`} />
                                                                    <span className={`text-base font-medium ${getStatusIconConfig(service.currentStatus).textColor}`}>
                                                                        {getStatusIconConfig(service.currentStatus).label}
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="whitespace-nowrap text-base">
                                                                {format(new Date(service.createdAt), "dd MMM yyyy", { locale: es })}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <Button
                                                                        variant="default"
                                                                        size="sm"
                                                                        onClick={() => handleUpdateStatus(service)}
                                                                        className="bg-primary hover:bg-primary/90"
                                                                    >
                                                                        <Edit className="h-4 w-4 mr-1" />
                                                                        Actualizar
                                                                    </Button>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="icon"
                                                                                onClick={() => navigate(`${basePath}/${service.idServiceDelivery}`)}
                                                                                aria-label="Ver detalles del servicio"
                                                                            >
                                                                                <Eye className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Ver detalles</TooltipContent>
                                                                    </Tooltip>
                                                                </div>
                                                            </TableCell>
                                                        </motion.tr>
                                                    )
                                                })}
                                            </AnimatePresence>
                                        </TableBody>
                                    </Table>
                                </div>
                                <PaginationControls />
                            </>
                        )}
                    </CardContent>
                </Card>
            )
            }

            {/* Scroll to top button (mobile only) */}
            <AnimatePresence>
                {isMobile && showScrollTop && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fixed bottom-20 right-4 z-50"
                    >
                        <Button
                            onClick={scrollToTop}
                            size="icon"
                            className="h-12 w-12 rounded-full shadow-lg"
                        >
                            <ChevronUp className="h-5 w-5" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    )
}
