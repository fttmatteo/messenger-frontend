import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, X, Upload, Loader2 } from 'lucide-react'
import { showToast } from '@/config/toast-config'
import { getErrorMessage } from '@/lib/error-utils'
import { createLogger } from '@/utils/logger'
import { compressImage, IMAGE_CONFIG } from '@/lib/image-utils'

const logger = createLogger('EvidenceCapture')

interface EvidenceCaptureProps {
    maxPhotos?: number
    photos: File[]
    onPhotosChange: (photos: File[]) => void
}

interface PhotoPreviewProps {
    photo: File;
    index: number;
    photos: File[];
    onRemove: (index: number) => void;
}

function PhotoPreview({ photo, index, photos, onRemove }: PhotoPreviewProps) {
    // Generamos la URL síncronamente para evitar el renderizado en cascada (cascading renders)
    const url = useMemo(() => URL.createObjectURL(photo), [photo]);

    // Nos encargamos EXCLUSIVAMENTE de la limpieza cuando el componente se desmonta o la foto cambia
    useEffect(() => {
        return () => URL.revokeObjectURL(url);
    }, [url]);

    if (!url) return <div className="w-full h-full bg-muted animate-pulse" />;

    return (
        <div className="relative aspect-square rounded-lg overflow-hidden border border-border/50 bg-muted/50">
            <img
                src={url}
                alt={`Evidencia ${index + 1}`}
                className="w-full h-full object-cover"
            />
            <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-md hover:bg-red-500 hover:text-white transition-colors"
                onClick={() => onRemove(index)}
            >
                <X className="h-4 w-4" />
            </Button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-xs text-white font-medium">Foto {index + 1} de {photos.length}</p>
            </div>
        </div>
    );
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
            showToast.error(`Máximo ${maxPhotos} fotos permitidas`)
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
            showToast.error('Error de cámara', {
                description: getErrorMessage(error)
            })
        }
    }, [photos.length, maxPhotos, stopCamera])

    const capturePhoto = () => {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas || !cameraReady) return

        const targetAspectRatio = 16 / 9

        const videoWidth = video.videoWidth
        const videoHeight = video.videoHeight
        const videoAspectRatio = videoWidth / videoHeight

        let sourceX = 0
        let sourceY = 0
        let sourceWidth = videoWidth
        let sourceHeight = videoHeight

        if (videoAspectRatio > targetAspectRatio) {
            sourceWidth = videoHeight * targetAspectRatio
            sourceX = (videoWidth - sourceWidth) / 2
        } else {
            sourceHeight = videoWidth / targetAspectRatio
            sourceY = (videoHeight - sourceHeight) / 2
        }

        let finalWidth = sourceWidth
        let finalHeight = sourceHeight

        if (finalWidth > IMAGE_CONFIG.MAX_WIDTH || finalHeight > IMAGE_CONFIG.MAX_HEIGHT) {
            const ratio = Math.min(IMAGE_CONFIG.MAX_WIDTH / finalWidth, IMAGE_CONFIG.MAX_HEIGHT / finalHeight)
            finalWidth = finalWidth * ratio
            finalHeight = finalHeight * ratio
        }

        canvas.width = finalWidth
        canvas.height = finalHeight

        const ctx = canvas.getContext('2d', { alpha: false })
        if (!ctx) return

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(
            video,
            sourceX, sourceY, sourceWidth, sourceHeight,
            0, 0, finalWidth, finalHeight
        )

        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `evidencia_${Date.now()}.webp`, { type: 'image/webp' })
                onPhotosChange([...photos, file])
                stopCamera()
            }
        }, 'image/webp', IMAGE_CONFIG.PHOTO_QUALITY)
    }

    const [isProcessing, setIsProcessing] = useState(false)

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        const remainingSlots = maxPhotos - photos.length
        if (remainingSlots <= 0) {
            showToast.error(`Máximo ${maxPhotos} fotos permitidas`)
            return
        }

        try {
            setIsProcessing(true)
            const newPhotos: File[] = []
            const processCount = Math.min(files.length, remainingSlots)

            for (let i = 0; i < processCount; i++) {
                const file = files[i]
                if (file.type.startsWith('image/')) {
                    if (file.size > 10 * 1024 * 1024) {
                        logger.info(`Imagen ${file.name} grande detectada, optimizando...`)
                    }
                    try {
                        const optimized = await compressImage(file, IMAGE_CONFIG.PHOTO_QUALITY, IMAGE_CONFIG.MAX_WIDTH)
                        newPhotos.push(optimized)
                    } catch (err) {
                        logger.error(`Error optimizando ${file.name}:`, err)
                        if (file.size <= 10 * 1024 * 1024) {
                            newPhotos.push(file)
                        }
                    }
                }
            }

            if (newPhotos.length > 0) {
                onPhotosChange([...photos, ...newPhotos])
            }
        } catch (error) {
            logger.error('Error procesando archivos:', error)
        } finally {
            setIsProcessing(false)
            e.target.value = ''
        }
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
                            <PhotoPreview 
                                key={`${photo.name}-${index}`} 
                                photo={photo} 
                                index={index} 
                                photos={photos}
                                onRemove={removePhoto} 
                            />
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
                            disabled={isProcessing}
                            asChild
                        >
                            <span>
                                {isProcessing ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Upload className="h-4 w-4 mr-2" />
                                )}
                                {isProcessing ? 'Procesando...' : 'Galería'}
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
