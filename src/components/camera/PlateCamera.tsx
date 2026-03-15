import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Camera, CameraOff, Loader2, X, Upload } from "lucide-react"
import { showToast } from "@/config/toast-config"
import { createLogger } from "@/utils/logger"

const logger = createLogger('PlateCamera')

export interface PlateCameraProps {
    onCapture: (file: File, previewUrl: string) => void
    onCancel?: () => void
    autoStart?: boolean
}

/**
 * Componente especializado para la captura de fotos de placas.
 * Proporciona un visor de cámara directo con guías visuales y captura optimizada.
 */
export function PlateCamera({ onCapture, onCancel, autoStart = true }: PlateCameraProps) {
    const [cameraActive, setCameraActive] = useState(false)
    const [cameraReady, setCameraReady] = useState(false)
    const [cameraError, setCameraError] = useState<string | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const initialStartRef = useRef(false)

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
        if (streamRef.current) {
            logger.info('Cámara ya activa, omitiendo inicio')
            return
        }

        try {
            setCameraError(null)
            setCameraReady(false)
            setCameraActive(true)

            const timeoutId = setTimeout(() => {
                if (videoRef.current?.paused !== false) {
                    logger.warn('Tiempo de espera agotado al iniciar cámara')
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

            let attempts = 0
            while (!videoRef.current && attempts < 20) {
                await new Promise(resolve => setTimeout(resolve, 100))
                attempts++
            }

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
                                logger.error('Error al reproducir video:', err)
                                setCameraError('Error al reproducir video. Intenta de nuevo.')
                                stopCamera()
                            })
                    }
                }

                videoRef.current.onerror = () => {
                    clearTimeout(timeoutId)
                    setCameraError('Error en el elemento de video.')
                    stopCamera()
                }
            } else {
                clearTimeout(timeoutId)
                setCameraError('Componente de video no disponible')
                setCameraActive(false)
                stream.getTracks().forEach(track => track.stop())
                streamRef.current = null
            }
        } catch (error) {
            logger.error('Error de cámara:', error)
            setCameraActive(false)

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
            showToast.error("Error de cámara", {
                description: errorMessage,
                id: "error-camara"
            })
        }
    }, [stopCamera])

    const capturePhoto = useCallback(() => {
        const video = videoRef.current
        const canvas = canvasRef.current

        if (!video || !canvas) {
            showToast.error("Error", { description: "Componentes no disponibles", id: "error-componentes" })
            return
        }

        if (video.videoWidth === 0 || video.videoHeight === 0) {
            showToast.error("Error", { description: "El video aún no está listo", id: "error-video" })
            return
        }

        const targetAspectRatio = 4 / 3

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

        canvas.width = sourceWidth
        canvas.height = sourceHeight

        const ctx = canvas.getContext('2d', { alpha: false })
        if (!ctx) {
            showToast.error("Error", { description: "No se pudo crear contexto de canvas", id: "error-canvas" })
            return
        }

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(
            video,
            sourceX, sourceY, sourceWidth, sourceHeight,
            0, 0, sourceWidth, sourceHeight
        )

        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `placa_${Date.now()}.jpg`, { type: 'image/jpeg' })
                const dataUrl = canvas.toDataURL('image/jpeg', 0.9)

                stopCamera()
                onCapture(file, dataUrl)
            } else {
                showToast.error("Error al capturar foto", { id: "error-captura" })
            }
        }, 'image/jpeg', 0.9)
    }, [stopCamera, onCapture])

    const handleCancel = useCallback(() => {
        stopCamera()
        onCancel?.()
    }, [stopCamera, onCancel])

    useEffect(() => {
        if (autoStart && !initialStartRef.current) {
            const timer = setTimeout(() => {
                startCamera()
                initialStartRef.current = true
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [autoStart, startCamera])

    useEffect(() => {
        return () => {
            stopCamera()
        }
    }, [stopCamera])

    if (!cameraActive) {
        return (
            <div className="space-y-2">
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
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <canvas ref={canvasRef} style={{ display: 'none' }} />


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
                    onClick={handleCancel}
                    className="h-12 px-4 touch-manipulation"
                >
                    <X className="h-5 w-5" />
                </Button>
            </div>
        </div>
    )
}

export interface ImageUploadFallbackProps {
    onSelect: (file: File, previewUrl: string) => void
}

/**
 * Componente de respaldo para la carga de imágenes desde la galería cuando la cámara no está disponible o no se desea usar.
 */
export function ImageUploadFallback({ onSelect }: ImageUploadFallbackProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            showToast.error("Archivo inválido", {
                description: "Por favor selecciona una imagen",
                id: "error-archivo-invalido"
            })
            return
        }

        if (file.size > 10 * 1024 * 1024) {
            showToast.error("Archivo muy grande", {
                description: "El tamaño máximo es 10MB",
                id: "error-archivo-grande"
            })
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            onSelect(file, reader.result as string)
        }
        reader.readAsDataURL(file)
    }

    return (
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
                onChange={handleChange}
            />
        </label>
    )
}
