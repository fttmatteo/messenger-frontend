import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { employeeService } from "@/features/employee/services/employee.service"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/shared/components/ui/alert-dialog"
import { Loader2, Eye, EyeOff, Trash2 } from "lucide-react"
import { useAdminUI } from "@/shared/context/AdminUIContext"
import { getErrorMessage } from "@/shared/lib/error-utils"
import { capitalizeWords } from "@/shared/utils/stringUtils"

const employeeSchema = z.object({
    document: z.string().min(1, "El documento es requerido").regex(/^\d+$/, "Solo números"),
    fullName: z.string().min(1, "El nombre es requerido").min(3, "Mínimo 3 caracteres"),
    phone: z.string().min(1, "El teléfono es requerido").regex(/^\d{10}$/, "10 dígitos requeridos"),
    password: z.string().optional(),
    role: z.literal("MESSENGER"),
})

type EmployeeFormValues = z.infer<typeof employeeSchema>

interface EditEmployeeDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    employeeId: string | null
    onSuccess: () => void
}

/**
 * Modal para la edición de un empleado (Transportista).
 */
export function EditEmployeeDialog({ open, onOpenChange, employeeId, onSuccess }: EditEmployeeDialogProps) {
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const { setSuccess, setError } = useAdminUI()

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<EmployeeFormValues>({
        resolver: zodResolver(employeeSchema),
        defaultValues: {
            document: "",
            fullName: "",
            phone: "",
            password: "",
            role: "MESSENGER",
        },
    })

    useEffect(() => {
        if (open && employeeId) {
            const fetchEmployee = async () => {
                try {
                    setLoading(true)
                    const employee = await employeeService.getById(employeeId)
                    reset({
                        document: String(employee.document),
                        fullName: employee.fullName,
                        phone: employee.phone,
                        password: "",
                        role: "MESSENGER",
                    })
                } catch (error) {
                    setError(getErrorMessage(error))
                    onOpenChange(false)
                } finally {
                    setLoading(false)
                }
            }
            fetchEmployee()
            setShowPassword(false)
        }
    }, [open, employeeId, reset, onOpenChange, setError])

    const onSubmit = async (data: EmployeeFormValues) => {
        if (!employeeId) return
        try {
            await employeeService.update(employeeId, {
                document: data.document,
                fullName: capitalizeWords(data.fullName.trim()),
                phone: data.phone,
                password: data.password || "",
                role: "MESSENGER",
            })
            setSuccess("Transportista actualizado exitosamente")
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            setError(getErrorMessage(error))
        }
    }

    const handleDelete = async () => {
        if (!employeeId) return
        try {
            setDeleting(true)
            await employeeService.delete(employeeId)
            setSuccess("Transportista eliminado exitosamente")
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            setError(getErrorMessage(error))
        } finally {
            setDeleting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] flex flex-col max-h-[90vh] overflow-hidden p-0 gap-0">
                <DialogHeader className="p-4 md:p-6 pb-2 border-b shrink-0">
                    <DialogTitle className="text-xl md:text-2xl font-bold">Editar transportista</DialogTitle>
                    <DialogDescription className="text-muted-foreground text-sm">
                        Modifica los detalles del transportista
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center min-h-[300px]">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 max-w-4xl w-full">
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
                        </div>

                        <DialogFooter className="p-4 md:p-6 border-t shrink-0 flex items-center justify-between gap-3 bg-muted/5">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="!h-[32px] !min-h-[32px] !max-h-[32px] box-border text-xs m-0 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4 md:mr-2" />
                                        <span className="hidden md:inline">Eliminar</span>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Eliminar transportista?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta acción no se puede deshacer. Se eliminará permanentemente este transportista del sistema.
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

                            <div className="flex items-center gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onOpenChange(false)}
                                    disabled={isSubmitting}
                                    className="!h-[32px] !min-h-[32px] !max-h-[32px] box-border text-xs m-0"
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" size="sm" disabled={isSubmitting || !isDirty} className="!h-[32px] !min-h-[32px] !max-h-[32px] box-border text-xs m-0">
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Guardar cambios
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
