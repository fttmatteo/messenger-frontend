import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { employeeService } from "@/services/employee.service"
import type { Employee } from "@/types/employee.types"
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
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function Empleados() {
    const navigate = useNavigate()
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState<number | null>(null)

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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Empleados</h1>
                    <p className="text-muted-foreground">
                        Gestiona los empleados y mensajeros del sistema
                    </p>
                </div>
                <Button onClick={() => navigate("/admin/empleados/crear")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Empleado
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Empleados</CardTitle>
                    <CardDescription>
                        {employees.length} empleado(s) registrado(s)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : employees.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No hay empleados registrados.
                        </div>
                    ) : (
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
                                {employees.map((employee) => (
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
                                                            className="text-destructive hover:text-destructive"
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
        </div>
    )
}
