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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
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
    Smartphone,
    PhoneCall,
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
    X,
} from "lucide-react"
import { toast } from "sonner"

// Sorting types
type SortField = "name" | "zone" | "isGeolocated" | null
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
        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
        <TableCell><Skeleton className="h-4 w-56" /></TableCell>
        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-6 w-28 rounded-full" /></TableCell>
        <TableCell className="text-right">
            <div className="flex justify-end gap-2">
                <Skeleton className="h-8 w-20 rounded-md" />
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
                <div className="flex-1 space-y-2">
                    <div className="flex flex-col items-start gap-1">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-5 w-24 rounded-full" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-start gap-2">
                            <Skeleton className="h-3.5 w-3.5 rounded-full mt-0.5" />
                            <Skeleton className="h-4 w-full max-w-xs" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-3 w-16" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-3.5 w-3.5 rounded-full" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <Skeleton className="h-9 w-9 rounded-md" />
                </div>
            </div>
        </CardContent>
    </Card>
)



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
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Filter state
    const [zoneFilter, setZoneFilter] = useState<string>("all")

    // Get unique zones from dealerships
    const uniqueZones = useMemo(() => {
        const zones = new Set(dealerships.map(d => d.zone))
        return Array.from(zones).sort()
    }, [dealerships])

    // Filter and sort dealerships
    const filteredAndSortedDealerships = useMemo(() => {
        let result = dealerships.filter((dealership) => {
            // Search filter
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase()
                const matchesSearch = (
                    String(dealership.idDealership).includes(query) ||
                    dealership.name.toLowerCase().includes(query) ||
                    dealership.address.toLowerCase().includes(query) ||
                    dealership.phone.includes(query) ||
                    dealership.zone.toLowerCase().includes(query)
                )
                if (!matchesSearch) return false
            }

            // Zone filter
            if (zoneFilter !== "all" && dealership.zone !== zoneFilter) {
                return false
            }

            return true
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
    }, [dealerships, searchQuery, zoneFilter, sortField, sortDirection])

    // Pagination calculations
    const totalPages = Math.ceil(filteredAndSortedDealerships.length / itemsPerPage)
    const paginatedDealerships = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return filteredAndSortedDealerships.slice(start, start + itemsPerPage)
    }, [filteredAndSortedDealerships, currentPage, itemsPerPage])

    // Reset to page 1 when search, sort, or filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, sortField, sortDirection, zoneFilter, itemsPerPage])

    const fetchDealerships = async () => {
        try {
            setLoading(true)
            const data = await dealershipService.getAll()
            setDealerships(data)
        } catch (error: any) {
            toast.error("Error al cargar concesionarios", {
                description: error.message,
                id: "error-cargar-concesionarios"
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
                id: "error-eliminar-concesionario"
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
                id: "error-geocodificar"
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
                            <div className="flex flex-col items-start gap-1">
                                <h3 className="font-semibold text-lg">{dealership.name}</h3>
                                {dealership.isGeolocated && dealership.latitude && dealership.longitude ? (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Badge
                                                variant="default"
                                                className="bg-green-500 cursor-pointer hover:bg-green-600 transition-colors w-fit"
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
                                    <Badge variant="default" className="bg-green-500 w-fit">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        Ubicado
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="w-fit">Sin ubicación</Badge>
                                )}
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                                <div className="flex items-start gap-2">
                                    <MapPinned className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                    <span className="line-clamp-2">{dealership.address}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold uppercase text-muted-foreground/80">{dealership.zone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <a href={`tel:${dealership.phone}`} className="hover:underline hover:text-primary transition-colors inline-flex items-center gap-1">
                                                <PhoneCall className="h-3.5 w-3.5" />
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
                        <div className="flex flex-col gap-2">
                            {!dealership.isGeolocated && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleGeocode(dealership.idDealership)}
                                    disabled={geocoding === dealership.idDealership}
                                    aria-label="Ubicar concesionario"
                                >
                                    {geocoding === dealership.idDealership ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <MapPin className="h-4 w-4" />
                                    )}
                                </Button>
                            )}
                            <Button
                                variant="default"
                                size="icon"
                                onClick={() => navigate(`/admin/concesionarios/editar/${dealership.idDealership}`)}
                                className="bg-primary hover:bg-primary/90"
                                aria-label="Editar concesionario"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                                        aria-label="Eliminar concesionario"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
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

    // Enhanced Pagination component
    const PaginationControls = () => {
        const startItem = (currentPage - 1) * itemsPerPage + 1
        const endItem = Math.min(currentPage * itemsPerPage, filteredAndSortedDealerships.length)
        const hasResults = filteredAndSortedDealerships.length > 0

        return (
            <div className="mt-4 space-y-3">
                {/* Results info and items per page selector */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <p className="text-sm text-muted-foreground">
                        {hasResults ? (
                            <>
                                Mostrando <span className="font-medium">{startItem}-{endItem}</span> de{" "}
                                <span className="font-medium">{filteredAndSortedDealerships.length}</span> resultado(s)
                                {zoneFilter !== "all" && (
                                    <span className="text-primary ml-1">
                                        (zona: {zoneFilter})
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
                        <BreadcrumbPage>Concesionarios</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl md:text-3xl font-bold truncate">Concesionarios</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Gestiona los concesionarios del sistema
                    </p>
                </div>
                <Button
                    onClick={() => navigate("/admin/concesionarios/crear")}
                    size={isMobile ? "icon" : "default"}
                    className="shrink-0"
                >
                    <Plus className={isMobile ? "h-4 w-4" : "h-4 w-4 mr-2"} />
                    {!isMobile && "Nuevo Concesionario"}
                </Button>
            </div>

            {/* Filters Bar */}
            {!isMobile && (
                <div className="flex items-center gap-3 flex-wrap">
                    <ToggleGroup
                        type="single"
                        value={zoneFilter}
                        onValueChange={(value) => setZoneFilter(value || "all")}
                        className="justify-start"
                    >
                        <ToggleGroupItem value="all" aria-label="Todos">
                            Todos
                        </ToggleGroupItem>
                        {uniqueZones.map((zone) => (
                            <ToggleGroupItem key={zone} value={zone} aria-label={zone}>
                                {zone}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>

                    {zoneFilter !== "all" && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setZoneFilter("all")}
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
                            value={zoneFilter}
                            onValueChange={(value) => setZoneFilter(value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Filtrar por zona" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las zonas</SelectItem>
                                {uniqueZones.map((zone) => (
                                    <SelectItem key={zone} value={zone}>
                                        {zone}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {zoneFilter !== "all" && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setZoneFilter("all")}
                                className="w-full"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Limpiar filtro
                            </Button>
                        )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                        {filteredAndSortedDealerships.length} de {dealerships.length} concesionario(s)
                        {searchQuery && ` - "${searchQuery}"`}
                        {zoneFilter !== "all" && ` (zona: ${zoneFilter})`}
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
                        <motion.div>
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
                                                    <Smartphone className="h-4 w-4" />
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
                                                                <a href={`tel:${dealership.phone}`} className="hover:underline hover:text-primary transition-colors flex items-center gap-1 w-fit">
                                                                    <PhoneCall className="h-3 w-3" />
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
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                onClick={() => navigate(`/admin/concesionarios/editar/${dealership.idDealership}`)}
                                                                className="bg-primary hover:bg-primary/90"
                                                            >
                                                                <Pencil className="h-4 w-4 mr-1" />
                                                                Editar
                                                            </Button>
                                                            {!dealership.isGeolocated && (
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="outline"
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
                                                                    <TooltipContent>Ubicar</TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                            <AlertDialog>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <AlertDialogTrigger asChild>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="icon"
                                                                                className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
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
