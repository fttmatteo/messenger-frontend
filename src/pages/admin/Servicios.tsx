import { useEffect, useState, useMemo } from "react"
import { SignaturePad } from "@/components/SignaturePad"
import { PlacaBadge } from "@/components/PlacaBadge"
import { useNavigate, useOutletContext, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { serviceDeliveryService } from "@/services/service.service"
import type { ServiceDelivery, ServiceStatus } from "@/types/service.types"
import { useIsMobile } from "@/hooks/use-mobile"
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
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
    X, Check,
    ChevronUp,

    Image as ImageIcon,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Sorting types
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

// Skeleton components
const TableRowSkeleton = () => (
    <TableRow>
        <TableCell>
            <Skeleton className="h-8 w-24 rounded" />
        </TableCell>
        <TableCell><Skeleton className="h-4 w-36" /></TableCell>
        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
        <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell className="text-right">
            <div className="flex justify-end gap-1">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
            </div>
        </TableCell>
    </TableRow>
)

const CardSkeleton = () => (
    <Card className="mb-3">
        <CardContent className="pt-4">
            <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex flex-col items-start gap-2">
                        <Skeleton className="h-6 w-24 rounded-full" />
                        <div className="flex flex-col items-center w-fit">
                            <Skeleton className="h-8 w-28 rounded" />
                            <Skeleton className="h-3 w-16 mt-0.5" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-3.5 w-3.5 rounded-full" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-3.5 w-3.5 rounded-full" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-3.5 w-3.5 rounded-full" />
                            <Skeleton className="h-4 w-36" />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                    <Skeleton className="h-8 w-24 rounded-md" />
                    <Skeleton className="h-8 w-24 rounded-md" />
                </div>
            </div>
        </CardContent>
    </Card>
)



// Status badge configuration
const getStatusBadge = (status: ServiceStatus) => {
    const config: Record<ServiceStatus, { label: string; className: string }> = {
        ASSIGNED: { label: 'Asignado', className: 'bg-slate-600 text-white' },
        PENDING: { label: "Pendiente", className: "bg-indigo-500 text-white" },
        DELIVERED: { label: 'Entregado', className: 'bg-green-500 text-white' },
        FAILED: { label: 'Fallido', className: 'bg-red-500 text-white' },
        RETURNED: { label: 'Devuelto', className: 'bg-orange-500 text-white' },
        CANCELED: { label: 'Cancelado', className: 'bg-gray-500 text-white' },
        OBSERVED: { label: 'Observado', className: 'bg-purple-500 text-white' },
        RESOLVED: { label: 'Resuelto', className: 'bg-emerald-500 text-white' },
    }
    return config[status] || { label: status, className: 'bg-gray-500 text-white' }
}

// Plate type translation
const getPlateTypeLabel = (plateType: string) => {
    const types: Record<string, string> = {
        CAR: 'Carro',
        MOTORCYCLE: 'Moto',
        MOTORCAR: 'Motocarro',
    }
    return types[plateType] || plateType
}

// Available statuses for selection
const AVAILABLE_STATUSES: { value: ServiceStatus; label: string }[] = [
    { value: 'ASSIGNED', label: 'Asignado' },
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'DELIVERED', label: 'Entregado' },
    { value: 'FAILED', label: 'Fallido' },
    { value: 'RETURNED', label: 'Devuelto' },
    { value: 'CANCELED', label: 'Cancelado' },
    { value: 'OBSERVED', label: 'Observado' },
    { value: 'RESOLVED', label: 'Resuelto' },
]

