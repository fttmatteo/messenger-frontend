import { useEffect, useState, useMemo } from "react"
import { useNavigate, useOutletContext, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { employeeService } from "@/services/employee.service"
import type { Employee } from "@/types/employee.types"
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
import { TableRowSkeleton, CardSkeleton } from "@/components/employee/EmployeeSkeletons"
import { EmployeeCard } from "@/components/employee/EmployeeCard"
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
    EmptyContent,
    EmptyDescription,
    EmptyTitle,
} from "@/components/ui/empty"
import {
    Plus,
    Pencil,
    Trash2,
    Loader2,
    Smartphone,
    PhoneCall,
    User,
    FileText,
    Shield,
    Settings,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronUp,
    Home,
    Search,
    Users,
    X,
} from "lucide-react"
import { toast } from "sonner"

// Sorting types
type SortField = "fullName" | "role" | "document" | null
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

export default function Empleados() {
    const navigate = useNavigate()
    const { searchQuery } = useOutletContext<{ searchQuery: string }>()
    const isMobile = useIsMobile()
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState<number | null>(null)

    // Sorting state
    const [sortField, setSortField] = useState<SortField>(null)
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
    const [showScrollTop, setShowScrollTop] = useState(false)

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Filter state
    const [roleFilter, setRoleFilter] = useState<"all" | "ADMIN" | "MESSENGER">("all")

    // Filter and sort employees
    const filteredAndSortedEmployees = useMemo(() => {
        let result = employees.filter((employee) => {
            // Search filter
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase()
                const matchesSearch = employee.fullName.toLowerCase().includes(query) ||
                    String(employee.document).includes(query) ||
                    employee.phone.includes(query) ||
                    employee.role.toLowerCase().includes(query)

                if (!matchesSearch) return false
            }

            // Role filter
            if (roleFilter !== "all" && employee.role !== roleFilter) {
                return false
            }

            return true
        })

        // Apply sorting
        if (sortField) {
            result = [...result].sort((a, b) => {
                let comparison = 0
                if (sortField === "fullName") {
                    comparison = a.fullName.localeCompare(b.fullName)
                } else if (sortField === "role") {
                    comparison = a.role.localeCompare(b.role)
                }
                return sortDirection === "asc" ? comparison : -comparison
            })
        }

        return result
    }, [employees, searchQuery, roleFilter, sortField, sortDirection])

    // Pagination calculations
    const totalPages = Math.ceil(filteredAndSortedEmployees.length / itemsPerPage)
    const paginatedEmployees = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return filteredAndSortedEmployees.slice(start, start + itemsPerPage)
    }, [filteredAndSortedEmployees, currentPage, itemsPerPage])

    // Reset to page 1 when search, sort, or filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, sortField, sortDirection, roleFilter, itemsPerPage])

    const fetchEmployees = async () => {
        try {
            setLoading(true)
            const data = await employeeService.getAll()
            setEmployees(data)
        } catch (error: any) {
            toast.error("Error al cargar empleados", {
                description: error.message,
                id: "error-cargar-empleados"
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEmployees()
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


    const handleDelete = async (id: number) => {
        try {
            setDeleting(id)
            await employeeService.delete(id)
            toast.success("Empleado eliminado correctamente")
            fetchEmployees()
        } catch (error: any) {
            toast.error("Error al eliminar empleado", {
                description: error.message,
                id: "error-eliminar-empleado"
            })
        } finally {
            setDeleting(null)
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
                    {isSearchResult ? <Search /> : <Users />}
                </EmptyMedia>
                <EmptyTitle>
                    {isSearchResult ? "Sin resultados" : "Sin empleados"}
                </EmptyTitle>
                <EmptyDescription>
                    {isSearchResult
                        ? `No se encontraron empleados que coincidan con "${searchQuery}"`
                        : "Aún no hay empleados registrados en el sistema"
                    }
                </EmptyDescription>
            </EmptyHeader>
            {!isSearchResult && (
                <EmptyContent>
                    <Button onClick={() => navigate("/admin/empleados/crear")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Crear primer empleado
                    </Button>
                </EmptyContent>
            )}
        </Empty>
    )

    // Enhanced Pagination component
    const PaginationControls = () => {
        const startItem = (currentPage - 1) * itemsPerPage + 1
        const endItem = Math.min(currentPage * itemsPerPage, filteredAndSortedEmployees.length)
        const hasResults = filteredAndSortedEmployees.length > 0

        return (
            <div className="mt-4 space-y-3">
                {/* Results info and items per page selector */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <p className="text-sm text-muted-foreground">
                        {hasResults ? (
                            <>
                                Mostrando <span className="font-medium">{startItem}-{endItem}</span> de{" "}
                                <span className="font-medium">{filteredAndSortedEmployees.length}</span> resultado(s)
                                {roleFilter !== "all" && (
                                    <span className="text-primary ml-1">
                                        (filtro: {roleFilter === "ADMIN" ? "Admin" : "Mensajero"})
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
                        <BreadcrumbPage>Empleados</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header with inline filters on desktop */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-4 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-bold">Empleados</h1>

                    {/* Desktop Filters - inline with title */}
                    {!isMobile && (
                        <div className="flex items-center gap-3">
                            <ToggleGroup
                                type="single"
                                value={roleFilter}
                                onValueChange={(value) => setRoleFilter((value as typeof roleFilter) || "all")}
                                className="justify-start"
                            >
                                <ToggleGroupItem value="all" aria-label="Todos">
                                    Todos
                                </ToggleGroupItem>
                                <ToggleGroupItem value="ADMIN" aria-label="Admin">
                                    Admin
                                </ToggleGroupItem>
                                <ToggleGroupItem value="MESSENGER" aria-label="Mensajero">
                                    Mensajero
                                </ToggleGroupItem>
                            </ToggleGroup>

                            {roleFilter !== "all" && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setRoleFilter("all")}
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
                    onClick={() => navigate("/admin/empleados/crear")}
                    size={isMobile ? "lg" : "default"}
                    className="shrink-0"
                >
                    <Plus className={isMobile ? "h-5 w-5" : "h-4 w-4 mr-2"} />
                    {!isMobile && "Nuevo empleado"}
                </Button>
            </div>

            {/* Mobile View */}
            {isMobile ? (
                <div>
                    {/* Mobile filter */}
                    <div className="mb-3 space-y-2">
                        <Select
                            value={roleFilter}
                            onValueChange={(value) => setRoleFilter(value as typeof roleFilter)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Filtrar por rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los roles</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                                <SelectItem value="MESSENGER">Mensajero</SelectItem>
                            </SelectContent>
                        </Select>

                        {roleFilter !== "all" && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setRoleFilter("all")}
                                className="w-full"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Limpiar filtro
                            </Button>
                        )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                        {filteredAndSortedEmployees.length} de {employees.length} empleado(s)
                        {searchQuery && ` - "${searchQuery}"`}
                        {roleFilter !== "all" && ` (filtro: ${roleFilter === "ADMIN" ? "Admin" : "Mensajero"})`}
                    </p>
                    {loading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <CardSkeleton key={i} />
                            ))}
                        </div>
                    ) : filteredAndSortedEmployees.length === 0 ? (
                        <EmptyState isSearchResult={!!searchQuery} />
                    ) : (
                        <motion.div>
                            <AnimatePresence mode="popLayout">
                                {paginatedEmployees.map((employee) => (
                                    <EmployeeCard
                                        key={employee.idEmployee}
                                        employee={employee}
                                        onEdit={(id) => navigate(`/admin/empleados/editar/${id}`)}
                                        onDelete={handleDelete}
                                        deleting={deleting}
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
                        <CardTitle>Lista de empleados</CardTitle>
                        <CardDescription>
                            {filteredAndSortedEmployees.length} de {employees.length} empleado(s)
                            {searchQuery && ` - Buscando "${searchQuery}"`}
                            {totalPages > 1 && ` • Página ${currentPage} de ${totalPages}`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Documento</TableHead>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Teléfono</TableHead>
                                        <TableHead>Cargo</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <TableRowSkeleton key={i} />
                                    ))}
                                </TableBody>
                            </Table>
                        ) : filteredAndSortedEmployees.length === 0 ? (
                            <EmptyState isSearchResult={!!searchQuery} />
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead
                                                className="cursor-pointer hover:bg-muted/50 transition-colors select-none"
                                                onClick={() => handleSort("document")}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4" />
                                                    Documento
                                                    <SortIndicator field="document" />
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer hover:bg-muted/50 transition-colors select-none"
                                                onClick={() => handleSort("fullName")}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    Nombre
                                                    <SortIndicator field="fullName" />
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
                                                onClick={() => handleSort("role")}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-4 w-4" />
                                                    Cargo
                                                    <SortIndicator field="role" />
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
                                            {paginatedEmployees.map((employee, index) => (
                                                <motion.tr
                                                    key={employee.idEmployee}
                                                    variants={itemVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="exit"
                                                    layout
                                                    custom={index}
                                                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                                >
                                                    <TableCell className="font-mono text-base">
                                                        {employee.document}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-base">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="cursor-default">{formatDisplayName(employee.fullName)}</span>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>{employee.fullName}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell className="text-base">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <a href={`tel:${employee.phone}`} className="hover:underline hover:text-primary transition-colors flex items-center gap-1 w-fit">
                                                                    <PhoneCall className="h-3 w-3" />
                                                                    {employee.phone}
                                                                </a>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Llamar</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-base font-bold text-muted-foreground">
                                                            {employee.role === 'ADMIN' ? 'Administrador' : 'Mensajero'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                onClick={() => navigate(`/admin/empleados/editar/${employee.idEmployee}`)}
                                                                className="bg-primary hover:bg-primary/90"
                                                            >
                                                                <Pencil className="h-4 w-4 mr-1" />
                                                                Editar
                                                            </Button>
                                                            <AlertDialog>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <AlertDialogTrigger asChild>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="icon"
                                                                                className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                                                                                aria-label="Eliminar empleado"
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
                                                                            ¿Eliminar empleado?
                                                                        </AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Esta acción no se puede deshacer. Se eliminará permanentemente a <strong>{employee.fullName}</strong> del sistema.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleDelete(employee.idEmployee)}
                                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                            disabled={deleting === employee.idEmployee}
                                                                        >
                                                                            {deleting === employee.idEmployee ? (
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
