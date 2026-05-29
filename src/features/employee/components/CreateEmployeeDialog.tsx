import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { employeeService } from "@/features/employee/services/employee.service"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { useAdminUI } from "@/shared/context/AdminUIContext"
import { getErrorMessage } from "@/shared/lib/error-utils"
import { capitalizeWords } from "@/shared/utils/stringUtils"

const employeeSchema = z.object({
    document: z.string().min(1, "El documento es requerido").regex(/^\d+$/, "Solo números"),
    fullName: z.string().min(1, "El nombre es requerido").min(3, "Mínimo 3 caracteres"),
    phone: z.string().min(1, "El teléfono es requerido").regex(/^\d{10}$/, "10 dígitos requeridos"),
    password: z.string().min(1, "La contraseña es requerida").min(6, "Mínimo 6 caracteres"),
    role: z.literal("MESSENGER"),
})

type EmployeeFormValues = z.infer<typeof employeeSchema>

interface CreateEmployeeDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

/**
 * Modal para la creación de un nuevo empleado (Transportista).
 */
export function CreateEmployeeDialog({ open, onOpenChange, onSuccess }: CreateEmployeeDialogProps) {
    const [showPassword, setShowPassword] = useState(false)
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
        if (open) {
            reset({
                document: "",
                fullName: "",
                phone: "",
                password: "",
                role: "MESSENGER",
            })
        }
    }, [open, reset])

    const onSubmit = async (data: EmployeeFormValues) => {
        try {
            await employeeService.create({
                document: data.document,
                fullName: capitalizeWords(data.fullName.trim()),
                phone: data.phone,
                password: data.password,
                role: "MESSENGER",
            })
            setSuccess("El nuevo transportista ha sido registrado correctamente")
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            setError(getErrorMessage(error))
        }
    }

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            setShowPassword(false)
        }
        onOpenChange(isOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[700px] flex flex-col max-h-[90vh] overflow-hidden p-0 gap-0">
                <DialogHeader className="p-4 md:p-6 pb-2 border-b shrink-0">
                    <DialogTitle className="text-xl md:text-2xl font-bold">Nuevo transportista</DialogTitle>
                    <DialogDescription className="text-muted-foreground text-sm">
                        Ingresa los detalles para registrar un nuevo transportista
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 max-w-4xl w-full">
                            <div className="flex flex-col space-y-0 gap-2">
                                <Label htmlFor="document">
                                    Documento <span className="text-red-500 ml-0.5">*</span>
                                </Label>
                                <Input
                                    id="document"
                                    placeholder="1234567890"
                                    autoComplete="off"
                                    className="!h-[44px] !min-h-[44px] !max-h-[44px] box-border block"
                                    {...register("document")}
                                />
                                {errors.document && (
                                    <p className="text-sm text-red-500">{errors.document.message}</p>
                                )}
                            </div>

                            <div className="flex flex-col space-y-0 gap-2">
                                <Label htmlFor="fullName">
                                    Nombre completo <span className="text-red-500 ml-0.5">*</span>
                                </Label>
                                <Input
                                    id="fullName"
                                    placeholder="Juan Pérez García"
                                    autoComplete="name"
                                    className="!h-[44px] !min-h-[44px] !max-h-[44px] box-border block"
                                    {...register("fullName")}
                                />
                                {errors.fullName && (
                                    <p className="text-sm text-red-500">{errors.fullName.message}</p>
                                )}
                            </div>

                            <div className="flex flex-col space-y-0 gap-2">
                                <Label htmlFor="phone">
                                    Teléfono <span className="text-red-500 ml-0.5">*</span>
                                </Label>
                                <Input
                                    id="phone"
                                    placeholder="3001234567"
                                    autoComplete="tel"
                                    className="!h-[44px] !min-h-[44px] !max-h-[44px] box-border block"
                                    {...register("phone")}
                                />
                                {errors.phone && (
                                    <p className="text-sm text-red-500">{errors.phone.message}</p>
                                )}
                            </div>

                            <div className="flex flex-col space-y-0 gap-2">
                                <Label htmlFor="password">
                                    Contraseña <span className="text-red-500 ml-0.5">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="pr-10 !h-[44px] !min-h-[44px] !max-h-[44px] box-border block"
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

                    <DialogFooter className="p-4 md:p-6 border-t shrink-0 flex items-center justify-end gap-3 sm:justify-end bg-muted/5">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenChange(false)}
                            disabled={isSubmitting}
                            className="!h-[32px] !min-h-[32px] !max-h-[32px] box-border text-xs m-0"
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" size="sm" disabled={isSubmitting || !isDirty} className="!h-[32px] !min-h-[32px] !max-h-[32px] box-border text-xs m-0">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Crear transportista
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
