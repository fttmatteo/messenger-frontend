import { useEffect, useState, useMemo } from "react"
import { SignaturePad } from "@/components/SignaturePad"
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
    X,

    Image as ImageIcon,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Sorting types
type SortField = "plateNumber" | "dealershipName" | "messengerName" | "currentStatus" | "createdAt" | null
type SortDirection = "asc" | "desc"

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
}

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
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
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
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
        </CardContent>
    </Card>
)

// Pagination settings
const ITEMS_PER_PAGE = 10

// Status badge configuration
const getStatusBadge = (status: ServiceStatus) => {
    const config: Record<ServiceStatus, { label: string; className: string }> = {
        ASSIGNED: { label: 'Asignado', className: 'bg-blue-500' },
        PENDING: { label: 'Pendiente', className: 'bg-yellow-500' },
        DELIVERED: { label: 'Entregado', className: 'bg-green-500' },
        FAILED: { label: 'Fallido', className: 'bg-red-500' },
        RETURNED: { label: 'Devuelto', className: 'bg-orange-500' },
        CANCELED: { label: 'Cancelado', className: 'bg-gray-500' },
        OBSERVED: { label: 'Observado', className: 'bg-purple-500' },
        RESOLVED: { label: 'Resuelto', className: 'bg-emerald-500' },
    }
    return config[status] || { label: status, className: 'bg-gray-500' }
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

    // Update status dialog state
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
    const [selectedService, setSelectedService] = useState<ServiceDelivery | null>(null)
    const [updating, setUpdating] = useState(false)
    const [newStatus, setNewStatus] = useState<ServiceStatus>('PENDING')
    const [observation, setObservation] = useState('')
    const [signatureFile, setSignatureFile] = useState<File | null>(null)
    const [photoFiles, setPhotoFiles] = useState<File[]>([])
    const [signaturePreview, setSignaturePreview] = useState<string | null>(null)
    const [photosPreviews, setPhotosPreviews] = useState<string[]>([])

    // Filter and sort services
    const filteredAndSortedServices = useMemo(() => {
        let result = services.filter((service) => {
            if (!searchQuery.trim()) return true
            const query = searchQuery.toLowerCase()
            return (
                String(service.idServiceDelivery).includes(query) ||
                service.plate.plateNumber.toLowerCase().includes(query) ||
                service.dealership.name.toLowerCase().includes(query) ||
                service.messenger.fullName.toLowerCase().includes(query) ||
                service.currentStatus.toLowerCase().includes(query) ||
                getStatusBadge(service.currentStatus).label.toLowerCase().includes(query)
            )
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
    }, [services, searchQuery, sortField, sortDirection])

    // Pagination calculations
    const totalPages = Math.ceil(filteredAndSortedServices.length / ITEMS_PER_PAGE)
    const paginatedServices = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        return filteredAndSortedServices.slice(start, start + ITEMS_PER_PAGE)
    }, [filteredAndSortedServices, currentPage])

    // Reset to page 1 when search or sort changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, sortField, sortDirection])

    const fetchServices = async () => {
        try {
            setLoading(true)
            const data = await serviceDeliveryService.getAll()
            setServices(data)
        } catch (error: any) {
            toast.error("Error al cargar servicios", {
                description: error.message,
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchServices()
    }, [])

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
        setSignaturePreview(null)
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
        setSignaturePreview(null)
        setPhotosPreviews([])
    }


    // Handle photos change
    const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length > 0) {
            const validFiles = files.filter(f => f.type.startsWith('image/'))
            if (validFiles.length !== files.length) {
                toast.error("Algunos archivos no son imágenes")
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
                description: error.response?.data?.message || error.message
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

    // Mobile Card Component with animations
    const ServiceCard = ({ service, index }: { service: ServiceDelivery; index: number }) => {
        const statusConfig = getStatusBadge(service.currentStatus)

        return (
            <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                custom={index}
            >
                <Card className="mb-3 hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <div className="flex items-center gap-1.5">
                                        <Car className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span className="font-semibold text-lg font-mono">{service.plate.plateNumber}</span>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {service.plate.plateType}
                                    </Badge>
                                    <Badge className={statusConfig.className}>
                                        {statusConfig.label}
                                    </Badge>
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
                            <div className="flex flex-col gap-1 shrink-0">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openUpdateDialog(service)}
                                            aria-label="Actualizar estado"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Actualizar estado</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
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
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        )
    }

    // Pagination component
    const PaginationControls = () => {
        if (totalPages <= 1) return null

        return (
            <Pagination className="mt-4">
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Servicios de Entrega</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Gestiona las entregas de placas vehiculares
                    </p>
                </div>
                <Button onClick={() => navigate("/admin/servicios/crear")} size={isMobile ? "sm" : "default"}>
                    <Plus className="mr-2 h-4 w-4" />
                    {isMobile ? "Nuevo" : "Nuevo Servicio"}
                </Button>
            </div>

            {/* Mobile View */}
            {isMobile ? (
                <div>
                    <p className="text-sm text-muted-foreground mb-3">
                        {filteredAndSortedServices.length} de {services.length} servicio(s)
                        {searchQuery && ` - "${searchQuery}"`}
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
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <AnimatePresence mode="popLayout">
                                {paginatedServices.map((service, index) => (
                                    <ServiceCard
                                        key={service.idServiceDelivery}
                                        service={service}
                                        index={index}
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
                                                    className="cursor-pointer hover:bg-muted/50 transition-colors select-none w-[100px]"
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
                                                        <Building2 className="h-4 w-4 mr-1" />
                                                        Concesionario
                                                        <SortIndicator field="dealershipName" />
                                                    </div>
                                                </TableHead>
                                                <TableHead
                                                    className="cursor-pointer hover:bg-muted/50 transition-colors select-none"
                                                    onClick={() => handleSort("messengerName")}
                                                >
                                                    <div className="flex items-center">
                                                        <User className="h-4 w-4 mr-1" />
                                                        Mensajero
                                                        <SortIndicator field="messengerName" />
                                                    </div>
                                                </TableHead>
                                                <TableHead
                                                    className="cursor-pointer hover:bg-muted/50 transition-colors select-none w-[100px]"
                                                    onClick={() => handleSort("currentStatus")}
                                                >
                                                    <div className="flex items-center">
                                                        <Bike className="h-4 w-4 mr-1" />
                                                        Estado
                                                        <SortIndicator field="currentStatus" />
                                                    </div>
                                                </TableHead>
                                                <TableHead
                                                    className="cursor-pointer hover:bg-muted/50 transition-colors select-none w-[120px]"
                                                    onClick={() => handleSort("createdAt")}
                                                >
                                                    <div className="flex items-center">
                                                        <Calendar className="h-4 w-4 mr-1" />
                                                        Creado
                                                        <SortIndicator field="createdAt" />
                                                    </div>
                                                </TableHead>
                                                <TableHead className="text-right w-[100px]"><div className="flex items-center justify-end"><Settings className="h-4 w-4 mr-1" />
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
                                                            <TableCell className="font-mono whitespace-nowrap">
                                                                {service.plate.plateNumber}
                                                            </TableCell>
                                                            <TableCell className="max-w-[200px] truncate" title={service.dealership.name}>
                                                                {service.dealership.name}
                                                            </TableCell>
                                                            <TableCell className="max-w-[150px] truncate" title={service.messenger.fullName}>
                                                                {service.messenger.fullName}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className={statusConfig.className}>
                                                                    {statusConfig.label}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="whitespace-nowrap text-sm">
                                                                {format(new Date(service.createdAt), "dd/MM/yy", { locale: es })}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => openUpdateDialog(service)}
                                                                                aria-label="Actualizar estado"
                                                                            >
                                                                                <Edit className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Actualizar estado</TooltipContent>
                                                                    </Tooltip>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                variant="ghost"
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
                                <>Placa: <span className="font-mono font-semibold">{selectedService.plate.plateNumber}</span> • {selectedService.dealership.name}</>
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
                            {!signaturePreview ? (
                                <SignaturePad
                                    onSave={(file) => {
                                        setSignatureFile(file)
                                        const reader = new FileReader()
                                        reader.onloadend = () => setSignaturePreview(reader.result as string)
                                        reader.readAsDataURL(file)
                                    }}
                                    onClear={() => {
                                        setSignatureFile(null)
                                        setSignaturePreview(null)
                                    }}
                                />
                            ) : (
                                <div className="relative">
                                    <img
                                        src={signaturePreview}
                                        alt="Firma"
                                        className="w-full h-32 object-contain border rounded-lg bg-white"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-6 w-6"
                                        onClick={() => {
                                            setSignatureFile(null)
                                            setSignaturePreview(null)
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
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
        </div>
    )
}
