import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, X, Upload, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/error-utils'
import { createLogger } from '@/utils/logger'

const logger = createLogger('EvidenceCapture')

interface EvidenceCaptureProps {
    maxPhotos?: number
    photos: File[]
    onPhotosChange: (photos: File[]) => void
}

/**
 * Componente para la captura de fotos de evidencia.
 * Soporta el uso de la cámara del dispositivo o la carga de archivos desde la galería.
 */
export function EvidenceCapture({ maxPhotos = 3, photos, onPhotosChange }: EvidenceCaptureProps) {
    const [cameraActive, setCameraActive] = useState(false)
    const [cameraReady, setCameraReady] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

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

    const startCamera = useCallback(async () => {
        if (photos.length >= maxPhotos) {
            toast.error(`Máximo ${maxPhotos} fotos permitidas`)
            return
        }

        try {
            setCameraActive(true)
            setCameraReady(false)

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
                        .then(() => setCameraReady(true))
                        .catch(err => {
                            logger.error('Error al reproducir video:', err)
                            stopCamera()
                        })
                }
            }
        } catch (error) {
            logger.error('Error de cámara:', error)
            setCameraActive(false)
            toast.error('Error de cámara', {
                description: getErrorMessage(error)
            })
        }
    }, [photos.length, maxPhotos, stopCamera])

    const capturePhoto = () => {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas || !cameraReady) return

        // Relación de aspecto del contenedor (16:9 como se define en la clase aspect-video)
        const targetAspectRatio = 16 / 9

        const videoWidth = video.videoWidth
        const videoHeight = video.videoHeight
        const videoAspectRatio = videoWidth / videoHeight

        let sourceX = 0
        let sourceY = 0
        let sourceWidth = videoWidth
        let sourceHeight = videoHeight

        // Calcular el recorte centrado (equivalente a object-cover)
        if (videoAspectRatio > targetAspectRatio) {
            // El video es más ancho que el objetivo: recortar los lados
            sourceWidth = videoHeight * targetAspectRatio
            sourceX = (videoWidth - sourceWidth) / 2
        } else {
            // El video es más alto que el objetivo: recortar arriba/abajo
            sourceHeight = videoWidth / targetAspectRatio
            sourceY = (videoHeight - sourceHeight) / 2
        }

        // Ajustar el canvas al tamaño del recorte (manteniendo calidad)
        canvas.width = sourceWidth
        canvas.height = sourceHeight

        const ctx = canvas.getContext('2d', { alpha: false })
        if (!ctx) return

        // Dibujar solo la parte recortada
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(
            video,
            sourceX, sourceY, sourceWidth, sourceHeight, // Fuente
            0, 0, sourceWidth, sourceHeight              // Destino
        )

        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `evidencia_${Date.now()}.jpg`, { type: 'image/jpeg' })
                onPhotosChange([...photos, file])
                stopCamera()
            }
        }, 'image/jpeg', 0.9)
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        const remainingSlots = maxPhotos - photos.length
        if (remainingSlots <= 0) {
            toast.error(`Máximo ${maxPhotos} fotos permitidas`)
            return
        }

        const newPhotos: File[] = []
        for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
            const file = files[i]
            if (file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024) {
                newPhotos.push(file)
            }
        }

        if (newPhotos.length > 0) {
            onPhotosChange([...photos, ...newPhotos])
        }

        e.target.value = ''
    }

    const removePhoto = (index: number) => {
        const newPhotos = photos.filter((_, i) => i !== index)
        onPhotosChange(newPhotos)
    }

    if (cameraActive) {
        return (
            <div className="space-y-2">
                <canvas ref={canvasRef} className="hidden" />
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
                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        onClick={capturePhoto}
                        disabled={!cameraReady}
                        className="flex-1 h-11"
                    >
                        <Camera className="h-5 w-5 mr-2" />
                        Capturar
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={stopCamera}
                        className="h-11"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <canvas ref={canvasRef} className="hidden" />


            {photos.length > 0 && (
                <div className="space-y-3">
                    <div className={`grid gap-3 ${photos.length === 1 ? 'grid-cols-1 max-w-sm' : 'grid-cols-2 sm:grid-cols-3'}`}>
                        {photos.map((photo, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border/50 bg-muted/50">
                                <img
                                    src={URL.createObjectURL(photo)}
                                    alt={`Evidencia ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="icon"
                                    className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-md hover:bg-red-500 hover:text-white transition-colors"
                                    onClick={() => removePhoto(index)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                    <p className="text-xs text-white font-medium">Foto {index + 1} de {photos.length}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}


            {photos.length < maxPhotos && (
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={startCamera}
                        className="flex-1 h-11"
                    >
                        <Camera className="h-4 w-4 mr-2" />
                        Cámara
                    </Button>
                    <label className="flex-1">
                        <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-11"
                            asChild
                        >
                            <span>
                                <Upload className="h-4 w-4 mr-2" />
                                Galería
                            </span>
                        </Button>
                    </label>
                </div>
            )}

            <p className="text-xs text-muted-foreground text-center">
                {photos.length} de {maxPhotos} fotos
            </p>
        </div>
    )
}
