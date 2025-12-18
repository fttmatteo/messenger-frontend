import { useEffect, useState, useMemo } from "react"
import { useNavigate, useOutletContext, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { dealershipService } from "@/services/dealership.service"
import type { Dealership } from "@/types/dealership.types"
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
    Plus,
    Pencil,
    Trash2,
    Loader2,
    MapPin,
    Phone,
    Copy,
    MapPinned,
    Store,
    Globe,
    Navigation,
    Settings,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Home,
    Search,
} from "lucide-react"
import { toast } from "sonner"

// Sorting types
type SortField = "name" | "zone" | "isGeolocated" | null
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
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
        <TableCell className="text-right">
            <div className="flex justify-end gap-2">
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
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-36" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                </div>
            </div>
        </CardContent>
    </Card>
)

// Pagination settings
const ITEMS_PER_PAGE = 10

export default function Concesionarios() {
    const navigate = useNavigate()
    const { searchQuery } = useOutletContext<{ searchQuery: string }>()
    const isMobile = useIsMobile()
    const [dealerships, setDealerships] = useState<Dealership[]>([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState<number | null>(null)
    const [geocoding, setGeocoding] = useState<number | null>(null)

    // Sorting state
    const [sortField, setSortField] = useState<SortField>(null)
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)

    // Filter and sort dealerships
    const filteredAndSortedDealerships = useMemo(() => {
        let result = dealerships.filter((dealership) => {
            if (!searchQuery.trim()) return true
            const query = searchQuery.toLowerCase()
            return (
                String(dealership.idDealership).includes(query) ||
                dealership.name.toLowerCase().includes(query) ||
                dealership.address.toLowerCase().includes(query) ||
                dealership.phone.includes(query) ||
                dealership.zone.toLowerCase().includes(query)
            )
        })

        // Apply sorting
        if (sortField) {
            result = [...result].sort((a, b) => {
                let comparison = 0
                switch (sortField) {
                    case "name":
                        comparison = a.name.localeCompare(b.name)
                        break
                    case "zone":
                        comparison = a.zone.localeCompare(b.zone)
                        break
                    case "isGeolocated":
                        comparison = (a.isGeolocated === b.isGeolocated) ? 0 : a.isGeolocated ? -1 : 1
                        break
                }
                return sortDirection === "asc" ? comparison : -comparison
            })
        }

        return result
    }, [dealerships, searchQuery, sortField, sortDirection])

    // Pagination calculations
    const totalPages = Math.ceil(filteredAndSortedDealerships.length / ITEMS_PER_PAGE)
    const paginatedDealerships = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        return filteredAndSortedDealerships.slice(start, start + ITEMS_PER_PAGE)
    }, [filteredAndSortedDealerships, currentPage])

    // Reset to page 1 when search or sort changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, sortField, sortDirection])

    const fetchDealerships = async () => {
        try {
            setLoading(true)
            const data = await dealershipService.getAll()
            setDealerships(data)
        } catch (error: any) {
            toast.error("Error al cargar concesionarios", {
                description: error.message,
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDealerships()
    }, [])

    const handleDelete = async (id: number) => {
        try {
            setDeleting(id)
            await dealershipService.delete(id)
            toast.success("Concesionario eliminado correctamente")
            fetchDealerships()
        } catch (error: any) {
            toast.error("Error al eliminar concesionario", {
                description: error.message,
            })
        } finally {
            setDeleting(null)
        }
    }

    const handleGeocode = async (id: number) => {
        try {
            setGeocoding(id)
            await dealershipService.geocode(id)
            toast.success("Concesionario geocodificado correctamente")
            fetchDealerships()
        } catch (error: any) {
            toast.error("Error al geocodificar", {
                description: error.message,
            })
        } finally {
            setGeocoding(null)
        }
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
                    {isSearchResult ? <Search /> : <Store />}
                </EmptyMedia>
                <EmptyTitle>
                    {isSearchResult ? "Sin resultados" : "Sin concesionarios"}
                </EmptyTitle>
                <EmptyDescription>
                    {isSearchResult
                        ? `No se encontraron concesionarios que coincidan con "${searchQuery}"`
                        : "Aún no hay concesionarios registrados en el sistema"
                    }
                </EmptyDescription>
            </EmptyHeader>
            {!isSearchResult && (
                <EmptyContent>
                    <Button onClick={() => navigate("/admin/concesionarios/crear")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Crear primer concesionario
                    </Button>
                </EmptyContent>
            )}
        </Empty>
    )

    // Mobile Card Component with animations
    const DealershipCard = ({ dealership, index }: { dealership: Dealership; index: number }) => (
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
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-lg">{dealership.name}</h3>
                                <Badge variant="outline">{dealership.zone}</Badge>
                                {dealership.isGeolocated && dealership.latitude && dealership.longitude ? (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Badge
                                                variant="default"
                                                className="bg-green-500 cursor-pointer hover:bg-green-600 transition-colors"
                                                onClick={() => {
                                                    const coords = `${dealership.latitude}, ${dealership.longitude}`
                                                    navigator.clipboard.writeText(coords)
                                                    toast.success("Coordenadas copiadas", {
                                                        description: coords
                                                    })
                                                }}
                                            >
                                                <MapPin className="h-3 w-3 mr-1" />
                                                Ubicado
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent className="flex items-center gap-2">
                                            <Copy className="h-3 w-3" />
                                            {dealership.latitude}, {dealership.longitude}
                                        </TooltipContent>
                                    </Tooltip>
                                ) : dealership.isGeolocated ? (
                                    <Badge variant="default" className="bg-green-500">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        Ubicado
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary">Sin ubicación</Badge>
                                )}
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                                <div className="flex items-start gap-2">
                                    <MapPinned className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                    <span className="line-clamp-2">{dealership.address}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-3.5 w-3.5" />
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <a href={`tel:${dealership.phone}`} className="hover:underline hover:text-primary transition-colors">
                                                {dealership.phone}
                                            </a>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Llamar</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            {!dealership.isGeolocated && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleGeocode(dealership.idDealership)}
                                            disabled={geocoding === dealership.idDealership}
                                            aria-label="Geocodificar concesionario"
                                        >
                                            {geocoding === dealership.idDealership ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <MapPin className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Geocodificar</TooltipContent>
                                </Tooltip>
                            )}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => navigate(`/admin/concesionarios/editar/${dealership.idDealership}`)}
                                        aria-label="Editar concesionario"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Editar</TooltipContent>
                            </Tooltip>
                            <AlertDialog>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-500 hover:bg-red-500/10"
                                                aria-label="Eliminar concesionario"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>Eliminar</TooltipContent>
                                </Tooltip>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            ¿Eliminar concesionario?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta acción no se puede deshacer. Se eliminará permanentemente <strong>{dealership.name}</strong> del sistema.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => handleDelete(dealership.idDealership)}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            disabled={deleting === dealership.idDealership}
                                        >
                                            {deleting === dealership.idDealership ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : null}
                                            Eliminar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )

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
                        <BreadcrumbPage>Concesionarios</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Concesionarios</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Gestiona los concesionarios del sistema
                    </p>
                </div>
                <Button onClick={() => navigate("/admin/concesionarios/crear")} size={isMobile ? "sm" : "default"}>
                    <Plus className="mr-2 h-4 w-4" />
                    {isMobile ? "Nuevo" : "Nuevo Concesionario"}
                </Button>
            </div>

            {/* Mobile View */}
            {isMobile ? (
                <div>
                    <p className="text-sm text-muted-foreground mb-3">
                        {filteredAndSortedDealerships.length} de {dealerships.length} concesionario(s)
                        {searchQuery && ` - "${searchQuery}"`}
                    </p>
                    {loading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <CardSkeleton key={i} />
                            ))}
                        </div>
                    ) : filteredAndSortedDealerships.length === 0 ? (
                        <EmptyState isSearchResult={!!searchQuery} />
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <AnimatePresence mode="popLayout">
                                {paginatedDealerships.map((dealership, index) => (
                                    <DealershipCard
                                        key={dealership.idDealership}
                                        dealership={dealership}
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
                        <CardTitle>Lista de Concesionarios</CardTitle>
                        <CardDescription>
                            {filteredAndSortedDealerships.length} de {dealerships.length} concesionario(s)
                            {searchQuery && ` - Buscando "${searchQuery}"`}
                            {totalPages > 1 && ` • Página ${currentPage} de ${totalPages}`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Dirección</TableHead>
                                        <TableHead>Teléfono</TableHead>
                                        <TableHead>Zona</TableHead>
                                        <TableHead>Ubicación</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <TableRowSkeleton key={i} />
                                    ))}
                                </TableBody>
                            </Table>
                        ) : filteredAndSortedDealerships.length === 0 ? (
                            <EmptyState isSearchResult={!!searchQuery} />
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead
                                                className="cursor-pointer hover:bg-muted/50 transition-colors select-none"
                                                onClick={() => handleSort("name")}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Store className="h-4 w-4" />
                                                    Nombre
                                                    <SortIndicator field="name" />
                                                </div>
                                            </TableHead>
                                            <TableHead>
                                                <div className="flex items-center gap-2">
                                                    <MapPinned className="h-4 w-4" />
                                                    Dirección
                                                </div>
                                            </TableHead>
                                            <TableHead>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4" />
                                                    Teléfono
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer hover:bg-muted/50 transition-colors select-none"
                                                onClick={() => handleSort("zone")}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Globe className="h-4 w-4" />
                                                    Zona
                                                    <SortIndicator field="zone" />
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer hover:bg-muted/50 transition-colors select-none"
                                                onClick={() => handleSort("isGeolocated")}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Navigation className="h-4 w-4" />
                                                    Ubicación
                                                    <SortIndicator field="isGeolocated" />
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Settings className="h-4 w-4" />
                                                    Acciones
                                                </div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <AnimatePresence mode="popLayout">
                                            {paginatedDealerships.map((dealership, index) => (
                                                <motion.tr
                                                    key={dealership.idDealership}
                                                    variants={itemVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="exit"
                                                    layout
                                                    custom={index}
                                                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                                >
                                                    <TableCell className="font-medium">
                                                        {dealership.name}
                                                    </TableCell>
                                                    <TableCell className="max-w-xs truncate">
                                                        {dealership.address}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <a href={`tel:${dealership.phone}`} className="hover:underline hover:text-primary transition-colors flex items-center gap-2 w-fit">
                                                                    <Phone className="h-3 w-3 md:hidden" />
                                                                    {dealership.phone}
                                                                </a>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Llamar</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{dealership.zone}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {dealership.isGeolocated && dealership.latitude && dealership.longitude ? (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Badge
                                                                        variant="default"
                                                                        className="bg-green-500 cursor-pointer hover:bg-green-600 transition-colors"
                                                                        onClick={() => {
                                                                            const coords = `${dealership.latitude}, ${dealership.longitude}`
                                                                            navigator.clipboard.writeText(coords)
                                                                            toast.success("Coordenadas copiadas", {
                                                                                description: coords
                                                                            })
                                                                        }}
                                                                    >
                                                                        <MapPin className="h-3 w-3 mr-1" />
                                                                        Ubicado
                                                                    </Badge>
                                                                </TooltipTrigger>
                                                                <TooltipContent className="flex items-center gap-2">
                                                                    <Copy className="h-3 w-3" />
                                                                    {dealership.latitude}, {dealership.longitude}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        ) : dealership.isGeolocated ? (
                                                            <Badge variant="default" className="bg-green-500">
                                                                <MapPin className="h-3 w-3 mr-1" />
                                                                Ubicado
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary">
                                                                Sin ubicación
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {!dealership.isGeolocated && (
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() => handleGeocode(dealership.idDealership)}
                                                                            disabled={geocoding === dealership.idDealership}
                                                                            aria-label="Geocodificar concesionario"
                                                                        >
                                                                            {geocoding === dealership.idDealership ? (
                                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                            ) : (
                                                                                <MapPin className="h-4 w-4" />
                                                                            )}
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>Geocodificar ubicación</TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => navigate(`/admin/concesionarios/editar/${dealership.idDealership}`)}
                                                                        aria-label="Editar concesionario"
                                                                    >
                                                                        <Pencil className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Editar concesionario</TooltipContent>
                                                            </Tooltip>
                                                            <AlertDialog>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <AlertDialogTrigger asChild>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="text-red-500 hover:text-red-500 hover:bg-red-500/10"
                                                                                aria-label="Eliminar concesionario"
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </AlertDialogTrigger>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>Eliminar concesionario</TooltipContent>
                                                                </Tooltip>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>
                                                                            ¿Eliminar concesionario?
                                                                        </AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Esta acción no se puede deshacer. Se eliminará permanentemente <strong>{dealership.name}</strong> del sistema.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleDelete(dealership.idDealership)}
                                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                            disabled={deleting === dealership.idDealership}
                                                                        >
                                                                            {deleting === dealership.idDealership ? (
                                                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                                            ) : null}
                                                                            Eliminar
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </TableCell>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </TableBody>
                                </Table>
                                <PaginationControls />
                            </>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
