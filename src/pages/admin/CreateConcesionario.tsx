import { useNavigate } from "react-router-dom"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { dealershipService } from "@/services/dealership.service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, MapPin } from "lucide-react"
import { useAdminUI } from "@/context/AdminUIContext"
import { capitalizeWords } from "@/lib/format-utils"
import { getErrorMessage } from "@/lib/error-utils"
import { useState, useRef, useEffect } from "react"
import { Map } from "@/components/Map"
import { useGoogleMap } from "@react-google-maps/api"
import { Badge } from "@/components/ui/badge"

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

// Marker component for the dealership location
function DealershipMarker({ position }: { position: google.maps.LatLngLiteral }) {
    const map = useGoogleMap()
    const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null)

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

export default function CreateConcesionario() {
    const navigate = useNavigate()
    const { setSuccess, setError } = useAdminUI()
    const [coordinates, setCoordinates] = useState<{ lat?: number; lng?: number }>({})
    const [geocoding, setGeocoding] = useState(false)
    const [previewDone, setPreviewDone] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        control,
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

    const selectedZone = useWatch({
        control,
        name: "zone",
    })

    const currentAddress = watch("address")

    const handlePreviewLocation = async () => {
        if (!currentAddress || currentAddress.length < 5) return
        setGeocoding(true)
        try {
            if (!window.google?.maps?.Geocoder) {
                setError("Servicio de geocodificación no disponible")
                setGeocoding(false)
                return
            }
            const geocoder = new google.maps.Geocoder()
            // Append city/region if needed, assuming user enters comprehensive address or we append context
            // For now use address as is or append ", Antioquia, Colombia" if user context implies it
            const addressToGeocode = currentAddress.toLowerCase().includes('medellin') || currentAddress.toLowerCase().includes('antioquia')
                ? currentAddress
                : `${currentAddress}, Medellin, Colombia`

            const response = await geocoder.geocode({ address: addressToGeocode })

            if (response.results?.[0]?.geometry?.location) {
                const location = response.results[0].geometry.location
                setCoordinates({
                    lat: location.lat(),
                    lng: location.lng()
                })
                setPreviewDone(true)
            } else {
                setError("No se encontraron coordenadas para esta dirección")
            }
        } catch (error) {
            console.error("Geocoding error", error)
            setError("Error obteniendo ubicación")
        } finally {
            setGeocoding(false)
        }
    }

    const onSubmit = async (data: DealershipFormValues) => {
        try {
            // 1. Create Dealership
            const created = await dealershipService.create({
                name: capitalizeWords(data.name.trim()),
                address: capitalizeWords(data.address.trim()),
                phone: data.phone,
                zone: data.zone,
            })

            // 2. Trigger Backend Geocoding (Persist)
            // Even if we previewed locally, we ask backend to canonicalize/store it
            try {
                await dealershipService.geocode(created.idDealership)
                setSuccess("Concesionario creado y ubicado exitosamente")
            } catch (geocodeError) {
                console.error(geocodeError)
                setSuccess("Concesionario creado, pero falló la geocodificación automática")
            }

            navigate("/admin/concesionarios")
        } catch (error) {
            setError(getErrorMessage(error))
        }
    }

    return (
        <div className="flex flex-col h-full gap-1">
            {/* Header: Breadcrumb left, Title center */}
            <div className="flex items-center justify-between min-h-[48px] mb-2 gap-4">
                <div className="flex-1">
                    <AdminBreadcrumb segments={[
                        { label: "Concesionarios", href: "/admin/concesionarios" },
                        { label: "Nuevo" }
                    ]} />
                </div>

                <div className="flex-1 flex items-center justify-center">
                    <h1 className="text-xl md:text-2xl font-bold whitespace-nowrap">Nuevo concesionario</h1>
                </div>

                <div className="hidden md:flex md:flex-1"></div>
            </div>

            <div className="flex-1 grid gap-2 lg:grid-cols-3 min-h-0">
                <Card className="lg:col-span-2 flex flex-col gap-1 py-1 min-h-0">
                    <CardHeader className="p-2 pb-0">
                        <CardTitle className="text-base text-foreground font-semibold">Información del concesionario</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
                            <div className="flex-1 grid gap-4 md:grid-cols-2 content-start">
                                {/* Nombre */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre del concesionario</Label>
                                    <Input
                                        id="name"
                                        placeholder="Nombre concesionario"
                                        autoComplete="organization"
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
                                        autoComplete="tel"
                                        {...register("phone")}
                                    />
                                    {errors.phone && (
                                        <p className="text-sm text-red-500">{errors.phone.message}</p>
                                    )}
                                </div>

                                {/* Dirección - spans full width */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="address">Dirección completa</Label>
                                    <Textarea
                                        id="address"
                                        placeholder="Calle 123 #45-67, Medellin"
                                        rows={2}
                                        autoComplete="street-address"
                                        {...register("address")}
                                    />
                                    {errors.address && (
                                        <p className="text-sm text-red-500">{errors.address.message}</p>
                                    )}
                                </div>

                                {/* Zona */}
                                <div className="space-y-2">
                                    <Label htmlFor="zone">Zona</Label>
                                    <Select
                                        name="zone"
                                        value={selectedZone}
                                        onValueChange={(value) => setValue("zone", value)}
                                    >
                                        <SelectTrigger id="zone">
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
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-4 pt-6 mt-auto border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate("/admin/concesionarios")}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" size="sm" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Crear concesionario
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Geolocation Preivew Card */}
                <Card className="flex flex-col gap-1 py-1">
                    <CardHeader className="p-2 pb-0">
                        <CardTitle className="flex items-center gap-2 text-base text-foreground font-semibold">
                            <MapPin className="h-4 w-4" />
                            Ubicación
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-3">
                        {coordinates.lat && coordinates.lng ? (
                            <>
                                <div className="flex-1 min-h-[200px] rounded-lg overflow-hidden border">
                                    <Map
                                        center={{ lat: coordinates.lat, lng: coordinates.lng }}
                                        zoom={16}
                                    >
                                        <DealershipMarker position={{ lat: coordinates.lat, lng: coordinates.lng }} />
                                    </Map>
                                </div>
                                <Button
                                    className="w-full"
                                    size="sm"
                                    variant="outline"
                                    onClick={handlePreviewLocation}
                                    disabled={geocoding || isSubmitting || !currentAddress}
                                >
                                    {geocoding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Actualizar vista previa
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="flex-1 min-h-[200px] rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
                                    <div className="text-center text-muted-foreground px-4">
                                        <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-xs">Ingresa una dirección para previsualizar</p>
                                    </div>
                                </div>
                                {previewDone ? (
                                    <Badge variant="destructive" className="justify-center">No encontrada</Badge>
                                ) : (
                                    <Badge variant="secondary" className="justify-center">Pendiente de ubicar</Badge>
                                )}
                                <Button
                                    className="w-full mt-auto"
                                    size="sm"
                                    onClick={handlePreviewLocation}
                                    disabled={geocoding || isSubmitting || !currentAddress}
                                >
                                    {geocoding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <MapPin className="mr-2 h-4 w-4" />
                                    Previsualizar ubicación
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
