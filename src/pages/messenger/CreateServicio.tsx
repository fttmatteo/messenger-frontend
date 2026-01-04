import { useState, useEffect, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { serviceDeliveryService } from "@/services/service.service"
import { trackingService } from "@/services/tracking.service"
import { dealershipService } from "@/services/dealership.service"
import type { Dealership } from "@/types/dealership.types"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { PlateCamera, ImageUploadFallback } from "@/components/camera"
import { X, Loader2, Bike } from "lucide-react"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/error-utils"

// Form validation schema
const formSchema = z.object({
    dealershipId: z.string().min(1, "El concesionario es obligatorio"),
    manualPlateNumber: z.string().optional(),
    image: z.instanceof(File, { message: "La imagen es obligatoria" })
})

type FormValues = z.infer<typeof formSchema>

export default function MessengerCreateServicio() {
    const navigate = useNavigate()

    // Form state
    const [loading, setLoading] = useState(false)
    const [dealerships, setDealerships] = useState<Dealership[]>([])
    const [loadingData, setLoadingData] = useState(true)
    const [showManualPlate, setShowManualPlate] = useState(false)

    // Image state
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [showCamera, setShowCamera] = useState(true)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            dealershipId: "",
            manualPlateNumber: "",
        },
    })

    // Group dealerships by zone
    const groupedDealerships = useMemo(() => {
        const groups: Record<string, Dealership[]> = {}
        dealerships.forEach(d => {
            const zone = d.zone || 'Sin Zona'
            if (!groups[zone]) {
                groups[zone] = []
            }
            groups[zone].push(d)
        })
        return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
    }, [dealerships])

    // Load dealerships on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoadingData(true)
                const dealershipsData = await dealershipService.getAll()
                setDealerships(dealershipsData)
            } catch (error) {
                toast.error("Error al cargar concesionarios", {
                    description: getErrorMessage(error),
                    id: "error-cargar-datos"
                })
            } finally {
                setLoadingData(false)
            }
        }
        fetchData()
    }, [])

    // Handle photo capture from camera
    const handlePhotoCapture = useCallback((file: File, previewUrl: string) => {
        form.setValue("image", file)
        setImagePreview(previewUrl)
        setShowCamera(false)
    }, [form])

    // Handle image selection from gallery
    const handleImageSelect = useCallback((file: File, previewUrl: string) => {
        form.setValue("image", file)
        setImagePreview(previewUrl)
        setShowCamera(false)
    }, [form])

    // Clear selected image
    const clearImage = useCallback(() => {
        form.setValue("image", undefined as unknown as File)
        setImagePreview(null)
        setShowCamera(true)
    }, [form])

    // Get user location with fallback
    const getLocation = async (): Promise<{ latitude?: number; longitude?: number }> => {
        // Check cached location first
        const lastKnown = trackingService.getLastKnownLocation()
        const isRecent = lastKnown && (Date.now() - lastKnown.timestamp < 5 * 60 * 1000)

        if (isRecent && lastKnown) {
            console.log("Using cached location for service creation")
            return { latitude: lastKnown.latitude, longitude: lastKnown.longitude }
        }

        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject(new Error("La geolocalización no es soportada por este navegador."))
                    return
                }

                const timeoutId = setTimeout(() => {
                    reject(new Error("Tiempo de espera agotado (Timeout)"))
                }, 10000)

                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        clearTimeout(timeoutId)
                        resolve(pos)
                    },
                    (err) => {
                        clearTimeout(timeoutId)
                        let msg = err.message
                        if (err.code === 1) msg = "Permiso de ubicación denegado"
                        else if (err.code === 2) msg = "Ubicación no disponible"
                        else if (err.code === 3) msg = "Tiempo de espera agotado"
                        reject(new Error(msg))
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                )
            })

            return { latitude: position.coords.latitude, longitude: position.coords.longitude }
        } catch (error) {
            console.warn("Could not get location:", error)
            const msg = error instanceof Error ? error.message : "Error desconocido"
            toast.warning("Ubicación no capturada", {
                description: `${msg}. El servicio se creará sin ubicación inicial.`,
                duration: 4000
            })
            return {}
        }
    }

    // Form submit handler
    const onSubmit = async (values: FormValues) => {
        try {
            setLoading(true)
            const { latitude, longitude } = await getLocation()

            await serviceDeliveryService.create({
                image: values.image,
                dealershipId: values.dealershipId,
                manualPlateNumber: values.manualPlateNumber || undefined,
                latitude,
                longitude
            })

            navigate("/messenger")
        } catch (error) {
            const errorMessage = getErrorMessage(error)
            const isOcrError =
                (errorMessage.toLowerCase().includes('ocr') ||
                    errorMessage.toLowerCase().includes('placa') ||
                    errorMessage.toLowerCase().includes('plate') ||
                    errorMessage.toLowerCase().includes('detectar') ||
                    errorMessage.toLowerCase().includes('reconocer')) &&
                !errorMessage.toLowerCase().includes('ya tiene') &&
                !errorMessage.toLowerCase().includes('existe') &&
                !errorMessage.toLowerCase().includes('registrado')

            if (isOcrError && !showManualPlate) {
                setShowManualPlate(true)
                toast.warning("No se pudo detectar la placa", {
                    description: "Por favor ingresa la placa manualmente",
                    id: "ocr-failed"
                })
            } else {
                toast.error("Error al crear servicio", {
                    description: errorMessage,
                    id: "error-crear-servicio"
                })
            }
        } finally {
            setLoading(false)
        }
    }

    const handleBack = () => {
        navigate(-1)
    }

    return (
        <div className="flex flex-col gap-3 sm:gap-4 min-h-0">
            <div className="px-1 pb-4 space-y-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Image Upload - Camera first approach */}
                        <FormField
                            control={form.control}
                            name="image"
                            render={() => (
                                <FormItem>
                                    <FormLabel className="text-sm">Foto de la placa *</FormLabel>
                                    <FormControl>
                                        <div className="space-y-3">
                                            {!imagePreview && showCamera ? (
                                                <div className="space-y-2">
                                                    <PlateCamera
                                                        onCapture={handlePhotoCapture}
                                                        onCancel={() => setShowCamera(false)}
                                                        autoStart
                                                    />
                                                    <ImageUploadFallback onSelect={handleImageSelect} />
                                                </div>
                                            ) : !imagePreview ? (
                                                <div className="space-y-2">
                                                    <PlateCamera
                                                        onCapture={handlePhotoCapture}
                                                        autoStart={false}
                                                    />
                                                    <ImageUploadFallback onSelect={handleImageSelect} />
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="w-full aspect-[4/3] object-contain rounded-lg border bg-muted/10"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        size="icon"
                                                        className="absolute top-2 right-2 h-8 w-8"
                                                        onClick={clearImage}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Dealership Select - Grouped by Zone */}
                        <FormField
                            control={form.control}
                            name="dealershipId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm">Concesionario *</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        disabled={loadingData}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="h-11 touch-manipulation">
                                                <SelectValue placeholder="Selecciona destino" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="max-h-[300px]">
                                            {groupedDealerships.map(([zone, zoneDealerships]) => (
                                                <SelectGroup key={zone}>
                                                    <SelectLabel className="text-xs font-semibold text-primary bg-muted/50 py-2 px-2">
                                                        {zone}
                                                    </SelectLabel>
                                                    {zoneDealerships.map((dealership) => (
                                                        <SelectItem
                                                            key={dealership.idDealership}
                                                            value={String(dealership.idDealership)}
                                                            className="py-3 pl-4"
                                                        >
                                                            {dealership.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Manual Plate Number - Only shown after OCR fails */}
                        {showManualPlate && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                    <span className="text-amber-600 dark:text-amber-400 text-sm">
                                        No se pudo detectar la placa automáticamente. Por favor ingrésala manualmente.
                                    </span>
                                </div>
                                <FormField
                                    control={form.control}
                                    name="manualPlateNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm">Número de placa *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="ABC123"
                                                    {...field}
                                                    className="h-11 font-mono uppercase touch-manipulation text-lg tracking-wider"
                                                    maxLength={7}
                                                    autoFocus
                                                />
                                            </FormControl>
                                            <FormDescription className="text-xs">
                                                Ingresa la placa
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleBack}
                                disabled={loading}
                                className="h-11 touch-manipulation"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || loadingData || showCamera}
                                className="flex-1 h-11 touch-manipulation"
                            >
                                {loading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creando...</>
                                ) : (
                                    <><Bike className="mr-2 h-4 w-4" />Crear servicio</>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    )
}
