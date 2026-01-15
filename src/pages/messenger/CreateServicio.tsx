import { useState, useEffect, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"


import { serviceDeliveryService } from "@/services/service.service"
import { dealershipService } from "@/services/dealership.service"
import type { Dealership } from "@/types/dealership.types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { PlateCamera, ImageUploadFallback } from "@/components/camera"
import { X, Loader2, Bike, Camera, Building2, Edit3 } from "lucide-react"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/error-utils"
import { useSmartLocation } from "@/hooks/use-smart-location"
import { useSafeAreaBottom } from "@/hooks/use-safe-area"

// Form validation schema
const formSchema = z.object({
    dealershipId: z.string().min(1, "El concesionario es obligatorio"),
    manualPlateNumber: z.string().optional(),
    image: z.instanceof(File, { message: "La imagen es obligatoria" })
})

type FormValues = z.infer<typeof formSchema>

export default function MessengerCreateServicio() {
    const navigate = useNavigate()
    const { getCurrentLocation } = useSmartLocation()
    const safeAreaBottom = useSafeAreaBottom()

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






    // ... other state ...

    // ... (keep handlePhotoCapture, handleImageSelect, clearImage) ...

    // REMOVED: getLocation function (logic moved to hook)

    // Form submit handler
    const onSubmit = async (values: FormValues) => {
        try {
            setLoading(true)

            let latitude: number | undefined
            let longitude: number | undefined

            try {
                const location = await getCurrentLocation();
                latitude = location.latitude;
                longitude = location.longitude;
            } catch {
                // Location error already handled/toasted in hook
            }

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

    // Loading skeleton while fetching dealerships
    if (loadingData) {
        return (
            <div className="pb-24">
                <div className="">
                    {/* Photo Section Skeleton */}
                    <div className="p-4 pb-2">
                        <Card className="p-4 border-border/50">
                            <div className="flex items-center gap-2 mb-3">
                                <Skeleton className="h-7 w-7 rounded-lg" />
                                <Skeleton className="h-4 w-28" />
                            </div>
                            <Skeleton className="w-full aspect-[4/3] rounded-lg" />
                        </Card>
                    </div>

                    {/* Dealership Card Skeleton */}
                    <div className="px-4 pb-2">
                        <Card className="p-4 border-border/50">
                            <div className="flex items-center gap-2 mb-3">
                                <Skeleton className="h-7 w-7 rounded-lg" />
                                <Skeleton className="h-4 w-40" />
                            </div>
                            <Skeleton className="h-11 w-full rounded-md" />
                        </Card>
                    </div>
                </div>

                {/* Fixed Bottom Action Skeleton */}
                <div
                    className="p-4 border-t bg-background/95"
                    style={{ paddingBottom: `calc(1rem + ${safeAreaBottom}px)` }}
                >
                    <div className="flex gap-3">
                        <Skeleton className="h-12 w-24 rounded-xl" />
                        <Skeleton className="flex-1 h-12 rounded-xl" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="pb-24">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
                    {/* Content */}
                    <div className="">
                        {/* Photo Section Card */}
                        <div className="p-4 pb-2">
                            <Card className="p-4 border-border/50">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 rounded-lg bg-primary/10">
                                        <Camera className="h-4 w-4 text-primary" strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-sm font-bold tracking-tight">Foto de la placa</h3>
                                    <span className="text-xs text-red-500 font-bold">*</span>
                                </div>
                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={() => (
                                        <FormItem>
                                            <FormControl>
                                                <div>
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
                            </Card>
                        </div>

                        {/* Dealership Select Card */}
                        <div className="px-4 pb-2">
                            <Card className="p-4 border-border/50">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 rounded-lg bg-primary/10">
                                        <Building2 className="h-4 w-4 text-primary" strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-sm font-bold tracking-tight">Concesionario destino</h3>
                                    <span className="text-xs text-red-500 font-bold">*</span>
                                </div>
                                <FormField
                                    control={form.control}
                                    name="dealershipId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                disabled={loadingData}
                                                name="dealershipId"
                                            >
                                                <FormControl>
                                                    <SelectTrigger id="dealershipId" className="h-11 touch-manipulation">
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
                            </Card>
                        </div>

                        {/* Manual Plate Number Card - Only shown after OCR fails */}
                        {showManualPlate && (
                            <div className="px-4 pb-2">
                                <Card className="p-4 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 rounded-lg bg-amber-500/10">
                                            <Edit3 className="h-4 w-4 text-amber-600 dark:text-amber-400" strokeWidth={2.5} />
                                        </div>
                                        <h3 className="text-sm font-bold tracking-tight">Ingreso manual de placa</h3>
                                        <span className="text-xs text-red-500 font-bold">*</span>
                                    </div>
                                    <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
                                        No se pudo detectar la placa automáticamente. Por favor ingrésala manualmente.
                                    </p>
                                    <FormField
                                        control={form.control}
                                        name="manualPlateNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        placeholder="ABC123"
                                                        {...field}
                                                        className="h-11 font-mono uppercase touch-manipulation text-lg tracking-wider"
                                                        maxLength={7}
                                                        autoFocus
                                                        autoComplete="off"
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-xs">
                                                    Ingresa la placa del vehículo
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </Card>
                            </div>
                        )}
                    </div>

                    {/* Fixed Bottom Action */}
                    <div
                        className="fixed bottom-0 left-0 right-0 z-40 p-4 border-t border-border/60 bg-background"
                        style={{ paddingBottom: `calc(1rem + ${safeAreaBottom}px)` }}
                    >
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/messenger", { replace: true })}
                                disabled={loading}
                                className="flex-1 h-12 text-base font-bold rounded-2xl transition-all border-border/50 active:scale-[0.98]"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || loadingData || showCamera}
                                className="flex-1 h-12 text-base font-bold rounded-2xl transition-all shadow-lg active:scale-[0.98]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Creando...
                                    </>
                                ) : (
                                    <>
                                        <Bike className="mr-2 h-5 w-5" />
                                        Crear servicio
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}
