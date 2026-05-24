import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { employeeService } from "@/features/employee/services/employee.service"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { AdminBreadcrumb } from "@/shared/components/ui/admin-breadcrumb"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/shared/components/ui/card"
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

/**
 * Página para la creación de un nuevo empleado.
 * Proporciona un formulario para ingresar el documento, nombre, teléfono
 * y contraseña. El rol se asigna automáticamente como MESSENGER.
 */
export default function CreateEmployee() {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)

    const { setSuccess, setError } = useAdminUI()

    const {
        register,
        handleSubmit,
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
            navigate("/admin/empleados")
        } catch (error) {
            setError(getErrorMessage(error))
        }
    }

    return (
        <>
        <Card className="flex flex-col h-full overflow-hidden min-h-0 !p-0">
            <div className="flex flex-row items-center justify-between min-h-[48px] py-2 px-4 border-b gap-4 shrink-0">
                <div className="flex-1">
                    <AdminBreadcrumb segments={[
                        { label: "Transportistas", href: "/admin/empleados" },
                        { label: "Nuevo" }
                    ]} />
                </div>

                <div className="flex-1 flex items-center justify-center">
                    <h1 className="text-xl md:text-2xl font-bold whitespace-nowrap">Nuevo transportista</h1>
                </div>

                <div className="hidden md:flex md:flex-1"></div>
            </div>

            <div className="flex-1 flex flex-col pt-2 pb-0 px-2 sm:px-4 min-h-0">
                <CardHeader className="p-2 pb-0">
                    <CardTitle className="text-base text-foreground font-semibold">Información del transportista</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
                    <CardContent className="flex-1 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 max-w-4xl w-full">
                            <div className="space-y-2">
                                <Label htmlFor="document">
                                    Documento <span className="text-red-500 ml-0.5">*</span>
                                </Label>
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
                                <Label htmlFor="fullName">
                                    Nombre completo <span className="text-red-500 ml-0.5">*</span>
                                </Label>
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
                                <Label htmlFor="phone">
                                    Teléfono <span className="text-red-500 ml-0.5">*</span>
                                </Label>
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
                                <Label htmlFor="password">
                                    Contraseña <span className="text-red-500 ml-0.5">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
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
                    </CardContent>

                    <CardFooter className="flex gap-4 p-4 pt-4 mt-auto border-t bg-muted/5">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => navigate("/admin/empleados")}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" size="sm" disabled={isSubmitting || !isDirty}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Crear transportista
                        </Button>
                    </CardFooter>
                </form>
            </div>
        </Card>
        </>
    )
}
