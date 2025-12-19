import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Camera, CameraOff, Loader2, Upload, X } from "lucide-react"
import { toast } from "sonner"

interface CameraCaptureProps {
    onCapture: (file: File, preview: string) => void
    onFileSelect: (file: File, preview: string) => void
    imagePreview: string | null
    onClear: () => void
}

/**
 * Camera capture component for taking photos or selecting from gallery.
 * Shows camera view, capture button, file upload, and image preview.
 */
export function CameraCapture({
    onCapture,
    onFileSelect,
    imagePreview,
    onClear,
}: CameraCaptureProps) {
    // Camera states
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    const [cameraActive, setCameraActive] = useState(false)
    const [cameraReady, setCameraReady] = useState(false)
    const [cameraError, setCameraError] = useState<string | null>(null)

    // Cleanup camera on unmount
    useEffect(() => {
        return () => {
            stopCamera()
        }
    }, [])

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null
        }
        setCameraActive(false)
        setCameraReady(false)
    }

    const startCamera = async () => {
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
                    videoRef.current?.play()
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

    const capturePhoto = () => {
        const video = videoRef.current
        const canvas = canvasRef.current

        if (!video || !canvas || video.videoWidth === 0) {
            toast.error("Error", { description: "El video aún no está listo" })
            return
        }

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `placa_${Date.now()}.jpg`, { type: 'image/jpeg' })
                const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
                stopCamera()
                onCapture(file, dataUrl)
                toast.success("📸 Foto capturada exitosamente")
            }
        }, 'image/jpeg', 0.9)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error("Archivo inválido", { description: "Por favor selecciona una imagen" })
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Archivo muy grande", { description: "El tamaño máximo es 5MB" })
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            onFileSelect(file, reader.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleClear = () => {
        stopCamera()
        onClear()
        const fileInput = document.getElementById('file-upload') as HTMLInputElement
        if (fileInput) fileInput.value = ''
    }

    // Has image preview - show it
    if (imagePreview) {
        return (
            <div className="relative">
                <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-contain rounded-lg border bg-muted/10"
                />
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleClear}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        )
    }

    // Camera active - show live view
    if (cameraActive) {
        return (
            <div className="space-y-3">
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
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
                                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                <p className="text-sm">Cargando cámara...</p>
                            </div>
                        </div>
                    )}
                    {cameraReady && (
                        <div className="absolute inset-4 border-2 border-white/60 rounded-lg pointer-events-none">
                            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white" />
                            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white" />
                            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white" />
                            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white" />
                        </div>
                    )}
                </div>
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
        )
    }

    // Default: show camera button and file upload
    return (
        <div className="w-full space-y-3">
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <Button
                type="button"
                onClick={startCamera}
                className="w-full h-48 flex flex-col items-center justify-center gap-3 text-lg bg-primary/5 hover:bg-primary/10 border-2 border-dashed border-primary/30 text-primary"
                size="lg"
            >
                <Camera className="w-16 h-16" />
                <span className="font-semibold">📷 Abrir Cámara</span>
                <span className="text-xs opacity-80">Tomar foto de la placa</span>
            </Button>

            {cameraError && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-destructive text-sm">
                    <CameraOff className="w-4 h-4 shrink-0" />
                    <span>{cameraError}</span>
                </div>
            )}

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
                    onChange={handleFileChange}
                />
            </label>

            <p className="text-xs text-muted-foreground text-center">
                PNG, JPG, WEBP (MAX. 5MB)
            </p>
        </div>
    )
}
