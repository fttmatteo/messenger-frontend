import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { employeeService } from "@/services/employee.service"
import { useAdminUI } from "@/context/AdminUIContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Loader2, Eye, EyeOff, Trash2, Save } from "lucide-react"
import { EmployeeFormSkeleton } from "@/components/employee/EmployeeSkeletons"
import { getErrorMessage } from "@/lib/error-utils"

const employeeSchema = z.object({
    document: z.string().min(1, "El documento es requerido").regex(/^\d+$/, "Solo números"),
    fullName: z.string().min(1, "El nombre es requerido").min(3, "Mínimo 3 caracteres"),
    phone: z.string().min(1, "El teléfono es requerido").regex(/^\d{10}$/, "10 dígitos requeridos"),
    password: z.string().optional(),
    role: z.literal("MESSENGER"),
})

type EmployeeFormValues = z.infer<typeof employeeSchema>

/**
 * Capitaliza la primera letra de cada palabra en una cadena de texto.
 * Ejemplo: "MATEO VALENCIA ARDILA" → "Mateo Valencia Ardila"
 * 
 * @param {string} str - Cadena de texto a capitalizar.
 * @returns {string} Cadena de texto capitalizada.
 */
function capitalizeWords(str: string): string {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

/**
 * Página para editar la información de un empleado existente.
 * Permite actualizar datos personales y cambiar la contraseña.
 * El rol permanece como MESSENGER (no se puede promover a admin desde el panel).
 */
export default function EditEmployee() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { setSuccess, setError } = useAdminUI()
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<EmployeeFormValues>({
        resolver: zodResolver(employeeSchema),
    })
    useEffect(() => {
        const fetchEmployee = async () => {
            if (!id) return
            try {
                setLoading(true)
                const employee = await employeeService.getById(id)
                reset({
                    document: String(employee.document),
                    fullName: employee.fullName,
                    phone: employee.phone,
                    password: "",
                    role: "MESSENGER",
                })
            } catch (error) {
                setError(getErrorMessage(error))
                navigate("/admin/empleados")
            } finally {
                setLoading(false)
            }
        }
        fetchEmployee()
    }, [id, reset, navigate, setError])

    const onSubmit = async (data: EmployeeFormValues) => {
        if (!id) return
        try {
            await employeeService.update(id, {
                document: data.document,
                fullName: capitalizeWords(data.fullName.trim()),
                phone: data.phone,
                password: data.password || "",
                role: "MESSENGER",
            })
            setSuccess("Empleado actualizado exitosamente")
            navigate("/admin/empleados")
        } catch (error) {
            setError(getErrorMessage(error))
        }
    }

    const handleDelete = async () => {
        if (!id) return
        try {
            setDeleting(true)
            await employeeService.delete(id)
            setSuccess("Empleado eliminado exitosamente")
            navigate("/admin/empleados")
        } catch (error) {
            setError(getErrorMessage(error))
        } finally {
            setDeleting(false)
        }
    }

    if (loading) {
        return <EmployeeFormSkeleton />
    }

    return (
        <div className="flex flex-col h-full gap-1 overflow-hidden">
            <div className="flex items-center justify-between min-h-[48px] mb-2 gap-4">
                <div className="flex-1">
                    <AdminBreadcrumb segments={[
                        { label: "Empleados", href: "/admin/empleados" },
                        { label: "Editar" }
                    ]} />
                </div>

                <div className="flex-1 flex items-center justify-center">
                    <h1 className="text-xl md:text-2xl font-bold whitespace-nowrap">Editar empleado</h1>
                </div>

                <div className="hidden md:flex md:flex-1"></div>
            </div>

            <Card className="flex-1 flex flex-col gap-1 py-1 min-h-0">
                <CardHeader className="p-2 pb-0">
                    <CardTitle className="text-base text-foreground font-semibold">Información del empleado</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto">
                    <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
                        <div className="flex-1 grid gap-4 md:grid-cols-2 lg:grid-cols-3 content-start">
                            <div className="space-y-2">
                                <Label htmlFor="document">Documento</Label>
                                <Input
                                    id="document"
                                    placeholder="1234567890"
                                    autoComplete="off"
                                    {...register("document")}
                                />
                                {errors.document && (
                                    <p className="text-sm text-red-500">{errors.document.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input
                                    id="phone"
                                    placeholder="3001234567"
                                    autoComplete="tel"
                                    {...register("phone")}
                                />
                                {errors.phone && (
                                    <p className="text-sm text-red-500">{errors.phone.message}</p>
                                )}
                            </div>

                            <div className="space-y-2 md:col-span-2 lg:col-span-1">
                                <Label htmlFor="fullName">Nombre completo</Label>
                                <Input
                                    id="fullName"
                                    placeholder="Juan Pérez García"
                                    autoComplete="name"
                                    {...register("fullName")}
                                />
                                {errors.fullName && (
                                    <p className="text-sm text-red-500">{errors.fullName.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Nueva contraseña (opcional)</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Dejar vacío para no cambiar"
                                        className="pr-10"
                                        autoComplete="new-password"
                                        {...register("password")}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-red-500">{errors.password.message}</p>
                                )}
                            </div>

                        </div>

                        <div className="flex flex-wrap gap-3 pt-6 mt-auto border-t">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(-1)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" size="sm" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                Guardar cambios
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="ml-auto text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Eliminar
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            ¿Eliminar empleado?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta acción no se puede deshacer. Se eliminará permanentemente este empleado del sistema.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDelete}
                                            disabled={deleting}
                                            className="bg-red-500 text-white hover:bg-red-600"
                                        >
                                            {deleting ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="mr-2 h-4 w-4" />
                                            )}
                                            Eliminar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
