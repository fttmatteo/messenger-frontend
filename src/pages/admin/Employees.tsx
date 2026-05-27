import { useNavigate, useOutletContext } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useEmployees } from "@/features/employee/hooks/use-employees"
import { listItemVariants } from "@/shared/lib/animation-variants"
import { SortIndicator } from "@/shared/components/ui/sort-indicator"
import { ListEmptyState } from "@/shared/components/ui/list-empty-state"
import { AdminBreadcrumb } from "@/shared/components/ui/admin-breadcrumb"
import { Button } from "@/shared/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip"
import { TableRowSkeleton } from "@/features/employee/components/EmployeeSkeletons"
import { TablePagination } from "@/shared/components/ui/table-pagination"
import { Plus, PhoneCall, User, FileText, Users, Smartphone } from "lucide-react"
import { formatDisplayName } from "@/shared/lib/format-utils"

/**
 * Página principal de administración de empleados.
 * Muestra una lista paginada de todos los empleados registrados en el sistema.
 * Permite buscar por nombre o documento y navegar hacia las vistas de creación y edición.
 * Los administradores solo ven empleados con rol MESSENGER (filtrado server-side).
 */
export default function Employees() {
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
        <Card className="flex flex-col h-full overflow-hidden min-h-0 !p-0">
            <div className="flex flex-row items-center justify-between min-h-[48px] py-2 px-4 border-b gap-4 shrink-0">
                <div className="flex-1">
                    <AdminBreadcrumb segments={[{ label: "Transportistas" }]} />
                </div>

                <div className="flex-1 flex items-center justify-center gap-3">
                    <h1 className="text-xl md:text-2xl font-bold whitespace-nowrap">Transportistas</h1>
                </div>

                <div className="flex-1 flex justify-end gap-2">
                    <Button onClick={() => window.open("/acuerdo-laboral", "_blank")} variant="outline" size="sm" className="hidden">
                        <FileText className="h-3 w-3 mr-1" />
                        Acuerdo GPS
                    </Button>
                    <Button onClick={() => navigate("/admin/empleados/crear")} size="sm" className="shrink-0 h-8 text-xs">
                        <Plus className="h-3 w-3 mr-1" />
                        Nuevo transportista
                    </Button>
                </div>
            </div>

            <CardContent className="flex-1 flex flex-col pt-2 pb-0 px-2 sm:px-4 min-h-0 !overflow-hidden">
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
                                emptyTitle="Sin transportistas"
                                emptyDescription="Aún no hay transportistas registrados en el sistema"
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
    )
}

