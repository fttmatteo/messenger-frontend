import { useNavigate, useOutletContext } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useEmployees } from "@/hooks/use-employees"
import { listItemVariants } from "@/lib/animation-variants"
import { SortIndicator } from "@/components/ui/sort-indicator"
import { ListEmptyState } from "@/components/ui/list-empty-state"
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { TableRowSkeleton } from "@/components/employee/EmployeeSkeletons"
import { TablePagination } from "@/components/ui/table-pagination"
import { Plus, PhoneCall, User, FileText, Users, Smartphone } from "lucide-react"
import { formatDisplayName } from "@/lib/format-utils"

/**
 * Página principal de administración de mensajeros.
 * Muestra una lista paginada de todos los mensajeros registrados en el sistema.
 * Permite buscar por nombre o documento y navegar hacia las vistas de creación y edición.
 * Los administradores solo ven empleados con rol MESSENGER (filtrado server-side).
 */
export default function Empleados() {
    const navigate = useNavigate()
    const { searchQuery } = useOutletContext<{ searchQuery: string }>()

    const {
        loading,
        filteredAndSortedEmployees,
        paginatedEmployees,
        currentPage,
        totalPages,
        itemsPerPage,
        setCurrentPage,
        setItemsPerPage,
        sortField,
        sortDirection,
        handleSort,
    } = useEmployees({ searchQuery })

    return (
        <div className="flex flex-col h-full gap-1 overflow-hidden">
            <div className="flex items-center justify-between min-h-[48px] mb-2 gap-4">
                <div className="flex-1">
                    <AdminBreadcrumb segments={[{ label: "Mensajeros" }]} />
                </div>

                <div className="flex-1 flex items-center justify-center gap-3">
                    <h1 className="text-xl md:text-2xl font-bold whitespace-nowrap">Mensajeros</h1>
                </div>

                <div className="flex-1 flex justify-end">
                    <Button onClick={() => navigate("/admin/empleados/crear")} size="sm" className="shrink-0 h-8 text-xs">
                        <Plus className="h-3 w-3 mr-1" />
                        Nuevo mensajero
                    </Button>
                </div>
            </div>

            <Card className="flex-1 flex flex-col gap-1 py-1 min-h-0 !overflow-hidden">
                <CardContent className="flex-1 flex flex-col min-h-0 !overflow-hidden">
                    {loading ? (
                        <div className="flex-1 overflow-auto min-h-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Documento</TableHead>
                                        <TableHead>Teléfono</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)}
                                </TableBody>
                            </Table>
                        </div>
                    ) : filteredAndSortedEmployees.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <ListEmptyState
                                isSearchResult={!!searchQuery}
                                searchQuery={searchQuery}
                                emptyIcon={<Users />}
                                emptyTitle="Sin mensajeros"
                                emptyDescription="Aún no hay mensajeros registrados en el sistema"
                                className="py-0"
                            />
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-auto min-h-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors select-none" onClick={() => handleSort("fullName")}>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4" />Nombre
                                                    <SortIndicator field="fullName" currentSortField={sortField} sortDirection={sortDirection} />
                                                </div>
                                            </TableHead>
                                            <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors select-none" onClick={() => handleSort("document")}>
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4" />Documento
                                                    <SortIndicator field="document" currentSortField={sortField} sortDirection={sortDirection} />
                                                </div>
                                            </TableHead>
                                            <TableHead>
                                                <div className="flex items-center gap-2"><Smartphone className="h-4 w-4" />Teléfono</div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <AnimatePresence mode="popLayout">
                                            {paginatedEmployees.map((employee, index) => (
                                                <motion.tr
                                                    key={employee.idEmployee}
                                                    variants={listItemVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="exit"
                                                    layout
                                                    custom={index}
                                                    className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                                                    onClick={() => navigate(`/admin/empleados/editar/${employee.uuid}`)}
                                                >
                                                    <TableCell className="font-medium text-sm">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="cursor-default">{formatDisplayName(employee.fullName)}</span>
                                                            </TooltipTrigger>
                                                            <TooltipContent><p>{employee.fullName}</p></TooltipContent>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-sm">{employee.document}</TableCell>
                                                    <TableCell className="text-sm">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <a href={`tel:${employee.phone}`} className="hover:underline hover:text-primary transition-colors flex items-center gap-1 w-fit">
                                                                    <PhoneCall className="h-3 w-3" />{employee.phone}
                                                                </a>
                                                            </TooltipTrigger>
                                                            <TooltipContent><p>Llamar</p></TooltipContent>
                                                        </Tooltip>
                                                    </TableCell>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </TableBody>
                                </Table>
                            </div>
                            <TablePagination currentPage={currentPage} totalPages={totalPages} totalItems={filteredAndSortedEmployees.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={setItemsPerPage} />
                        </>
                    )}
                </CardContent>
            </Card>
        </div >
    )
}

