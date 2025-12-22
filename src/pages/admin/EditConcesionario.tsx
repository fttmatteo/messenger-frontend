import { useEffect, useState, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { dealershipService } from "@/services/dealership.service"
import { useAdminUI } from "@/context/AdminUIContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Map } from "@/components/Map"
import { useGoogleMap } from "@react-google-maps/api"
import { Loader2, MapPin } from "lucide-react"

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

/**
 * Capitalizes the first letter of each word
 * Example: "MUNDO YAMAHA" → "Mundo Yamaha"
 */
function capitalizeWords(str: string): string {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

// Marker component for the dealership location
function DealershipMarker({ position }: { position: google.maps.LatLngLiteral }) {
    const map = useGoogleMap()
    const markerRef = useRef<any>(null)

    useEffect(() => {
        if (!map || !window.google?.maps?.marker) return

        const marker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position,
            title: "Ubicación del concesionario",
            content: new google.maps.marker.PinElement({
                background: '#10b981',
                borderColor: 'white',
                glyphColor: 'white',
            }).element
        })

        markerRef.current = marker

        return () => {
            if (markerRef.current) {
                markerRef.current.map = null
            }
        }
    }, [map, position])

    return null
}

export default function EditConcesionario() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { setSuccess, setError } = useAdminUI()
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState(false)
    const [geocoded, setGeocoded] = useState(false)
    const [geocoding, setGeocoding] = useState(false)
    const [coordinates, setCoordinates] = useState<{ lat?: number; lng?: number }>({})
    const [initialAddress, setInitialAddress] = useState("")

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<DealershipFormValues>({
        resolver: zodResolver(dealershipSchema),
    })

    const selectedZone = watch("zone")
    const currentAddress = watch("address")
    // Normalizar ambos lados para detectar cambios reales
    const addressChanged = currentAddress?.trim() !== "" && currentAddress?.trim() !== initialAddress.trim()

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
                setInitialAddress(dealership.address)
                setGeocoded(dealership.isGeolocated || false)
                setCoordinates({
                    lat: dealership.latitude,
                    lng: dealership.longitude,
                })
            } catch (error: any) {
                setError(error.message || "Error al cargar concesionario")
                navigate("/admin/concesionarios")
            } finally {
                setLoading(false)
            }
        }
        fetchDealership()
    }, [id, reset, navigate, setError])

    const onSubmit = async (data: DealershipFormValues) => {
        if (!id) return
        try {
            await dealershipService.update(Number(id), {
                name: capitalizeWords(data.name.trim()),
                address: capitalizeWords(data.address.trim()),
                phone: data.phone,
                zone: data.zone,
            })
            setSuccess("Concesionario actualizado exitosamente")
            navigate("/admin/concesionarios")
        } catch (error: any) {
            setError(error.message || "Error al actualizar concesionario")
        }
    }

    // Guardar cambios Y geocodificar en un solo paso
    const handleSaveAndGeocode = async (data: DealershipFormValues) => {
        if (!id) return
        try {
            setGeocoding(true)
            // Primero guardar
            await dealershipService.update(Number(id), {
                name: capitalizeWords(data.name.trim()),
                address: capitalizeWords(data.address.trim()),
                phone: data.phone,
                zone: data.zone,
            })
            // Luego geocodificar
            const result = await dealershipService.geocode(Number(id))
            setGeocoded(true)
            setCoordinates({
                lat: result.latitude,
                lng: result.longitude,
            })
            setInitialAddress(capitalizeWords(data.address.trim()))
            setSuccess("Guardado y geocodificado correctamente")
        } catch (error: any) {
            setError(error.message || "Error al guardar y geocodificar")
        } finally {
            setGeocoding(false)
        }
    }

    const handleDelete = async () => {
        if (!id) return
        try {
            setDeleting(true)
            await dealershipService.delete(Number(id))
            setSuccess("Concesionario eliminado exitosamente")
            navigate("/admin/concesionarios")
        } catch (error: any) {
            setError(error.message || "Error al eliminar concesionario")
        } finally {
            setDeleting(false)
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
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Editar concesionario</h1>
            </div>

            <div className="grid gap-4 md:gap-6 max-w-5xl lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Información del concesionario</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
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
                            </div>

                            {/* Dirección */}
                            <div className="space-y-2">
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

                            <div className="grid gap-4 md:grid-cols-2">
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
                                            {ZONES.map((zone) => (
                                                <SelectItem key={zone.value} value={zone.value}>
                                                    {zone.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.zone && (
                                        <p className="text-sm text-red-500">{errors.zone.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-3 pt-2">
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
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="ml-auto text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                                        >
                                            Eliminar
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                ¿Eliminar concesionario?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta acción no se puede deshacer. Se eliminará permanentemente este concesionario del sistema.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDelete}
                                                disabled={deleting}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Eliminar
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Geolocation Card */}
                <Card className="flex flex-col">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <MapPin className="h-5 w-5" />
                            Ubicación
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-3">
                        {geocoded && coordinates.lat && coordinates.lng ? (
                            <>
                                <div className="flex-1 min-h-[120px] rounded-lg overflow-hidden border">
                                    <Map
                                        center={{ lat: coordinates.lat, lng: coordinates.lng }}
                                        zoom={16}
                                    >
                                        <DealershipMarker position={{ lat: coordinates.lat, lng: coordinates.lng }} />
                                    </Map>
                                </div>
                                {addressChanged && (
                                    <Button
                                        className="w-full"
                                        size="sm"
                                        onClick={handleSubmit(handleSaveAndGeocode)}
                                        disabled={geocoding || isSubmitting}
                                    >
                                        {geocoding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        <MapPin className="mr-2 h-4 w-4" />
                                        Actualizar ubicación
                                    </Button>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="flex-1 min-h-[120px] rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
                                    <div className="text-center text-muted-foreground">
                                        <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-xs">Sin ubicación</p>
                                    </div>
                                </div>
                                <Badge variant="secondary">Sin ubicación</Badge>
                                <p className="text-xs text-muted-foreground">
                                    {addressChanged
                                        ? "Guarda y geocodifica para obtener las coordenadas."
                                        : "Este concesionario aún no ha sido ubicado."
                                    }
                                </p>
                                {addressChanged && (
                                    <Button
                                        className="w-full"
                                        size="sm"
                                        onClick={handleSubmit(handleSaveAndGeocode)}
                                        disabled={geocoding || isSubmitting}
                                    >
                                        {geocoding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        <MapPin className="mr-2 h-4 w-4" />
                                        Geocodificar
                                    </Button>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
