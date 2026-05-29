import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { dealershipService } from "@/features/dealership/services/dealership.service"
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Badge } from "@/shared/components/ui/badge"
import { Loader2, MapPin } from "lucide-react"
import { useAdminUI } from "@/shared/context/AdminUIContext"
import { capitalizeWords } from "@/shared/utils/stringUtils"
import { getErrorMessage } from "@/shared/lib/error-utils"
import { Map } from "@/features/location/components/Map"
import { useGoogleMap } from "@react-google-maps/api"
import { useMaps } from "@/shared/context/MapsContext"
import { DealershipForm } from "@/features/dealership/components/DealershipForm"
import { dealershipSchema, type DealershipFormValues } from "@/shared/schemas/dealership.schema"
import { createLogger } from "@/shared/utils/logger"

const logger = createLogger('CreateDealershipDialog')

function DealershipMarker({ position }: { position: google.maps.LatLngLiteral }) {
    const map = useGoogleMap()
    const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null)

    useEffect(() => {
        if (!map || !window.google?.maps?.marker) return

        const marker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position,
            title: "Ubicación del Concesionario",
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

export interface CreateDealershipDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

/**
 * Modal para la creación de un nuevo concesionario.
 */
export function CreateDealershipDialog({ open, onOpenChange, onSuccess }: CreateDealershipDialogProps) {
    const { setSuccess, setError } = useAdminUI()
    const [coordinates, setCoordinates] = useState<{ lat?: number; lng?: number }>({})
    const [geocoding, setGeocoding] = useState(false)
    const [previewDone, setPreviewDone] = useState(false)

    const { isLoaded: isMapsApiLoaded } = useMaps()

    const form = useForm<DealershipFormValues>({
        resolver: zodResolver(dealershipSchema),
        defaultValues: {
            name: "",
            address: "",
            phone: "",
            zone: "",
            whatsappPin: "",
        },
    })

    const { handleSubmit, watch, reset, formState: { isSubmitting, isDirty } } = form
    const currentAddress = watch("address")

    useEffect(() => {
        if (open) {
            reset({
                name: "",
                address: "",
                phone: "",
                zone: "",
                whatsappPin: "",
            })
            setCoordinates({})
            setPreviewDone(false)
        }
    }, [open, reset])

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
                : `${currentAddress}, Medellín, Colombia`

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
            logger.error("Error de Geocodificación", error)
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
                whatsappPin: data.whatsappPin,
            })

            try {
                await dealershipService.geocode(created.uuid)
                setSuccess("Concesionario creado y ubicado exitosamente")
            } catch (geocodeError) {
                logger.error("La Geocodificación Automática Falló", geocodeError)
                setSuccess("Concesionario creado, pero falló la geocodificación automática")
            }

            onSuccess()
            onOpenChange(false)
        } catch (error) {
            setError(getErrorMessage(error))
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1000px] flex flex-col max-h-[90vh] overflow-hidden p-0 gap-0">
                <DialogHeader className="p-4 md:p-6 pb-2 border-b shrink-0">
                    <DialogTitle className="text-xl md:text-2xl font-bold">Nuevo concesionario</DialogTitle>
                    <DialogDescription className="text-muted-foreground text-sm">
                        Ingresa los datos y previsualiza la ubicación en el mapa
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                            <div className="space-y-4 lg:col-span-2">
                                <h3 className="text-sm font-semibold border-b pb-2">Información del concesionario</h3>
                                <DealershipForm form={form} />
                            </div>
                            
                            <div className="space-y-4 flex flex-col">
                                <h3 className="text-sm font-semibold border-b pb-2 flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Ubicación
                                </h3>
                                <div className="flex-1 flex flex-col gap-3 min-h-[250px]">
                                    {coordinates.lat && coordinates.lng ? (
                                        <>
                                            <div className="flex-1 rounded-lg overflow-hidden border min-h-[200px]">
                                                <Map center={{ lat: coordinates.lat, lng: coordinates.lng }} zoom={16}>
                                                    <DealershipMarker position={{ lat: coordinates.lat, lng: coordinates.lng }} />
                                                </Map>
                                            </div>
                                            <Button
                                                type="button"
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
                                            <div className="flex justify-center">
                                                {previewDone ? (
                                                    <Badge variant="destructive">No encontrada</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Pendiente de ubicar</Badge>
                                                )}
                                            </div>
                                            <Button
                                                type="button"
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
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-4 md:p-6 border-t shrink-0 flex items-center justify-end gap-3 bg-muted/5">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                            className="!h-[32px] !min-h-[32px] !max-h-[32px] box-border text-xs m-0"
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" size="sm" disabled={isSubmitting || !isDirty} className="!h-[32px] !min-h-[32px] !max-h-[32px] box-border text-xs m-0">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Crear concesionario
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
