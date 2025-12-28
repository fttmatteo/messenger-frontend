import { useState, useEffect, useRef, useCallback, useMemo } from "react"
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
// import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, Loader2, Camera, CameraOff, Bike } from "lucide-react"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/error-utils"

const formSchema = z.object({
    dealershipId: z.string().min(1, "El concesionario es obligatorio"),
    manualPlateNumber: z.string().optional(),
    image: z.instanceof(File, { message: "La imagen es obligatoria" })
})

type FormValues = z.infer<typeof formSchema>

export default function MessengerCreateServicio() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [dealerships, setDealerships] = useState<Dealership[]>([])
    const [loadingData, setLoadingData] = useState(true)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [showManualPlate, setShowManualPlate] = useState(false)
    const [cameraActive, setCameraActive] = useState(false)
    const [cameraReady, setCameraReady] = useState(false)
    const [cameraError, setCameraError] = useState<string | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            dealershipId: "",
            manualPlateNumber: "",
        },
    })
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
    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null
        }
        setCameraActive(false)
        setCameraReady(false)
    }, [])

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
        return () => {
            stopCamera()
        }
    }, [stopCamera])
    const startCamera = useCallback(async () => {
        // If camera is already active or starting, don't re-trigger
        if (streamRef.current || (cameraActive && !cameraError)) {
            console.log('Camera already active or starting, skipping startCamera')
            return
        }

        try {
            setCameraError(null)
            setCameraReady(false)
            setCameraActive(true)

            // Safety timeout - if camera doesn't initialize in 20 seconds, show error
            const timeoutId = setTimeout(() => {
                if (!videoRef.current?.paused === false) { // Extra check if video is playing
                    console.warn('Camera initialization timeout')
                    setCameraError('La cámara tardó demasiado en iniciar. Intenta de nuevo o usa la galería.')
                    stopCamera()
                }
            }, 20000)

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            })

            streamRef.current = stream

            if (videoRef.current) {
                videoRef.current.srcObject = stream

                videoRef.current.onloadedmetadata = () => {
                    if (videoRef.current) {
                        videoRef.current.play()
                            .then(() => {
                                clearTimeout(timeoutId)
                                setCameraReady(true)
                            })
                            .catch(err => {
                                clearTimeout(timeoutId)
                                console.error('Video play error:', err)
                                setCameraError('Error al reproducir video. Intenta de nuevo.')
                                stopCamera()
                            })
                    }
                }

                // Additional timeout for video element not responding
                videoRef.current.onerror = () => {
                    clearTimeout(timeoutId)
                    setCameraError('Error en el elemento de video.')
                    stopCamera()
                }
            } else {
                clearTimeout(timeoutId)
                setCameraError('Componente de video no disponible')
                setCameraActive(false)
            }
        } catch (error) {
            console.error('Camera error:', error)
            setCameraActive(false)

            // More specific error messages
            let errorMessage = 'No se pudo acceder a la cámara.'
            if (error instanceof Error) {
                if (error.name === 'NotAllowedError') {
                    errorMessage = 'Permiso de cámara denegado. Habilítalo en configuración.'
                } else if (error.name === 'NotFoundError') {
                    errorMessage = 'No se encontró una cámara en el dispositivo.'
                } else if (error.name === 'NotReadableError') {
                    errorMessage = 'La cámara está siendo usada por otra app.'
                } else if (error.name === 'OverconstrainedError') {
                    errorMessage = 'La cámara no soporta la configuración solicitada.'
                }
            }

            setCameraError(errorMessage)
            toast.error("Error de cámara", {
                description: errorMessage,
                id: "error-camara"
            })
        }
    }, [stopCamera])
    useEffect(() => {
        startCamera()
    }, [startCamera])
    const capturePhoto = () => {
        const video = videoRef.current
        const canvas = canvasRef.current

        if (!video || !canvas) {
            toast.error("Error", { description: "Componentes no disponibles", id: "error-componentes" })
            return
        }

        if (video.videoWidth === 0 || video.videoHeight === 0) {
            toast.error("Error", { description: "El video aún no está listo", id: "error-video" })
            return
        }

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        const ctx = canvas.getContext('2d')
        if (!ctx) {
            toast.error("Error", { description: "No se pudo crear contexto de canvas", id: "error-canvas" })
            return
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `placa_${Date.now()}.jpg`, { type: 'image/jpeg' })
                form.setValue("image", file)

                const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
                setImagePreview(dataUrl)

                stopCamera()
                toast.success("Foto capturada")
            } else {
                toast.error("Error al capturar foto", { id: "error-captura" })
            }
        }, 'image/jpeg', 0.9)
    }

    const onSubmit = async (values: FormValues) => {
        try {
            setLoading(true)

            // Try to get location with timeout
            let latitude: number | undefined
            let longitude: number | undefined

            // OPTIMIZATION: Check last known location from tracking service first
            const lastKnown = trackingService.getLastKnownLocation()
            const isRecent = lastKnown && (Date.now() - lastKnown.timestamp < 5 * 60 * 1000) // 5 minutes validity

            if (isRecent && lastKnown) {
                console.log("Using cached location for service creation")
                latitude = lastKnown.latitude
                longitude = lastKnown.longitude
            } else {
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

                    latitude = position.coords.latitude
                    longitude = position.coords.longitude
                } catch (error) {
                    console.warn("Could not get location:", error)
                    // Proceed without location but warn user with specific reason
                    const msg = error instanceof Error ? error.message : "Error desconocido"
                    toast.warning("Ubicación no capturada", {
                        description: `${msg}. El servicio se creará sin ubicación inicial.`,
                        duration: 4000
                    })
                }
            }

            await serviceDeliveryService.create({
                image: values.image,
                dealershipId: values.dealershipId,
                manualPlateNumber: values.manualPlateNumber || undefined,
                latitude,
                longitude
            })

            // Success notification removed per request - Only show errors
            // toast.success("Servicio creado exitosamente", {
            //     description: values.manualPlateNumber
            //         ? `Placa: ${values.manualPlateNumber}`
            //         : "Procesando detección OCR..."
            // })

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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error("Archivo inválido", {
                    description: "Por favor selecciona una imagen",
                    id: "error-archivo-invalido"
                })
                return
            }

            if (file.size > 10 * 1024 * 1024) {
                toast.error("Archivo muy grande", {
                    description: "El tamaño máximo es 10MB",
                    id: "error-archivo-grande"
                })
                return
            }

            form.setValue("image", file)

            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const clearImage = () => {
        form.setValue("image", undefined as unknown as File)
        setImagePreview(null)
        stopCamera()
        const fileInput = document.getElementById('file-upload') as HTMLInputElement
        if (fileInput) fileInput.value = ''
    }

    const handleBack = () => {
        stopCamera()
        navigate(-1)
    }

    return (
        <div className="flex flex-col gap-3 sm:gap-4 min-h-0">
            {/* Hidden canvas for capturing */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Header with back button */}
            <header className="flex items-center gap-3">
            </header>

            {/* Main Form Area */}
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
                                            {!imagePreview && !cameraActive ? (
                                                <div className="space-y-2">
                                                    {/* Camera button */}
                                                    <Button
                                                        type="button"
                                                        onClick={startCamera}
                                                        className="w-full h-32 sm:h-40 flex flex-col items-center justify-center gap-2 bg-primary/5 hover:bg-primary/10 border-2 border-dashed border-primary/30 text-primary touch-manipulation"
                                                    >
                                                        <Camera className="w-10 h-10 sm:w-12 sm:h-12" />
                                                        <span className="font-semibold text-sm">Abrir cámara</span>
                                                    </Button>

                                                    {cameraError && (
                                                        <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-lg text-destructive text-xs">
                                                            <CameraOff className="w-4 h-4 shrink-0" />
                                                            <span>{cameraError}</span>
                                                        </div>
                                                    )}

                                                    {/* File upload fallback */}
                                                    <label
                                                        htmlFor="file-upload"
                                                        className="flex items-center justify-center w-full h-11 border-2 border-dashed rounded-lg cursor-pointer bg-muted/10 hover:bg-muted/20 transition-colors touch-manipulation"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Upload className="w-4 h-4 text-muted-foreground" />
                                                            <span className="text-xs text-muted-foreground">
                                                                Seleccionar de galería
                                                            </span>
                                                        </div>
                                                        <input
                                                            id="file-upload"
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={handleImageChange}
                                                        />
                                                    </label>
                                                </div>
                                            ) : cameraActive ? (
                                                <div className="space-y-2">
                                                    {/* Live camera view */}
                                                    <div className="relative rounded-lg overflow-hidden bg-black aspect-[4/3]">
                                                        <video
                                                            ref={videoRef}
                                                            autoPlay
                                                            playsInline
                                                            muted
                                                            className="w-full h-full object-cover"
                                                        />

                                                        {!cameraReady && (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                                <div className="text-center text-white">
                                                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-1" />
                                                                    <p className="text-xs">Cargando...</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {cameraReady && (
                                                            <div className="absolute inset-3 border-2 border-white/50 rounded-lg pointer-events-none">
                                                                <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-white" />
                                                                <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-white" />
                                                                <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-white" />
                                                                <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-white" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Camera controls */}
                                                    <div className="flex gap-2">
                                                        <Button
                                                            type="button"
                                                            onClick={capturePhoto}
                                                            disabled={!cameraReady}
                                                            className="flex-1 h-12 text-sm touch-manipulation"
                                                        >
                                                            {cameraReady ? (
                                                                <><Camera className="mr-2 h-5 w-5" /> Capturar</>
                                                            ) : (
                                                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando...</>
                                                            )}
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={stopCamera}
                                                            className="h-12 px-4 touch-manipulation"
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <img
                                                        src={imagePreview || ""}
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
                                disabled={loading || loadingData || cameraActive}
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
