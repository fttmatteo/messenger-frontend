import { useEffect, useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { dealershipService } from "@/features/dealership/services/dealership.service"
import { useAdminUI } from "@/shared/context/AdminUIContext"
import { Button } from "@/shared/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/shared/components/ui/alert-dialog"
import { Badge } from "@/shared/components/ui/badge"
import { Map } from "@/features/location/components/Map"
import { MAP_LIBRARIES } from "@/shared/lib/maps.constants"
import { useGoogleMap, useJsApiLoader } from "@react-google-maps/api"
import { Loader2, MapPin, Trash2, Save } from "lucide-react"
import { getErrorMessage } from "@/shared/lib/error-utils"
import { DealershipForm } from "@/features/dealership/components/DealershipForm"
import { dealershipSchema, type DealershipFormValues } from "@/shared/schemas/dealership.schema"
import { capitalizeWords } from "@/shared/utils/stringUtils"

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

export interface EditDealershipDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    dealershipId: string | null
    onSuccess: () => void
}

/**
 * Modal para editar la información de un concesionario existente.
 */
export function EditDealershipDialog({ open, onOpenChange, dealershipId, onSuccess }: EditDealershipDialogProps) {
    const { setSuccess, setError } = useAdminUI()
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [geocoded, setGeocoded] = useState(false)
    const [geocoding, setGeocoding] = useState(false)
    const [coordinates, setCoordinates] = useState<{ lat?: number; lng?: number }>({})
    const [initialAddress, setInitialAddress] = useState("")

    const { isLoaded: isMapsApiLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: MAP_LIBRARIES,
        version: 'weekly'
    })

    const form = useForm<DealershipFormValues>({
        resolver: zodResolver(dealershipSchema),
    })

    const { handleSubmit, reset, watch, formState: { isSubmitting, isDirty } } = form
    const currentAddress = watch("address")
    const addressChanged = currentAddress?.trim() !== "" && currentAddress?.trim() !== initialAddress.trim()

    useEffect(() => {
        if (open && dealershipId) {
            const fetchDealership = async () => {
                try {
                    setLoading(true)
                    const dealership = await dealershipService.getById(dealershipId)
                    reset({
                        name: dealership.name,
                        address: dealership.address,
                        phone: dealership.phone,
                        zone: dealership.zone ? dealership.zone.toUpperCase() : "",
                        whatsappPin: dealership.whatsappPin || "",
                    })
                    setInitialAddress(dealership.address)
                    setGeocoded(dealership.isGeolocated || false)
                    setCoordinates({
                        lat: dealership.latitude,
                        lng: dealership.longitude,
                    })
                } catch (error) {
                    setError(getErrorMessage(error))
                    onOpenChange(false)
                } finally {
                    setLoading(false)
                }
            }
            fetchDealership()
        }
    }, [open, dealershipId, reset, onOpenChange, setError])

    const onSubmit = async (data: DealershipFormValues) => {
        if (!dealershipId) return
        try {
            await dealershipService.update(dealershipId, {
                name: capitalizeWords(data.name.trim()),
                address: capitalizeWords(data.address.trim()),
                phone: data.phone,
                zone: data.zone,
                whatsappPin: data.whatsappPin,
            })
            setSuccess("Concesionario actualizado exitosamente")
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            setError(getErrorMessage(error))
        }
    }

    const handleSaveAndGeocode = async (data: DealershipFormValues) => {
        if (!dealershipId) return

        if (!isMapsApiLoaded) {
            setError("Cargando servicios de mapas... Por favor intenta de nuevo.")
            return
        }

        try {
            setGeocoding(true)
            await dealershipService.update(dealershipId, {
                name: capitalizeWords(data.name.trim()),
                address: capitalizeWords(data.address.trim()),
                phone: data.phone,
                zone: data.zone,
                whatsappPin: data.whatsappPin,
            })
            const result = await dealershipService.geocode(dealershipId)
            setGeocoded(true)
            setCoordinates({
                lat: result.latitude,
                lng: result.longitude,
            })
            setInitialAddress(capitalizeWords(data.address.trim()))
            setSuccess("Guardado y geocodificado correctamente")
            onSuccess()
        } catch (error) {
            setError(getErrorMessage(error))
        } finally {
            setGeocoding(false)
        }
    }

    const handleDelete = async () => {
        if (!dealershipId) return
        try {
            setDeleting(true)
            await dealershipService.delete(dealershipId)
            setSuccess("Concesionario eliminado exitosamente")
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            setError(getErrorMessage(error))
        } finally {
            setDeleting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1000px] flex flex-col max-h-[90vh] overflow-hidden p-0 gap-0">
                <DialogHeader className="p-4 md:p-6 pb-2 border-b shrink-0">
                    <DialogTitle className="text-xl md:text-2xl font-bold">Editar concesionario</DialogTitle>
                    <DialogDescription className="text-muted-foreground text-sm">
                        Modifica los detalles y la ubicación geográfica
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center min-h-[300px]">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
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
                                        {geocoded && coordinates.lat && coordinates.lng ? (
                                            <>
                                                <div className="flex-1 rounded-lg overflow-hidden border min-h-[200px]">
                                                    <Map center={{ lat: coordinates.lat, lng: coordinates.lng }} zoom={16}>
                                                        <DealershipMarker position={{ lat: coordinates.lat, lng: coordinates.lng }} />
                                                    </Map>
                                                </div>
                                                {addressChanged && (
                                                    <Button
                                                        type="button"
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
                                                <div className="flex justify-center">
                                                    <Badge variant="secondary">Sin ubicación</Badge>
                                                </div>
                                                <p className="text-xs text-center text-muted-foreground">
                                                    {addressChanged
                                                        ? "Guarda y geocodifica para obtener las coordenadas."
                                                        : "Este concesionario aún no ha sido ubicado."
                                                    }
                                                </p>
                                                {addressChanged && (
                                                    <Button
                                                        type="button"
                                                        className="w-full mt-auto"
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
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="p-4 md:p-6 border-t shrink-0 flex items-center justify-between gap-3 bg-muted/5">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4 md:mr-2" />
                                        <span className="hidden md:inline">Eliminar</span>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Eliminar concesionario?</AlertDialogTitle>
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

                            <div className="flex items-center gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onOpenChange(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" size="sm" disabled={isSubmitting || !isDirty}>
                                    {isSubmitting ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-4 w-4" />
                                    )}
                                    Guardar cambios
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
