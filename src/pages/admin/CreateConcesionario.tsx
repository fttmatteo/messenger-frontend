import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { dealershipService } from "@/services/dealership.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { capitalizeWords } from "@/lib/format-utils"

// Available zones
const ZONES = [
    { value: "NORTE", label: "Norte" },
    { value: "SUR", label: "Sur" },
    { value: "CENTRO", label: "Centro" },
]

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
        setValue,
        watch,
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

    const selectedZone = watch("zone")

    const onSubmit = async (data: DealershipFormValues) => {
        try {
            await dealershipService.create({
                name: capitalizeWords(data.name.trim()),
                address: capitalizeWords(data.address.trim()),
                phone: data.phone,
                zone: data.zone,
            })
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
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="mb-4">
                <h1 className="text-2xl md:text-3xl font-bold">Nuevo concesionario</h1>
            </div>

            <Card className="flex-1 flex flex-col">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Información del concesionario</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                    <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
                        <div className="flex-1 grid gap-4 md:grid-cols-2 lg:grid-cols-3 content-start">
                            {/* Nombre */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre del concesionario</Label>
                                <Input
                                    id="name"
                                    placeholder="Mundo Yamaha"
                                    {...register("name")}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name.message}</p>
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

                            {/* Zona */}
                            <div className="space-y-2">
                                <Label htmlFor="zone">Zona</Label>
                                <Select
                                    value={selectedZone}
                                    onValueChange={(value) => setValue("zone", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una zona" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel className="text-muted-foreground">Selecciona una zona</SelectLabel>
                                            {ZONES.map((zone) => (
                                                <SelectItem key={zone.value} value={zone.value}>
                                                    {zone.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.zone && (
                                    <p className="text-sm text-red-500">{errors.zone.message}</p>
                                )}
                            </div>

                            {/* Dirección - spans full width */}
                            <div className="space-y-2 md:col-span-2 lg:col-span-3">
                                <Label htmlFor="address">Dirección completa</Label>
                                <Textarea
                                    id="address"
                                    placeholder="Calle 123 #45-67, Medellin"
                                    rows={2}
                                    {...register("address")}
                                />
                                {errors.address && (
                                    <p className="text-sm text-red-500">{errors.address.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4 pt-6 mt-auto border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/admin/concesionarios")}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Crear concesionario
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
