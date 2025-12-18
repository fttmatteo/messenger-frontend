import { useEffect, useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
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
import { Plus, Pencil, Trash2, Loader2, Phone, User, FileText, AtSign, Shield, Settings } from "lucide-react"
import { toast } from "sonner"

export default function Empleados() {
    const navigate = useNavigate()
    const { searchQuery } = useOutletContext<{ searchQuery: string }>()
    const isMobile = useIsMobile()
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState<number | null>(null)

    // Filter employees based on search query
    const filteredEmployees = employees.filter((employee) => {
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

    const fetchEmployees = async () => {
        try {
            setLoading(true)
            const data = await employeeService.getAll()
            setEmployees(data)
        } catch (error: any) {
            toast.error("Error al cargar empleados", {
                description: error.message,
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
            })
        } finally {
            setDeleting(null)
        }
    }

    const getRoleBadgeVariant = (role: string) => {
        return role === 'ADMIN' ? 'default' : 'secondary'
    }

    // Mobile Card Component
    const EmployeeCard = ({ employee }: { employee: Employee }) => (
        <Card className="mb-3">
            <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
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
                                <span>{employee.phone}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/admin/empleados/editar/${employee.idEmployee}`)}
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-500 hover:bg-red-500/10"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
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
    )

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Empleados</h1>
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
                        {filteredEmployees.length} de {employees.length} empleado(s)
                        {searchQuery && ` - "${searchQuery}"`}
                    </p>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredEmployees.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            {searchQuery ? "No se encontraron empleados." : "No hay empleados registrados."}
                        </div>
                    ) : (
                        filteredEmployees.map((employee) => (
                            <EmployeeCard key={employee.idEmployee} employee={employee} />
                        ))
                    )}
                </div>
            ) : (
                /* Desktop View */
                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Empleados</CardTitle>
                        <CardDescription>
                            {filteredEmployees.length} de {employees.length} empleado(s)
                            {searchQuery && ` - Buscando "${searchQuery}"`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : filteredEmployees.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                {searchQuery ? "No se encontraron empleados con esa búsqueda." : "No hay empleados registrados."}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                Documento
                                            </div>
                                        </TableHead>
                                        <TableHead>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                Nombre
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
                                        <TableHead>
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4" />
                                                Rol
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
                                    {filteredEmployees.map((employee) => (
                                        <TableRow key={employee.idEmployee}>
                                            <TableCell className="font-mono">
                                                {employee.document}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {employee.fullName}
                                            </TableCell>
                                            <TableCell>{employee.phone}</TableCell>
                                            <TableCell>{employee.userName}</TableCell>
                                            <TableCell>
                                                <Badge variant={getRoleBadgeVariant(employee.role)}>
                                                    {employee.role === 'ADMIN' ? 'Administrador' : 'Mensajero'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => navigate(`/admin/empleados/editar/${employee.idEmployee}`)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-red-500 hover:text-red-500 hover:bg-red-500/10"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
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
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
