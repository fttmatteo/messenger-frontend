/**
 * EmployeeList - Tabla de Empleados
 * 
 * Componente que muestra una tabla con todos los empleados.
 * Usa DataTable del AdminLayout y React Query para datos.
 */

import { useState } from 'react'
import { useEmployees, useDeleteEmployee } from '../hooks'
import { Employee, EmployeeRole } from '../types'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Spinner } from '@/components/ui/spinner'
import { UserPlus, Pencil, Trash2, Search, Shield, Bike } from 'lucide-react'
import { Input } from '@/components/ui/input'

/**
 * Props del componente
 */
interface EmployeeListProps {
    /** Callback cuando se quiere editar un empleado */
    onEdit?: (employee: Employee) => void
    /** Callback cuando se quiere crear un empleado */
    onCreate?: () => void
}

/**
 * Badge de rol con colores
 */
function RoleBadge({ role }: { role: EmployeeRole }) {
    const isAdmin = role === 'ADMIN'
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            isAdmin 
                ? 'bg-purple-500/20 text-purple-400' 
                : 'bg-blue-500/20 text-blue-400'
        }`}>
            {isAdmin ? <Shield className="w-3 h-3" /> : <Bike className="w-3 h-3" />}
            {role}
        </span>
    )
}

/**
 * EmployeeList Component
 */
export function EmployeeList({ onEdit, onCreate }: EmployeeListProps) {
    const { data: employees, isLoading, error } = useEmployees()
    const { mutate: deleteEmployee, isPending: isDeleting } = useDeleteEmployee()
    const [search, setSearch] = useState('')
    const [deleteId, setDeleteId] = useState<number | null>(null)

    // Filtrar empleados por búsqueda
    const filteredEmployees = employees?.filter(emp => 
        emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
        emp.document.includes(search) ||
        emp.userName.toLowerCase().includes(search.toLowerCase())
    ) ?? []

    // Manejar eliminación
    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este empleado?')) {
            setDeleteId(id)
            deleteEmployee(id, {
                onSettled: () => setDeleteId(null)
            })
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Spinner size="lg" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-12 text-red-400">
                Error al cargar empleados: {error.message}
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header con búsqueda y botón crear */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Buscar por nombre, documento o usuario..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-slate-800 border-slate-700"
                    />
                </div>
                {onCreate && (
                    <Button onClick={onCreate} className="bg-blue-600 hover:bg-blue-700">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Nuevo Empleado
                    </Button>
                )}
            </div>

            {/* Tabla */}
            <div className="rounded-lg border border-slate-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-800/50 hover:bg-slate-800/50">
                            <TableHead className="text-slate-300">Documento</TableHead>
                            <TableHead className="text-slate-300">Nombre</TableHead>
                            <TableHead className="text-slate-300">Usuario</TableHead>
                            <TableHead className="text-slate-300">Teléfono</TableHead>
                            <TableHead className="text-slate-300">Rol</TableHead>
                            <TableHead className="text-slate-300 text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredEmployees.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                    {search ? 'No se encontraron empleados' : 'No hay empleados registrados'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredEmployees.map((employee) => (
                                <TableRow key={employee.id} className="bg-slate-800/30 hover:bg-slate-800/50">
                                    <TableCell className="font-mono text-slate-300">
                                        {employee.document}
                                    </TableCell>
                                    <TableCell className="text-white font-medium">
                                        {employee.fullName}
                                    </TableCell>
                                    <TableCell className="text-slate-400">
                                        {employee.userName}
                                    </TableCell>
                                    <TableCell className="text-slate-400">
                                        {employee.phone}
                                    </TableCell>
                                    <TableCell>
                                        <RoleBadge role={employee.role} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {onEdit && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onEdit(employee)}
                                                    className="text-slate-400 hover:text-white"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(employee.id)}
                                                disabled={isDeleting && deleteId === employee.id}
                                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                            >
                                                {isDeleting && deleteId === employee.id ? (
                                                    <Spinner size="sm" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Contador */}
            <p className="text-sm text-slate-500">
                {filteredEmployees.length} de {employees?.length ?? 0} empleados
            </p>
        </div>
    )
}
