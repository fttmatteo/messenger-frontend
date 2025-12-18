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
    Phone,
    User,
    FileText,
    AtSign,
    Shield,
    Settings,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Home,
    Search,
    Users,
} from "lucide-react"
import { toast } from "sonner"

// Sorting types
type SortField = "fullName" | "role" | "document" | null
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
        <TableCell><Skeleton className="h-4 w-28 font-mono" /></TableCell>
        <TableCell><Skeleton className="h-4 w-36" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
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
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-36" />
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

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)

    // Filter and sort employees
    const filteredAndSortedEmployees = useMemo(() => {
        let result = employees.filter((employee) => {
            if (!searchQuery.trim()) return true
            const query = searchQuery.toLowerCase()
            return (
                String(employee.idEmployee).includes(query) ||
                String(employee.document).includes(query) ||
                employee.fullName.toLowerCase().includes(query) ||
                employee.phone.includes(query) ||
                employee.userName.toLowerCase().includes(query) ||
                employee.role.toLowerCase().includes(query) ||
                (employee.role === 'ADMIN' && 'administrador'.includes(query)) ||
                (employee.role === 'MESSENGER' && 'mensajero'.includes(query))
            )
        })

        // Apply sorting
        if (sortField) {
            result = [...result].sort((a, b) => {
                let comparison = 0
                switch (sortField) {
                    case "fullName":
                        comparison = a.fullName.localeCompare(b.fullName)
                        break
                    case "document":
                        comparison = String(a.document).localeCompare(String(b.document))
                        break
                    case "role":
                        comparison = a.role.localeCompare(b.role)
                        break
                }
                return sortDirection === "asc" ? comparison : -comparison
            })
        }

        return result
    }, [employees, searchQuery, sortField, sortDirection])

    // Pagination calculations
    const totalPages = Math.ceil(filteredAndSortedEmployees.length / ITEMS_PER_PAGE)
    const paginatedEmployees = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        return filteredAndSortedEmployees.slice(start, start + ITEMS_PER_PAGE)
    }, [filteredAndSortedEmployees, currentPage])

    // Reset to page 1 when search or sort changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, sortField, sortDirection])

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

    const getRoleBadgeVariant = (role: string) => {
        return role === 'ADMIN' ? 'default' : 'secondary'
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

    // Mobile Card Component with animations
    const EmployeeCard = ({ employee, index }: { employee: Employee; index: number }) => (
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
                                <h3 className="font-semibold text-lg">{employee.fullName}</h3>
                                <Badge variant={getRoleBadgeVariant(employee.role)}>
                                    {employee.role === 'ADMIN' ? 'Admin' : 'Mensajero'}
                                </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <User className="h-3.5 w-3.5" />
                                    <span>@{employee.userName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FileText className="h-3.5 w-3.5" />
                                    <span className="font-mono">{employee.document}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-3.5 w-3.5" />
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <a href={`tel:${employee.phone}`} className="hover:underline hover:text-primary transition-colors">
                                                {employee.phone}
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
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => navigate(`/admin/empleados/editar/${employee.idEmployee}`)}
                                        aria-label="Editar empleado"
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
                        <BreadcrumbPage>Empleados</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Empleados</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Gestiona los empleados del sistema
                    </p>
                </div>
                <Button onClick={() => navigate("/admin/empleados/crear")} size={isMobile ? "sm" : "default"}>
                    <Plus className="mr-2 h-4 w-4" />
                    {isMobile ? "Nuevo" : "Nuevo Empleado"}
                </Button>
            </div>

            {/* Mobile View */}
            {isMobile ? (
                <div>
                    <p className="text-sm text-muted-foreground mb-3">
                        {filteredAndSortedEmployees.length} de {employees.length} empleado(s)
                        {searchQuery && ` - "${searchQuery}"`}
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
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <AnimatePresence mode="popLayout">
                                {paginatedEmployees.map((employee, index) => (
                                    <EmployeeCard
                                        key={employee.idEmployee}
                                        employee={employee}
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
                        <CardTitle>Lista de Empleados</CardTitle>
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
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Rol</TableHead>
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
                                                    <Phone className="h-4 w-4" />
                                                    Teléfono
                                                </div>
                                            </TableHead>
                                            <TableHead>
                                                <div className="flex items-center gap-2">
                                                    <AtSign className="h-4 w-4" />
                                                    Usuario
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer hover:bg-muted/50 transition-colors select-none"
                                                onClick={() => handleSort("role")}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-4 w-4" />
                                                    Rol
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
                                                    <TableCell className="font-mono">
                                                        {employee.document}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {employee.fullName}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <a href={`tel:${employee.phone}`} className="hover:underline hover:text-primary transition-colors flex items-center gap-2 w-fit">
                                                                    <Phone className="h-3 w-3 md:hidden" />
                                                                    {employee.phone}
                                                                </a>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Llamar</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell>{employee.userName}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={getRoleBadgeVariant(employee.role)}>
                                                            {employee.role === 'ADMIN' ? 'Administrador' : 'Mensajero'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => navigate(`/admin/empleados/editar/${employee.idEmployee}`)}
                                                                        aria-label="Editar empleado"
                                                                    >
                                                                        <Pencil className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Editar empleado</TooltipContent>
                                                            </Tooltip>
                                                            <AlertDialog>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <AlertDialogTrigger asChild>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="text-red-500 hover:text-red-500 hover:bg-red-500/10"
                                                                                aria-label="Eliminar empleado"
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </AlertDialogTrigger>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>Eliminar empleado</TooltipContent>
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
            )}
        </div>
    )
}
