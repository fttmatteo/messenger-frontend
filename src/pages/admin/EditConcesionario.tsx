import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
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
import { Badge } from "@/components/ui/badge"
import { Loader2, MapPin } from "lucide-react"
import { toast } from "sonner"

const dealershipSchema = z.object({
    name: z.string().min(1, "El nombre es requerido").min(3, "Mínimo 3 caracteres"),
    address: z.string().min(1, "La dirección es requerida").min(10, "La dirección debe ser más detallada"),
    phone: z.string().min(1, "El teléfono es requerido").regex(/^\d{10}$/, "10 dígitos requeridos"),
    zone: z.string().min(1, "La zona es requerida"),
})

type DealershipFormValues = z.infer<typeof dealershipSchema>

export default function EditConcesionario() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [geocoded, setGeocoded] = useState(false)
    const [geocoding, setGeocoding] = useState(false)
    const [coordinates, setCoordinates] = useState<{ lat?: number; lng?: number }>({})

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<DealershipFormValues>({
        resolver: zodResolver(dealershipSchema),
    })

    useEffect(() => {
        const fetchDealership = async () => {
            if (!id) return
            try {
                setLoading(true)
                const dealership = await dealershipService.getById(Number(id))
                reset({
                    name: dealership.name,
                    address: dealership.address,
                    phone: dealership.phone,
                    zone: dealership.zone,
                })
                setGeocoded(dealership.isGeolocated || false)
                setCoordinates({
                    lat: dealership.latitude,
                    lng: dealership.longitude,
                })
            } catch (error: any) {
                toast.error("Error al cargar concesionario", {
                    description: error.message,
                    id: "error-cargar-concesionario-edit"
                })
                navigate("/admin/concesionarios")
            } finally {
                setLoading(false)
            }
        }
        fetchDealership()
    }, [id, reset, navigate])

    const onSubmit = async (data: DealershipFormValues) => {
        if (!id) return
        try {
            await dealershipService.update(Number(id), data)
            toast.success("Concesionario actualizado exitosamente")
            navigate("/admin/concesionarios")
        } catch (error: any) {
            toast.error("Error al actualizar concesionario", {
                description: error.message,
                id: "error-actualizar-concesionario"
            })
        }
    }

    const handleGeocode = async () => {
        if (!id) return
        try {
            setGeocoding(true)
            const result = await dealershipService.geocode(Number(id))
            setGeocoded(true)
            setCoordinates({
                lat: result.latitude,
                lng: result.longitude,
            })
            toast.success("Concesionario geocodificado correctamente")
        } catch (error: any) {
            toast.error("Error al geocodificar", {
                description: error.message,
                id: "error-geocodificar-edit"
            })
        } finally {
            setGeocoding(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Editar concesionario</h1>
            </div>

            <div className="grid gap-6 max-w-4xl lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Información del concesionario</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

                            {/* Dirección */}
                            <div className="space-y-2">
                                <Label htmlFor="address">Dirección completa</Label>
                                <Textarea
                                    id="address"
                                    placeholder="Calle 123 #45-67, Medellin"
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
                                        placeholder="Norte, sur o centro"
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
                                    Guardar cambios
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Geolocation Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Ubicación
                        </CardTitle>
                        <CardDescription>
                            Geocodifica el concesionario para obtener sus coordenadas
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {geocoded ? (
                            <>
                                <Badge variant="default" className="bg-green-500">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    Geocodificado
                                </Badge>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p><strong>Latitud:</strong> {coordinates.lat?.toFixed(6)}</p>
                                    <p><strong>Longitud:</strong> {coordinates.lng?.toFixed(6)}</p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={handleGeocode}
                                    disabled={geocoding}
                                >
                                    {geocoding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Re-geocodificar
                                </Button>
                            </>
                        ) : (
                            <>
                                <Badge variant="secondary">Sin ubicación</Badge>
                                <p className="text-sm text-muted-foreground">
                                    Haz clic en el botón para obtener las coordenadas automáticamente a partir de la dirección.
                                </p>
                                <Button
                                    className="w-full"
                                    onClick={handleGeocode}
                                    disabled={geocoding}
                                >
                                    {geocoding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <MapPin className="mr-2 h-4 w-4" />
                                    Geocodificar
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
