import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { dealershipService } from "@/services/dealership.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"

const dealershipSchema = z.object({
    name: z.string().min(1, "El nombre es requerido").min(3, "Mínimo 3 caracteres"),
    address: z.string().min(1, "La dirección es requerida").min(10, "La dirección debe ser más detallada"),
    phone: z.string().min(1, "El teléfono es requerido").regex(/^\d{10}$/, "10 dígitos requeridos"),
    zone: z.string().min(1, "La zona es requerida"),
})

type DealershipFormValues = z.infer<typeof dealershipSchema>

export default function CreateConcesionario() {
    const navigate = useNavigate()

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<DealershipFormValues>({
        resolver: zodResolver(dealershipSchema),
        defaultValues: {
            name: "",
            address: "",
            phone: "",
            zone: "",
        },
    })

    const onSubmit = async (data: DealershipFormValues) => {
        try {
            await dealershipService.create(data)
            toast.success("Concesionario creado exitosamente")
            navigate("/admin/concesionarios")
        } catch (error: any) {
            toast.error("Error al crear concesionario", {
                description: error.message,
                id: "error-crear-concesionario"
            })
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/admin/concesionarios")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Nuevo Concesionario</h1>
                    <p className="text-muted-foreground">
                        Registra un nuevo concesionario en el sistema
                    </p>
                </div>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Información del Concesionario</CardTitle>
                    <CardDescription>
                        Completa los datos del concesionario. Después de crearlo podrás geocodificarlo para obtener sus coordenadas.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Nombre */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre del Concesionario</Label>
                            <Input
                                id="name"
                                placeholder="Concesionario Central S.A."
                                {...register("name")}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Dirección */}
                        <div className="space-y-2">
                            <Label htmlFor="address">Dirección Completa</Label>
                            <Textarea
                                id="address"
                                placeholder="Calle 123 #45-67, Barrio Centro, Ciudad"
                                rows={3}
                                {...register("address")}
                            />
                            {errors.address && (
                                <p className="text-sm text-red-500">{errors.address.message}</p>
                            )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
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

                            {/* Zona */}
                            <div className="space-y-2">
                                <Label htmlFor="zone">Zona</Label>
                                <Input
                                    id="zone"
                                    placeholder="Norte, Sur, Centro..."
                                    {...register("zone")}
                                />
                                {errors.zone && (
                                    <p className="text-sm text-red-500">{errors.zone.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/admin/concesionarios")}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Crear Concesionario
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
