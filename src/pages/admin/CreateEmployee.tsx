import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { employeeService } from "@/services/employee.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { useAdminUI } from "@/context/AdminUIContext"
import { capitalizeWords } from "@/lib/format-utils"
import { getErrorMessage } from "@/lib/error-utils"

const employeeSchema = z.object({
    document: z.string().min(1, "El documento es requerido").regex(/^\d+$/, "Solo números"),
    fullName: z.string().min(1, "El nombre es requerido").min(3, "Mínimo 3 caracteres"),
    phone: z.string().min(1, "El teléfono es requerido").regex(/^\d{10}$/, "10 dígitos requeridos"),
    password: z.string().min(1, "La contraseña es requerida").min(6, "Mínimo 6 caracteres"),
    role: z.literal("MESSENGER"),
})

type EmployeeFormValues = z.infer<typeof employeeSchema>

/**
 * Página para la creación de un nuevo mensajero.
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
        formState: { errors, isSubmitting },
    } = useForm<EmployeeFormValues>({
        resolver: zodResolver(employeeSchema),
        defaultValues: {
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
            setSuccess("El nuevo mensajero ha sido registrado correctamente")
            navigate("/admin/empleados")
        } catch (error) {
            setError(getErrorMessage(error))
        }
    }

    return (
        <div className="flex flex-col h-full gap-1 overflow-hidden">
            <div className="flex items-center justify-between min-h-[48px] mb-2 gap-4">
                <div className="flex-1">
                    <AdminBreadcrumb segments={[
                        { label: "Empleados", href: "/admin/empleados" },
                        { label: "Nuevo" }
                    ]} />
                </div>

                <div className="flex-1 flex items-center justify-center">
                    <h1 className="text-xl md:text-2xl font-bold whitespace-nowrap">Nuevo mensajero</h1>
                </div>

                <div className="hidden md:flex md:flex-1"></div>
            </div>

            <Card className="flex-1 flex flex-col gap-1 py-1 min-h-0">
                <CardHeader className="p-2 pb-0">
                    <CardTitle className="text-base text-foreground font-semibold">Información del mensajero</CardTitle>
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
                                <Label htmlFor="password">Contraseña</Label>
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

                        <div className="flex gap-4 pt-6 mt-auto border-t">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => navigate("/admin/empleados")}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" size="sm" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Crear mensajero
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
