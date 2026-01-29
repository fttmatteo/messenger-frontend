import { useEffect, useState, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { dealershipService } from "@/services/dealership.service"
import { useAdminUI } from "@/context/AdminUIContext"
import { Button } from "@/components/ui/button"
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Map } from "@/components/Map"
import { MAP_LIBRARIES } from "@/lib/maps.constants"
import { useGoogleMap, useJsApiLoader } from "@react-google-maps/api"
import { Loader2, MapPin, Trash2, Save } from "lucide-react"
import { DealershipFormSkeleton } from "@/components/dealership/DealershipSkeletons"
import { getErrorMessage } from "@/lib/error-utils"
import { ConcesionarioForm } from "@/components/admin/ConcesionarioForm"
import { dealershipSchema, type DealershipFormValues } from "@/schemas/dealership.schema"

/**
 * Capitaliza la primera letra de cada palabra en una cadena de texto.
 * Ejemplo: "MUNDO YAMAHA" → "Mundo Yamaha"
 * 
 * @param {string} str - Cadena de texto a capitalizar.
 * @returns {string} Cadena de texto capitalizada.
 */
function capitalizeWords(str: string): string {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

/**
 * Marcador personalizado para mostrar la ubicación actual o actualizada del concesionario.
 * 
 * @param {Object} props - Propiedades del componente.
 * @param {google.maps.LatLngLiteral} props.position - Posición GPS del marcador.
 */
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
            })
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

/**
 * Página para editar la información de un concesionario existente.
 * Permite actualizar datos básicos, gestionar la ubicación geográfica
 * (geocodificación) y eliminar el registro.
 */
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

    // Cargar la API de Google Maps a nivel de página
    const { isLoaded: isMapsApiLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: MAP_LIBRARIES,
        version: 'weekly'
    })

    const form = useForm<DealershipFormValues>({
        resolver: zodResolver(dealershipSchema),
    })

    const { handleSubmit, reset, watch, formState: { isSubmitting } } = form
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
                    zone: dealership.zone ? dealership.zone.toUpperCase() : "",
                })
                setInitialAddress(dealership.address)
                setGeocoded(dealership.isGeolocated || false)
                setCoordinates({
                    lat: dealership.latitude,
                    lng: dealership.longitude,
                })
            } catch (error) {
                setError(getErrorMessage(error))
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
        } catch (error) {
            setError(getErrorMessage(error))
        }
    }

    // Guardar cambios Y geocodificar en un solo paso
    const handleSaveAndGeocode = async (data: DealershipFormValues) => {
        if (!id) return

        if (!isMapsApiLoaded) {
            setError("Cargando servicios de mapas... Por favor intenta de nuevo.")
            return
        }

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
        } catch (error) {
            setError(getErrorMessage(error))
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
        } catch (error) {
            setError(getErrorMessage(error))
        } finally {
            setDeleting(false)
        }
    }

    if (loading) {
        return <DealershipFormSkeleton />
    }

    return (
        <div className="flex flex-col h-full gap-1">
            <div className="flex items-center justify-between min-h-[48px] mb-2 gap-4">
                <div className="flex-1">
                    <AdminBreadcrumb segments={[
                        { label: "Concesionarios", href: "/admin/concesionarios" },
                        { label: "Editar" }
                    ]} />
                </div>

                <div className="flex-1 flex items-center justify-center">
                    <h1 className="text-xl md:text-2xl font-bold whitespace-nowrap">Editar concesionario</h1>
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

                            <ConcesionarioForm form={form} />

                            <div className="flex flex-wrap gap-3 pt-6 mt-auto border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(-1)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" size="sm" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    Guardar cambios
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="ml-auto text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
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
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card className="flex flex-col gap-1 py-1">
                    <CardHeader className="p-2 pb-0">
                        <CardTitle className="flex items-center gap-2 text-base text-foreground font-semibold">
                            <MapPin className="h-4 w-4" />
                            Ubicación
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-3">
                        {geocoded && coordinates.lat && coordinates.lng ? (
                            <>
                                <div className="flex-1 min-h-[200px] rounded-lg overflow-hidden border">
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
                                <div className="flex-1 min-h-[200px] rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
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
                                        Obtener ubicación
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
