import { useNavigate, useOutletContext } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useEmployees } from "@/hooks/useEmployees"
import { listItemVariants } from "@/lib/animation-variants"
import { SortIndicator } from "@/components/ui/sort-indicator"
import { ListEmptyState } from "@/components/ui/list-empty-state"
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { TableRowSkeleton } from "@/components/employee/EmployeeSkeletons"
import { TablePagination } from "@/components/ui/table-pagination"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Plus, PhoneCall, User, FileText, Shield, Users, X, Smartphone } from "lucide-react"
import { formatDisplayName } from "@/lib/format-utils"



export default function Empleados() {
    const navigate = useNavigate()
    const { searchQuery } = useOutletContext<{ searchQuery: string }>()

    // Use custom hooks
    const {
        employees,
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
        roleFilter,
        setRoleFilter,
    } = useEmployees({ searchQuery })

    const filterLabel = roleFilter !== "all"
        ? `filtro: ${roleFilter === "ADMIN" ? "Admin" : "Mensajero"}`
        : undefined

    return (
        <div className="space-y-2">
            <AdminBreadcrumb segments={[{ label: "Empleados" }]} />

            {/* Header with inline filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl md:text-2xl font-bold">Empleados</h1>

                    <div className="flex items-center gap-2">
                        <ToggleGroup
                            type="single"
                            value={roleFilter}
                            onValueChange={(value) => setRoleFilter((value as "all" | "ADMIN" | "MESSENGER") || "all")}
                            className="justify-start"
                        >
                            <ToggleGroupItem value="all" aria-label="Todos" className="h-8 px-2 text-xs">Todos</ToggleGroupItem>
                            <ToggleGroupItem value="ADMIN" aria-label="Admin" className="h-8 px-2 text-xs">Administradores</ToggleGroupItem>
                            <ToggleGroupItem value="MESSENGER" aria-label="Mensajeros" className="h-8 px-2 text-xs">Mensajeros</ToggleGroupItem>
                        </ToggleGroup>

                        {roleFilter !== "all" && (
                            <Button variant="ghost" size="sm" onClick={() => setRoleFilter("all")} className="h-8 text-xs">
                                <X className="h-3 w-3 mr-1" />Limpiar
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                    <Button onClick={() => navigate("/admin/empleados/crear")} size="sm" className="shrink-0 h-8 text-xs">
                        <Plus className="h-3 w-3 mr-1" />
                        Nuevo empleado
                    </Button>
                </div>
            </div>

            <Card className="gap-1 py-1">
                <CardHeader className="p-2 pb-0">
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
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Rol</TableHead>
                                    <TableHead>Documento</TableHead>
                                    <TableHead>Teléfono</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)}
                            </TableBody>
                        </Table>
                    ) : filteredAndSortedEmployees.length === 0 ? (
                        <ListEmptyState
                            isSearchResult={!!searchQuery}
                            searchQuery={searchQuery}
                            emptyIcon={<Users />}
                            emptyTitle="Sin empleados"
                            emptyDescription="Aún no hay empleados registrados en el sistema"
                            actionButton={{ label: "Crear primer empleado", onClick: () => navigate("/admin/empleados/crear") }}
                        />
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors select-none" onClick={() => handleSort("fullName")}>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4" />Nombre
                                                <SortIndicator field="fullName" currentSortField={sortField} sortDirection={sortDirection} />
                                            </div>
                                        </TableHead>
                                        <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors select-none" onClick={() => handleSort("role")}>
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4" />Rol
                                                <SortIndicator field="role" currentSortField={sortField} sortDirection={sortDirection} />
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
                                                onClick={() => navigate(`/admin/empleados/editar/${employee.idEmployee}`)}
                                            >
                                                <TableCell className="font-medium text-base">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className="cursor-default">{formatDisplayName(employee.fullName)}</span>
                                                        </TooltipTrigger>
                                                        <TooltipContent><p>{employee.fullName}</p></TooltipContent>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={employee.role === 'ADMIN' ? 'default' : 'secondary'} className="text-sm">
                                                        {employee.role === 'ADMIN' ? 'Admin' : 'Mensajero'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-mono text-base">{employee.document}</TableCell>
                                                <TableCell className="text-base">
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
                            <TablePagination currentPage={currentPage} totalPages={totalPages} totalItems={filteredAndSortedEmployees.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={setItemsPerPage} filterLabel={filterLabel} />
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
