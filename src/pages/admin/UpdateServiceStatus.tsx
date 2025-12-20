import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Check, X, Home, Loader2, Save, Camera, Upload, Eraser, Maximize2, RotateCw } from "lucide-react"
import { toast } from "sonner"

// Components
import { SignaturePad } from "@/components/SignaturePad"
import { PlacaBadge } from "@/components/PlacaBadge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

// Services & Types
import { serviceDeliveryService } from "@/services/service.service"
import type { ServiceDelivery, ServiceStatus } from "@/types/service.types"

// Available statuses for selection
const AVAILABLE_STATUSES: { value: ServiceStatus; label: string }[] = [
    { value: 'ASSIGNED', label: 'Asignado' },
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'DELIVERED', label: 'Entregado' },
    { value: 'FAILED', label: 'Fallido' },
    { value: 'RETURNED', label: 'Devuelto' },
    { value: 'CANCELED', label: 'Cancelado' },
    { value: 'OBSERVED', label: 'Observado' },
    { value: 'RESOLVED', label: 'Resuelto' },
]

export default function UpdateServiceStatus() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [service, setService] = useState<ServiceDelivery | null>(null)
    const [loading, setLoading] = useState(true)

    // Form states
    const [newStatus, setNewStatus] = useState<ServiceStatus>('PENDING')
    const [observation, setObservation] = useState('')
    const [signatureFile, setSignatureFile] = useState<File | null>(null)
    const [photoFiles, setPhotoFiles] = useState<File[]>([])
    const [photosPreviews, setPhotosPreviews] = useState<string[]>([])
    const [updating, setUpdating] = useState(false)
    const [signatureFullscreen, setSignatureFullscreen] = useState(false)

    // Camera states
    const [cameraActive, setCameraActive] = useState(false)
    const [cameraReady, setCameraReady] = useState(false)
    const [cameraError, setCameraError] = useState<string | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    // Handle fullscreen signature with landscape orientation on mobile
    useEffect(() => {
        const lockOrientation = async () => {
            if (signatureFullscreen && window.innerWidth < 768) {
                // Request landscape orientation on mobile devices
                try {
                    // @ts-ignore - ScreenOrientation.lock exists in browsers but not in TS definitions
                    if (screen.orientation && typeof screen.orientation.lock === 'function') {
                        // @ts-ignore
                        await screen.orientation.lock('landscape')
                    }
                } catch (err) {
                    console.log('Orientation lock not supported or failed')
                }
            } else if (!signatureFullscreen) {
                // Unlock orientation when modal closes
                try {
                    // @ts-ignore - ScreenOrientation.unlock exists in browsers but not in TS definitions
                    if (screen.orientation && typeof screen.orientation.unlock === 'function') {
                        // @ts-ignore
                        screen.orientation.unlock()
                    }
                } catch (err) {
                    // Orientation unlock failed, ignore
                }
            }
        }

        lockOrientation()

        // Cleanup on unmount
        return () => {
            try {
                // @ts-ignore
                if (screen.orientation && typeof screen.orientation.unlock === 'function') {
                    // @ts-ignore
                    screen.orientation.unlock()
                }
            } catch (err) {
                // Ignore cleanup errors
            }
        }
    }, [signatureFullscreen])

    useEffect(() => {
        const fetchService = async () => {
            if (!id) return
            try {
                setLoading(true)
                const data = await serviceDeliveryService.getById(Number(id))
                setService(data)

                // Initialize form with current data
                setNewStatus(data.currentStatus)
                setObservation('')

            } catch (error: any) {
                toast.error("Error al cargar servicio", {
                    description: error.message
                })
                navigate("/admin/servicios")
            } finally {
                setLoading(false)
            }
        }

        fetchService()
    }, [id, navigate])

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

    // Start camera
    const startCamera = useCallback(async () => {
        try {
            setCameraError(null)
            setCameraReady(false)
            setCameraActive(true)

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
                            .then(() => setCameraReady(true))
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
            setCameraError('No se pudo acceder a la cámara')
            toast.error("Error de cámara", {
                description: "No se pudo acceder a la cámara"
            })
        }
    }, [])

    // Clean up camera on unmount
    useEffect(() => {
        return () => stopCamera()
    }, [stopCamera])

    // Capture photo
    const capturePhoto = () => {
        const video = videoRef.current
        const canvas = canvasRef.current

        if (!video || !canvas) return

        if (video.videoWidth === 0 || video.videoHeight === 0) {
            toast.error("El video aún no está listo")
            return
        }

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `foto_${Date.now()}.jpg`, { type: 'image/jpeg' })
                setPhotoFiles(prev => [...prev, file])

                const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
                setPhotosPreviews(prev => [...prev, dataUrl])

                toast.success("Foto capturada")
            }
        }, 'image/jpeg', 0.9)
    }

    // Handle photos change (File Input)
    const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length > 0) {
            const validFiles = files.filter(f => f.type.startsWith('image/'))
            if (validFiles.length !== files.length) {
                toast.error("Algunos archivos no son imágenes")
            }
            setPhotoFiles(prev => [...prev, ...validFiles])

            const newPreviews: string[] = []
            let processed = 0

            validFiles.forEach(file => {
                const reader = new FileReader()
                reader.onloadend = () => {
                    newPreviews.push(reader.result as string)
                    processed++
                    if (processed === validFiles.length) {
                        setPhotosPreviews(prev => [...prev, ...newPreviews])
                    }
                }
                reader.readAsDataURL(file)
            })
        }
    }

    const removePhoto = (index: number) => {
        setPhotoFiles(prev => prev.filter((_, i) => i !== index))
        setPhotosPreviews(prev => prev.filter((_, i) => i !== index))
    }

    // Handle update status submission
    const handleUpdateStatus = async () => {
        if (!service) return

        if (newStatus === 'DELIVERED' && !signatureFile) {
            toast.error("Firma requerida", {
                description: "Para marcar como Entregado, debe incluir la firma.",
                id: "error-firma-requerida"
            })
            return
        }

        try {
            setUpdating(true)
            await serviceDeliveryService.updateStatus(service.idServiceDelivery, {
                status: newStatus,
                observation: observation || undefined,
                signature: signatureFile || undefined,
                photos: photoFiles.length > 0 ? photoFiles : undefined,
            })

            toast.success("Estado actualizado", {
                description: `Servicio ${service.plate.plateNumber} actualizado`
            })

            navigate("/admin/servicios")
        } catch (error: any) {
            toast.error("Error al actualizar estado", {
                description: error.response?.data?.message || error.message,
                id: "error-actualizar-estado"
            })
        } finally {
            setUpdating(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!service) return null

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
                        <BreadcrumbLink asChild>
                            <Link to={`/admin/servicios/${id}`}>
                                {service.plate.plateNumber}
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Actualizar estado</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Actualizar estado</h1>
            </div>

            <Card className="max-w-3xl">
                <CardHeader>
                    <CardTitle className="flex flex-row items-center w-full gap-4">
                        <PlacaBadge
                            plateNumber={service.plate.plateNumber}
                            plateType={service.plate.plateType}
                            size="md"
                        />
                        <div className="flex items-center gap-4">
                            <Separator orientation="vertical" className="h-8" />
                            <div className="w-[180px]">
                                <Select value={newStatus} onValueChange={(value) => setNewStatus(value as ServiceStatus)}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {AVAILABLE_STATUSES.map((status) => (
                                            <SelectItem key={status.value} value={status.value}>
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Observation */}
                    <div className="space-y-2">
                        <Label htmlFor="observation">Observaciones</Label>
                        <Textarea
                            id="observation"
                            placeholder="Agrega observaciones sobre el cambio de estado..."
                            value={observation}
                            onChange={(e) => setObservation(e.target.value)}
                            rows={4}
                            className="resize-none"
                        />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Signature Upload */}
                        <div className="space-y-2">
                            <Label>Firma digital</Label>
                            <div className="border rounded-md p-1 bg-white">
                                <SignaturePad
                                    onChange={setSignatureFile}
                                    showClearButton={false}
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setSignatureFile(null)
                                    }}
                                    disabled={!signatureFile}
                                    className="flex-1"
                                    size="sm"
                                >
                                    <Eraser className="mr-2 h-4 w-4" />
                                    Limpiar
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setSignatureFullscreen(true)}
                                    className="flex-1"
                                    size="sm"
                                >
                                    <Maximize2 className="mr-2 h-4 w-4" />
                                    Pantalla completa
                                </Button>
                            </div>

                            {signatureFile && (
                                <p className="text-sm text-green-600 flex items-center bg-green-50 p-2 rounded border border-green-100">
                                    <Check className="w-4 h-4 mr-1.5" />
                                    Firma capturada
                                </p>
                            )}
                        </div>

                        {/* Photos Upload */}
                        <div className="space-y-2">
                            <Label>Evidencia fotográfica</Label>

                            {!cameraActive ? (
                                <div className="grid gap-3">
                                    {/* Camera Button */}
                                    <Button
                                        type="button"
                                        onClick={startCamera}
                                        className="w-full h-32 flex flex-col items-center justify-center gap-2 bg-primary/5 hover:bg-primary/10 border-2 border-dashed border-primary/30 text-primary"
                                        variant="ghost"
                                    >
                                        <Camera className="w-8 h-8" />
                                        <span className="font-semibold">Tomar foto</span>
                                    </Button>

                                    {/* File Input */}
                                    <label className="flex items-center justify-center w-full h-12 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Upload className="w-4 h-4" />
                                            <span className="text-sm">Subir imágenes de galería</span>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            multiple
                                            onChange={handlePhotosChange}
                                        />
                                    </label>

                                    <p className="text-xs text-muted-foreground text-center">
                                        PNG, JPG (MAX. 10MB)
                                    </p>

                                    {cameraError && (
                                        <p className="text-sm text-red-600 flex items-center bg-red-50 p-2 rounded border border-red-100">
                                            <X className="w-4 h-4 mr-1.5" />
                                            {cameraError}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="w-full h-full object-cover"
                                        />
                                        {!cameraReady && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                                                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                                                Iniciando...
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            onClick={capturePhoto}
                                            disabled={!cameraReady}
                                            className="flex-1"
                                        >
                                            <Camera className="mr-2 h-4 w-4" /> Capturar
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={stopCamera}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Previews */}
                            {photosPreviews.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 mt-4">
                                    {photosPreviews.map((preview, index) => (
                                        <div key={index} className="relative aspect-square group">
                                            <img
                                                src={preview}
                                                alt={`Foto ${index + 1}`}
                                                className="w-full h-full object-cover rounded-md border"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute -top-1 -right-1 h-5 w-5 rounded-full shadow-sm opacity-90 hover:opacity-100"
                                                onClick={() => removePhoto(index)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4 border-t mt-6">
                        <Button
                            variant="outline"
                            onClick={() => navigate("/admin/servicios")}
                            disabled={updating}
                            type="button"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleUpdateStatus}
                            disabled={updating}
                            className="flex-1 sm:flex-none"
                        >
                            {updating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Actualizando...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Actualizar estado
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Fullscreen Signature Dialog */}
            <Dialog open={signatureFullscreen} onOpenChange={setSignatureFullscreen}>
                <DialogContent className="max-w-full md:max-w-4xl w-full h-screen md:h-auto p-4 md:p-6">
                    <DialogHeader className="md:block hidden">
                        <DialogTitle>Firma digital - Pantalla completa</DialogTitle>
                    </DialogHeader>

                    {/* Subtle rotation hint for mobile */}
                    <p className="md:hidden text-xs text-muted-foreground text-center mb-2 flex items-center justify-center gap-1">
                        <RotateCw className="w-3 h-3" />
                        Rota el dispositivo
                    </p>

                    <div className="flex items-center justify-center h-full md:py-4">
                        <SignaturePad
                            onChange={setSignatureFile}
                            width={window.innerWidth < 768 ? Math.min(window.innerHeight * 0.8, 600) : 800}
                            height={window.innerWidth < 768 ? Math.min(window.innerWidth * 0.6, 300) : 400}
                        />
                    </div>
                    <div className="flex justify-end gap-2 md:relative absolute bottom-4 right-4">
                        <Button
                            variant="outline"
                            onClick={() => setSignatureFullscreen(false)}
                        >
                            Cerrar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