export default function Servicios() {
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


    // Update status dialog state
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
    const [selectedService, setSelectedService] = useState<ServiceDelivery | null>(null)
    const [updating, setUpdating] = useState(false)
    const [newStatus, setNewStatus] = useState<ServiceStatus>('PENDING')
    const [observation, setObservation] = useState('')
    const [signatureFile, setSignatureFile] = useState<File | null>(null)
    const [photoFiles, setPhotoFiles] = useState<File[]>([])
    const [photosPreviews, setPhotosPreviews] = useState<string[]>([])

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

    // Open update dialog
    const openUpdateDialog = (service: ServiceDelivery) => {
        setSelectedService(service)
        setNewStatus(service.currentStatus)
        setObservation('')
        setSignatureFile(null)
        setPhotoFiles([])
        setPhotosPreviews([])
        setUpdateDialogOpen(true)
    }

    // Close update dialog
    const closeUpdateDialog = () => {
        setUpdateDialogOpen(false)
        setSelectedService(null)
        setObservation('')
        setSignatureFile(null)
        setPhotoFiles([])
        setPhotosPreviews([])
    }


    // Handle photos change
    const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length > 0) {
            const validFiles = files.filter(f => f.type.startsWith('image/'))
            if (validFiles.length !== files.length) {
                toast.error("Algunos archivos no son imágenes", { id: "error-archivos-invalidos" })
            }
            setPhotoFiles(prev => [...prev, ...validFiles])

            validFiles.forEach(file => {
                const reader = new FileReader()
                reader.onloadend = () => {
                    setPhotosPreviews(prev => [...prev, reader.result as string])
                }
                reader.readAsDataURL(file)
            })
        }
    }

    // Remove photo from list
    const removePhoto = (index: number) => {
        setPhotoFiles(prev => prev.filter((_, i) => i !== index))
        setPhotosPreviews(prev => prev.filter((_, i) => i !== index))
    }

    // Handle update status submission
    const handleUpdateStatus = async () => {
        if (!selectedService) return

        if (newStatus === 'DELIVERED' && !signatureFile) {
            toast.error("Firma requerida", {
                description: "Para marcar como Entregado, debe incluir la firma.",
                id: "error-firma-requerida"
            })
            return
        }

        try {
            setUpdating(true)
            await serviceDeliveryService.updateStatus(selectedService.idServiceDelivery, {
                status: newStatus,
                observation: observation || undefined,
                signature: signatureFile || undefined,
                photos: photoFiles.length > 0 ? photoFiles : undefined,
            })

            toast.success("Estado actualizado", {
                description: `Servicio ${selectedService.plate.plateNumber} actualizado a ${getStatusBadge(newStatus).label}`
            })

            closeUpdateDialog()
            fetchServices() // Reload list
        } catch (error: any) {
            toast.error("Error al actualizar estado", {
                description: error.response?.data?.message || error.message,
                id: "error-actualizar-estado"
            })
        } finally {
            setUpdating(false)
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
                    <Button onClick={() => navigate("/admin/servicios/crear")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Crear primer servicio
                    </Button>
                </EmptyContent>
            )}
        </Empty>
    )

    // Mobile Card Component
    const ServiceCard = ({ service }: { service: ServiceDelivery }) => {
        const statusConfig = getStatusBadge(service.currentStatus)

        return (
            <motion.div
                exit="exit"
                layout
            >
                <Card className="mb-3 hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2 min-w-0">
                                <div className="flex flex-col items-start gap-2">
                                    <Badge className={statusConfig.className}>
                                        {statusConfig.label}
                                    </Badge>
                                    <div className="flex flex-col items-center w-fit">
                                        <PlacaBadge plateNumber={service.plate.plateNumber} plateType={service.plate.plateType} size="sm" />
                                        <span className="text-[10px] text-muted-foreground mt-0.5 uppercase font-semibold">
                                            {getPlateTypeLabel(service.plate.plateType)}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">{service.dealership.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <User className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">{service.messenger.fullName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                                        <span>{format(new Date(service.createdAt), "PPP", { locale: es })}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 shrink-0">
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => openUpdateDialog(service)}
                                    className="bg-primary hover:bg-primary/90"
                                >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Actualizar
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/admin/servicios/${service.idServiceDelivery}`)}
                                >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Detalles
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        )
    }

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
                            <Link to="/admin">
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

            {/* Header */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl md:text-3xl font-bold truncate">Servicios de Entrega</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Gestiona las entregas de placas
                    </p>
                </div>
                <Button
                    onClick={() => navigate("/admin/servicios/crear")}
                    size={isMobile ? "icon" : "default"}
                    className="shrink-0"
                >
                    <Plus className={isMobile ? "h-4 w-4" : "h-4 w-4 mr-2"} />
                    {!isMobile && "Nuevo Servicio"}
                </Button>
            </div>

            {/* Filters Bar */}
            {!isMobile && (
                <div className="flex items-center gap-3 flex-wrap">
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
                                    <ServiceCard
                                        key={service.idServiceDelivery}
                                        service={service}
                                    />
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
                        <CardTitle>Lista de Servicios</CardTitle>
                        <CardDescription>
                            {filteredAndSortedServices.length} de {services.length} servicio(s)
                            {searchQuery && ` - Buscando "${searchQuery}"`}
                            {totalPages > 1 && ` • Página ${currentPage} de ${totalPages}`}
                        </CardDescription>
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
                                                    const statusConfig = getStatusBadge(service.currentStatus)

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
                                                                <PlacaBadge plateNumber={service.plate.plateNumber} plateType={service.plate.plateType} size="sm" />
                                                            </TableCell>
                                                            <TableCell className="truncate" title={service.dealership.name}>
                                                                {service.dealership.name}
                                                            </TableCell>
                                                            <TableCell className="truncate" title={service.messenger.fullName}>
                                                                {service.messenger.fullName}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className={`${statusConfig.className} text-sm px-3 py-1`}>
                                                                    {statusConfig.label}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="whitespace-nowrap text-sm">
                                                                {format(new Date(service.createdAt), "dd MMM yyyy", { locale: es })}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <Button
                                                                        variant="default"
                                                                        size="sm"
                                                                        onClick={() => openUpdateDialog(service)}
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
                                                                                onClick={() => navigate(`/admin/servicios/${service.idServiceDelivery}`)}
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
            )}

            {/* Update Status Dialog */}
            <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Actualizar Estado del Servicio</DialogTitle>
                        <DialogDescription>
                            {selectedService && (
                                <><PlacaBadge plateNumber={selectedService.plate.plateNumber} plateType={selectedService.plate.plateType} size="sm" /> • {selectedService.dealership.name}</>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Status Select */}
                        <div className="space-y-2">
                            <Label htmlFor="status">Nuevo Estado *</Label>
                            <Select value={newStatus} onValueChange={(value) => setNewStatus(value as ServiceStatus)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {AVAILABLE_STATUSES.map((status) => (
                                        <SelectItem key={status.value} value={status.value}>
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Observation */}
                        <div className="space-y-2">
                            <Label htmlFor="observation">Observaciones</Label>
                            <Textarea
                                id="observation"
                                placeholder="Agrega observaciones sobre el cambio de estado..."
                                value={observation}
                                onChange={(e) => setObservation(e.target.value)}
                                rows={3}
                            />
                        </div>

                        {/* Signature Upload */}
                        <div className="space-y-2">
                            <Label>Firma Digital (Opcional)</Label>
                            <SignaturePad onChange={setSignatureFile} />
                            {signatureFile && (
                                <p className="text-xs text-green-600 mt-1 flex items-center animate-in fade-in slide-in-from-top-1">
                                    <Check className="w-3 h-3 mr-1" />
                                    Firma capturada
                                </p>
                            )}

                        </div>

                        {/* Photos Upload */}
                        <div className="space-y-2">
                            <Label htmlFor="photos">Fotografías (Opcional)</Label>
                            <div className="flex items-center justify-center w-full">
                                <label
                                    htmlFor="photos"
                                    className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-muted/10 hover:bg-muted/20 transition-colors"
                                >
                                    <div className="flex flex-col items-center justify-center pt-3 pb-4">
                                        <ImageIcon className="w-6 h-6 mb-1 text-muted-foreground" />
                                        <p className="text-xs text-muted-foreground">
                                            <span className="font-semibold">Agregar fotos</span>
                                        </p>
                                    </div>
                                    <input
                                        id="photos"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        multiple
                                        onChange={handlePhotosChange}
                                    />
                                </label>
                            </div>

                            {photosPreviews.length > 0 && (
                                <div className="grid grid-cols-3 gap-2">
                                    {photosPreviews.map((preview, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={preview}
                                                alt={`Foto ${index + 1}`}
                                                className="w-full h-20 object-cover rounded border"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute -top-2 -right-2 h-5 w-5"
                                                onClick={() => removePhoto(index)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={closeUpdateDialog}
                            disabled={updating}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleUpdateStatus}
                            disabled={updating}
                        >
                            {updating ? "Actualizando..." : "Actualizar Estado"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
        </div>
    )
}
