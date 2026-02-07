import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { dealershipService } from "@/services/dealership.service"
import { Button } from "@/components/ui/button"
import { AdminBreadcrumb } from "@/components/ui/admin-breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, MapPin } from "lucide-react"
import { useAdminUI } from "@/context/AdminUIContext"
import { capitalizeWords } from "@/lib/format-utils"
import { getErrorMessage } from "@/lib/error-utils"
import { useState, useRef, useEffect } from "react"
import { Map } from "@/components/Map"
import { MAP_LIBRARIES } from "@/lib/maps.constants"
import { useGoogleMap, useJsApiLoader } from "@react-google-maps/api"
import { Badge } from "@/components/ui/badge"
import { ConcesionarioForm } from "@/components/admin/ConcesionarioForm"
import { dealershipSchema, type DealershipFormValues } from "@/schemas/dealership.schema"
import { createLogger } from "@/utils/logger"

const logger = createLogger('CreateConcesionario')


/**
 * Marcador personalizado para mostrar la ubicación previa del concesionario en el mapa.
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
 * Página para la creación de un nuevo concesionario.
 * Incluye un formulario validado y una funcionalidad de previsualización 
 * en el mapa mediante la geocodificación de la dirección ingresada.
 */
export default function CreateConcesionario() {
    const navigate = useNavigate()
    const { setSuccess, setError } = useAdminUI()
    const [coordinates, setCoordinates] = useState<{ lat?: number; lng?: number }>({})
    const [geocoding, setGeocoding] = useState(false)
    const [previewDone, setPreviewDone] = useState(false)

    // Cargar la API de Google Maps a nivel de página para que el Geocoder esté disponible
    const { isLoaded: isMapsApiLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: MAP_LIBRARIES,
        version: 'weekly'
    })

    const form = useForm<DealershipFormValues>({
        resolver: zodResolver(dealershipSchema),
        defaultValues: {
            name: "",
            address: "",
            phone: "",
            zone: "",
        },
    })

    const { handleSubmit, watch, formState: { isSubmitting } } = form
    const currentAddress = watch("address")

    const handlePreviewLocation = async () => {
        if (!currentAddress || currentAddress.length < 5) return

        if (!isMapsApiLoaded) {
            setError("Cargando servicios de mapas... Por favor intenta de nuevo en un momento.")
            return
        }

        setGeocoding(true)
        try {
            if (!window.google?.maps?.Geocoder) {
                setError("Servicio de geocodificación no disponible en este momento")
                setGeocoding(false)
                return
            }
            const geocoder = new google.maps.Geocoder()
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
                setError("No se encontraron coordenadas para esta dirección. Intenta ser más específico.")
            }
        } catch (error) {
            logger.error("Geocoding error", error)
            setError("Error obteniendo ubicación. Verifica tu conexión a internet.")
        } finally {
            setGeocoding(false)
        }
    }

    const onSubmit = async (data: DealershipFormValues) => {
        try {
            const created = await dealershipService.create({
                name: capitalizeWords(data.name.trim()),
                address: capitalizeWords(data.address.trim()),
                phone: data.phone,
                zone: data.zone,
            })

            try {
                await dealershipService.geocode(created.idDealership)
                setSuccess("Concesionario creado y ubicado exitosamente")
            } catch (geocodeError) {
                logger.error("Auto geocoding failed", geocodeError)
                setSuccess("Concesionario creado, pero falló la geocodificación automática")
            }

            navigate("/admin/concesionarios")
        } catch (error) {
            setError(getErrorMessage(error))
        }
    }

    return (
        <div className="flex flex-col h-full gap-1 overflow-hidden">
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

            <div className="flex-1 grid gap-2 lg:grid-cols-3 min-h-0 overflow-y-auto">
                <Card className="lg:col-span-2 flex flex-col gap-1 py-1 min-h-0">
                    <CardHeader className="p-2 pb-0">
                        <CardTitle className="text-base text-foreground font-semibold">Información del concesionario</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">

                            <ConcesionarioForm form={form} />

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
