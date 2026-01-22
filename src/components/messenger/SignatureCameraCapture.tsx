import { forwardRef, useEffect, useImperativeHandle, useRef, useState, useCallback } from 'react'
import { createLogger } from '@/utils/logger'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { RefreshCw, Camera, Loader2 } from 'lucide-react'

const logger = createLogger('SignatureCapture')

/**
 * Configuración para la generación de GIF de verificación.
 */
const GIF_WIDTH = 640
const GIF_HEIGHT = 480
const CAPTURE_INTERVAL_MS = 500
const FRAME_COUNT = 3
const GIF_GENERATION_TIMEOUT_MS = 5000

export interface SignatureCameraCaptureRef {
    getGif: () => Promise<Blob | null>
    isReady: () => boolean
    startCapture: () => void
}

interface SignatureCameraCaptureProps {
    onGifGenerated?: (gif: Blob | null) => void
    onRetry?: () => void
    className?: string
}

/**
 * Componente que captura una ráfaga de imágenes de la cámara frontal mientras el usuario firma.
 * Genera un GIF animado para propósitos de verificación de identidad (anti-fraude).
 */
const SignatureCameraCapture = forwardRef<
    SignatureCameraCaptureRef,
    SignatureCameraCaptureProps
>(({ onGifGenerated, onRetry, className }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    const [isCapturing, setIsCapturing] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [isCameraLoading, setIsCameraLoading] = useState(true)
    const [gifBlob, setGifBlob] = useState<Blob | null>(null)
    const [gifUrl, setGifUrl] = useState<string | null>(null)
    const [cameraError, setCameraError] = useState<string | null>(null)


    useImperativeHandle(ref, () => ({
        getGif: async () => gifBlob,
        isReady: () => gifBlob !== null,
        startCapture: () => {
            if (!isCapturing && !gifUrl) {
                startCapture()
            }
        }
    }))


    useEffect(() => {
        initCamera()


        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
            }
            if (gifUrl) {
                URL.revokeObjectURL(gifUrl)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function initCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: GIF_WIDTH },
                    height: { ideal: GIF_HEIGHT },
                },
                audio: false,
            })

            streamRef.current = stream

            if (videoRef.current) {
                videoRef.current.srcObject = stream
                // Esperar a que el video esté listo para reproducir antes de quitar el loading
                videoRef.current.onloadeddata = () => {
                    setIsCameraLoading(false)
                }
            }

            logger.info('Cámara inicializada correctamente')


            toast.info('Se capturarán fotos para verificación', {
                description: 'La cámara se activará mientras firma',
                duration: 3000,
            })

        } catch (error) {
            logger.error('Error al inicializar cámara', error)
            setIsCameraLoading(false)
            setCameraError('No se pudo acceder a la cámara')
            toast.error('Error de cámara', {
                description: 'No se pudo acceder a la cámara. Verifica los permisos.',
            })
        }
    }

    const generateGif = useCallback(async (capturedFrames: ImageData[]) => {
        setIsGenerating(true)
        const startTime = performance.now()

        try {
            const GIF = (await import('gif.js')).default

            const gifPromise = new Promise<Blob>((resolve, reject) => {
                const gif = new GIF({
                    workers: 2,
                    quality: 10,
                    width: GIF_WIDTH,
                    height: GIF_HEIGHT,
                    workerScript: '/gif.worker.js',
                })

                capturedFrames.forEach(frame => {
                    gif.addFrame(frame, { delay: CAPTURE_INTERVAL_MS * 4 }) // Ajuste de velocidad 4x
                })

                gif.on('finished', (blob: Blob) => {
                    resolve(blob)
                })

                gif.on('error', (error: Error) => {
                    reject(error)
                })

                gif.render()
            })


            const blob = await Promise.race([
                gifPromise,
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout')), GIF_GENERATION_TIMEOUT_MS)
                ),
            ])

            const generationTime = performance.now() - startTime
            const gifSizeKb = Math.round(blob.size / 1024)

            logger.info('GIF capturado correctamente', {
                tiempoMs: Math.round(generationTime),
                tamañoKb: gifSizeKb,
            })


            const url = URL.createObjectURL(blob)
            setGifUrl(url)
            setGifBlob(blob)
            onGifGenerated?.(blob)

        } catch (error) {
            logger.error('Error al capturar GIF', { error })
            toast.error('Error generando captura', {
                description: 'Intenta de nuevo',
            })
            onGifGenerated?.(null)
        } finally {
            setIsGenerating(false)
        }
    }, [onGifGenerated])

    const startCapture = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current || isCapturing) return

        setIsCapturing(true)
        setGifBlob(null)
        setGifUrl(null)
        setCameraError(null)

        const video = videoRef.current
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')

        if (!ctx) {
            setCameraError('Error al inicializar canvas')
            setIsCapturing(false)
            return
        }


        let streamWaitdAttempts = 0
        while (!video.srcObject && streamWaitdAttempts < 30) { // Máximo 3 segundos para permiso/inicialización
            await new Promise(r => setTimeout(r, 100))
            streamWaitdAttempts++
        }

        if (!video.srcObject) {
            logger.warn('Sin stream de video después de esperar')
        }


        let attempts = 0
        const maxAttempts = 30 // Máximo 3 segundos de espera


        while ((video.readyState < 2 || video.currentTime === 0) && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100))
            attempts++
        }

        if (video.readyState < 2) {
            logger.warn('Video no listo después de espera', { readyState: video.readyState, currentTime: video.currentTime })
        }

        canvas.width = GIF_WIDTH
        canvas.height = GIF_HEIGHT

        const capturedFrames: ImageData[] = []


        if (video.videoWidth === 0) {
            logger.warn('Ancho de video 0, esperando')
            await new Promise(r => setTimeout(r, 200)) // Último intento de espera
        }

        logger.info('Iniciando captura de GIF', {
            frames: FRAME_COUNT,
            dimensiones: `${video.videoWidth}x${video.videoHeight}`
        })


        // Todos los frames usan el mismo delay para evitar capturar una imagen negra
        // El primer frame necesita esperar para que el video renderice un frame válido
        for (let i = 0; i < FRAME_COUNT; i++) {
            await new Promise(resolve => setTimeout(resolve, CAPTURE_INTERVAL_MS))

            ctx.drawImage(video, 0, 0, GIF_WIDTH, GIF_HEIGHT)
            const imageData = ctx.getImageData(0, 0, GIF_WIDTH, GIF_HEIGHT)
            capturedFrames.push(imageData)
        }

        setIsCapturing(false)


        await generateGif(capturedFrames)
    }, [isCapturing, generateGif])

    function handleRetry() {
        if (gifUrl) {
            URL.revokeObjectURL(gifUrl)
        }
        setGifBlob(null)
        setGifUrl(null)
        onRetry?.()
    }


    useEffect(() => {
        if (!gifUrl && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current
            setTimeout(() => startCapture(), 500)
        }
    }, [gifUrl, startCapture])

    if (cameraError) {
        return (
            <div className={`flex flex-col items-center justify-center bg-muted/30 rounded-lg p-4 ${className}`}>
                <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center">{cameraError}</p>
            </div>
        )
    }

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            <div
                className={`relative overflow-hidden rounded-lg ${isCapturing ? 'animate-pulse ring-2 ring-red-500' : ''
                    }`}
                style={{ aspectRatio: `${GIF_WIDTH}/${GIF_HEIGHT}` }}
            >
                {gifUrl ? (
                    <img
                        src={gifUrl}
                        alt="Captura"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                        {isCameraLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80 backdrop-blur-sm gap-2">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <span className="text-sm text-muted-foreground">Iniciando cámara...</span>
                            </div>
                        )}
                    </>
                )}


                {isCapturing && (
                    <div className="absolute top-4 right-4 bg-red-500/90 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1.5 animate-pulse shadow-sm backdrop-blur-sm z-10">
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        REC
                    </div>
                )}


                {isGenerating && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-20">
                        <div className="bg-background/95 dark:bg-zinc-900/95 text-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-3 border border-border/50">
                            <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                            <span className="text-sm font-medium">Procesando GIF...</span>
                        </div>
                    </div>
                )}


                {gifUrl && (
                    <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded border border-white/10 shadow-sm">
                        GIF
                    </div>
                )}

                {gifUrl && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation()
                            handleRetry()
                        }}
                        disabled={isCapturing || isGenerating}
                        className="absolute top-2 left-2 h-8 w-8 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm rounded-full z-10"
                        title="Repetir captura"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                )}
            </div>


            <canvas ref={canvasRef} className="hidden" />
        </div>
    )
})

SignatureCameraCapture.displayName = 'SignatureCameraCapture'

export default SignatureCameraCapture
