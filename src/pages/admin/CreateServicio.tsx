import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { serviceDeliveryService } from "@/services/service.service"
import { dealershipService } from "@/services/dealership.service"
import { employeeService } from "@/services/employee.service"
import type { Dealership } from "@/types/dealership.types"
import type { Employee } from "@/types/employee.types"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Home, Bike, Upload, X, Loader2, Camera, CameraOff } from "lucide-react"
import { toast } from "sonner"

// Form validation schema
const formSchema = z.object({
    dealershipId: z.string().min(1, "El concesionario es obligatorio"),
    messengerDocument: z.string().optional(),
    manualPlateNumber: z.string().optional(),
    image: z.instanceof(File, { message: "La imagen es obligatoria" })
})

type FormValues = z.infer<typeof formSchema>

export default function CreateServicio() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [dealerships, setDealerships] = useState<Dealership[]>([])
    const [messengers, setMessengers] = useState<Employee[]>([])
    const [loadingData, setLoadingData] = useState(true)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    // Camera states
    const [cameraActive, setCameraActive] = useState(false)
    const [cameraReady, setCameraReady] = useState(false)
    const [cameraError, setCameraError] = useState<string | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    const isAdmin = user?.role === 'ADMIN'

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            dealershipId: "",
            messengerDocument: "",
            manualPlateNumber: "",
        },
    })

    // Stop camera function
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
                const [dealershipsData, employeesData] = await Promise.all([
                    dealershipService.getAll(),
                    employeeService.getAll()
                ])
                setDealerships(dealershipsData)

                // Filter only messengers for selection
                const messengersList = employeesData.filter(e => e.role === 'MESSENGER')
                setMessengers(messengersList)
            } catch (error: any) {
                toast.error("Error al cargar datos", {
                    description: error.message,
                    id: "error-cargar-datos-servicio"
                })
            } finally {
                setLoadingData(false)
            }
        }

        fetchData()

        // Cleanup camera on unmount
        return () => {
            stopCamera()
        }
    }, [stopCamera])

    // Start camera
    const startCamera = async () => {
        try {
            setCameraError(null)
            setCameraReady(false)
            setCameraActive(true) // Show video element first

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: 'environment' }, // Prefer rear camera
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            })

            streamRef.current = stream

            if (videoRef.current) {
                videoRef.current.srcObject = stream

                // Wait for video to be ready
                videoRef.current.onloadedmetadata = () => {
                    if (videoRef.current) {
                        videoRef.current.play()
                            .then(() => {
                                setCameraReady(true)
                                toast.success("Cámara lista", { duration: 1500 })
                            })
                            .catch(err => {
                                console.error('Video play error:', err)
                                setCameraError('Error al reproducir video')
                            })
                    }
                }
            }
        } catch (error: any) {
            console.error('Camera error:', error)
            setCameraActive(false)
            setCameraError('No se pudo acceder a la cámara. Verifica los permisos.')
            toast.error("Error de cámara", {
                description: error.message || "No se pudo acceder a la cámara",
                id: "error-camara"
            })
        }
    }

    // Capture photo from camera
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

        // Set canvas size to video size
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        const ctx = canvas.getContext('2d')
        if (!ctx) {
            toast.error("Error", { description: "No se pudo crear contexto de canvas", id: "error-canvas" })
            return
        }

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert to blob
        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `placa_${Date.now()}.jpg`, { type: 'image/jpeg' })
                form.setValue("image", file)

                // Create preview from canvas
                const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
                setImagePreview(dataUrl)

                stopCamera()
                toast.success("📸 Foto capturada exitosamente")
            } else {
                toast.error("Error al capturar foto", { id: "error-captura" })
            }
        }, 'image/jpeg', 0.9)
    }

    const onSubmit = async (values: FormValues) => {
        try {
            setLoading(true)

            await serviceDeliveryService.create({
                image: values.image,
                dealershipId: values.dealershipId,
                messengerDocument: values.messengerDocument,
                manualPlateNumber: values.manualPlateNumber || undefined
            })

            toast.success("Servicio creado exitosamente", {
                description: values.manualPlateNumber
                    ? `Placa manual: ${values.manualPlateNumber}`
                    : "Procesando detección OCR..."
            })

            navigate("/admin/servicios")
        } catch (error: any) {
            toast.error("Error al crear servicio", {
                description: error.response?.data?.message || error.message,
                id: "error-crear-servicio"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error("Archivo inválido", {
                    description: "Por favor selecciona una imagen",
                    id: "error-archivo-invalido"
                })
                return
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Archivo muy grande", {
                    description: "El tamaño máximo es 5MB",
                    id: "error-archivo-grande"
                })
                return
            }

            form.setValue("image", file)

            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const clearImage = () => {
        form.setValue("image", undefined as any)
        setImagePreview(null)
        stopCamera()
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement
        if (fileInput) fileInput.value = ''
    }

    return (
        <div className="space-y-6">
            {/* Hidden canvas for capturing */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Breadcrumbs */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link to="/admin">
                                <Home className="h-4 w-4" />
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link to="/admin/servicios">
                                Servicios
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Crear</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Crear Servicio de Entrega</h1>
                <p className="text-muted-foreground mt-1">
                    Registra una nueva entrega de placa vehicular
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Información del Servicio</CardTitle>
                    <CardDescription>
                        Toma una foto de la placa para detección automática o ingresa el número manualmente
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Image Upload */}
                            <FormField
                                control={form.control}
                                name="image"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Imagen de la Placa *</FormLabel>
                                        <FormControl>
                                            <div className="space-y-4">
                                                {!imagePreview && !cameraActive ? (
                                                    <div className="w-full space-y-3">
                                                        {/* Primary: Camera button */}
                                                        <Button
                                                            type="button"
                                                            onClick={startCamera}
                                                            className="w-full h-48 flex flex-col items-center justify-center gap-3 text-lg bg-primary/5 hover:bg-primary/10 border-2 border-dashed border-primary/30 text-primary"
                                                            size="lg"
                                                        >
                                                            <Camera className="w-16 h-16" />
                                                            <span className="font-semibold">📷 Abrir Cámara</span>
                                                            <span className="text-xs opacity-80">
                                                                Tomar foto de la placa
                                                            </span>
                                                        </Button>

                                                        {cameraError && (
                                                            <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-destructive text-sm">
                                                                <CameraOff className="w-4 h-4 shrink-0" />
                                                                <span>{cameraError}</span>
                                                            </div>
                                                        )}

                                                        {/* Secondary: File upload */}
                                                        <label
                                                            htmlFor="file-upload"
                                                            className="flex items-center justify-center w-full h-14 border-2 border-dashed rounded-lg cursor-pointer bg-muted/10 hover:bg-muted/20 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Upload className="w-5 h-5 text-muted-foreground" />
                                                                <span className="text-sm text-muted-foreground">
                                                                    o seleccionar archivo de galería
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

                                                        <p className="text-xs text-muted-foreground text-center">
                                                            PNG, JPG, WEBP (MAX. 5MB)
                                                        </p>
                                                    </div>
                                                ) : cameraActive ? (
                                                    <div className="space-y-3">
                                                        {/* Live camera view */}
                                                        <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                                                            <video
                                                                ref={videoRef}
                                                                autoPlay
                                                                playsInline
                                                                muted
                                                                className="w-full h-full object-cover"
                                                                style={{ transform: 'scaleX(1)' }}
                                                            />

                                                            {/* Loading overlay */}
                                                            {!cameraReady && (
                                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                                    <div className="text-center text-white">
                                                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                                                        <p className="text-sm">Cargando cámara...</p>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Camera frame overlay */}
                                                            {cameraReady && (
                                                                <div className="absolute inset-4 border-2 border-white/60 rounded-lg pointer-events-none">
                                                                    <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white" />
                                                                    <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white" />
                                                                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white" />
                                                                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Camera controls */}
                                                        <div className="flex gap-2 justify-center">
                                                            <Button
                                                                type="button"
                                                                onClick={capturePhoto}
                                                                disabled={!cameraReady}
                                                                className="flex-1 h-14 text-lg"
                                                                size="lg"
                                                            >
                                                                {cameraReady ? (
                                                                    <>
                                                                        <Camera className="mr-2 h-6 w-6" />
                                                                        📸 Capturar Foto
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                                        Cargando...
                                                                    </>
                                                                )}
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={stopCamera}
                                                                className="h-14"
                                                                size="lg"
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
                                                            className="w-full h-64 object-contain rounded-lg border bg-muted/10"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            className="absolute top-2 right-2"
                                                            onClick={clearImage}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            La imagen será analizada para detectar el número de placa automáticamente
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Manual Plate Number */}
                            <FormField
                                control={form.control}
                                name="manualPlateNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número de Placa (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="ABC123"
                                                {...field}
                                                className="font-mono uppercase"
                                                maxLength={7}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Si ingresas la placa manualmente, se omitirá la detección OCR
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Dealership Select */}
                            <FormField
                                control={form.control}
                                name="dealershipId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Concesionario *</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={loadingData}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona un concesionario" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {dealerships.map((dealership) => (
                                                    <SelectItem
                                                        key={dealership.idDealership}
                                                        value={String(dealership.idDealership)}
                                                    >
                                                        {dealership.name} - {dealership.zone}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Destino de la entrega
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Messenger Select (Admin only) */}
                            {isAdmin && (
                                <FormField
                                    control={form.control}
                                    name="messengerDocument"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mensajero *</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                disabled={loadingData}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona un mensajero" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {messengers.map((messenger) => (
                                                        <SelectItem
                                                            key={messenger.idEmployee}
                                                            value={String(messenger.document)}
                                                        >
                                                            {messenger.fullName} - {messenger.document}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Empleado asignado a la entrega
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Actions */}
                            <div className="flex gap-4">
                                <Button
                                    type="submit"
                                    disabled={loading || loadingData || cameraActive}
                                    className="flex-1 sm:flex-none"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creando...
                                        </>
                                    ) : (
                                        <>
                                            <Bike className="mr-2 h-4 w-4" />
                                            Crear Servicio
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"

                                    onClick={() => {
                                        stopCamera()
                                        navigate("/admin/servicios")
                                    }}
                                    disabled={loading}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
