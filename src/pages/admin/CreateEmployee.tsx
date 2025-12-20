import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { employeeService } from "@/services/employee.service"
import type { EmployeeRole } from "@/types/employee.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

const employeeSchema = z.object({
    document: z.string().min(1, "El documento es requerido").regex(/^\d+$/, "Solo números"),
    fullName: z.string().min(1, "El nombre es requerido").min(3, "Mínimo 3 caracteres"),
    phone: z.string().min(1, "El teléfono es requerido").regex(/^\d{10}$/, "10 dígitos requeridos"),
    password: z.string().min(1, "La contraseña es requerida").min(6, "Mínimo 6 caracteres"),
    role: z.enum(["ADMIN", "MESSENGER"]),
})

type EmployeeFormValues = z.infer<typeof employeeSchema>

export default function CreateEmployee() {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<EmployeeFormValues>({
        resolver: zodResolver(employeeSchema),
    })

    const selectedRole = watch("role")

    const onSubmit = async (data: EmployeeFormValues) => {
        try {
            await employeeService.create({
                document: data.document,
                fullName: data.fullName,
                phone: data.phone,
                password: data.password,
                role: data.role as EmployeeRole,
            })
            toast.success("Empleado creado exitosamente")
            navigate("/admin/empleados")
        } catch (error: any) {
            toast.error("Error al crear empleado", {
                description: error.message,
                id: "error-crear-empleado"
            })
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Nuevo empleado</h1>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Información del empleado</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Documento */}
                            <div className="space-y-2">
                                <Label htmlFor="document">Documento</Label>
                                <Input
                                    id="document"
                                    placeholder="1234567890"
                                    {...register("document")}
                                />
                                {errors.document && (
                                    <p className="text-sm text-red-500">{errors.document.message}</p>
                                )}
                            </div>

                            {/* Teléfono */}
                            <div className="space-y-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input
                                    id="phone"
                                    placeholder="3001234567"
                                    {...register("phone")}
                                />
                                {errors.phone && (
                                    <p className="text-sm text-red-500">{errors.phone.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Nombre Completo */}
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Nombre completo</Label>
                            <Input
                                id="fullName"
                                placeholder="Juan Pérez García"
                                {...register("fullName")}
                            />
                            {errors.fullName && (
                                <p className="text-sm text-red-500">{errors.fullName.message}</p>
                            )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Contraseña */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="pr-10"
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

                        {/* Rol */}
                        <div className="space-y-2">
                            <Label htmlFor="role">Cargo</Label>
                            <Select
                                value={selectedRole}
                                onValueChange={(value) => setValue("role", value as "ADMIN" | "MESSENGER")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un cargo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">Administrador</SelectItem>
                                    <SelectItem value="MESSENGER">Mensajero</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role && (
                                <p className="text-sm text-red-500">{errors.role.message}</p>
                            )}
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/admin/empleados")}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Crear empleado
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
