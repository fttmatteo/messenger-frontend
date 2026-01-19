import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react'
import { createLogger } from '@/utils/logger'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { RefreshCw, Check, Camera } from 'lucide-react'

const logger = createLogger('SignatureCapture')

// GIF configuration
const GIF_WIDTH = 640
const GIF_HEIGHT = 480
const CAPTURE_INTERVAL_MS = 500
const FRAME_COUNT = 3
const GIF_GENERATION_TIMEOUT_MS = 5000

export interface SignatureCameraCaptureRef {
    getGif: () => Promise<Blob | null>
    isReady: () => boolean
}

interface SignatureCameraCaptureProps {
    onGifGenerated?: (gif: Blob | null) => void
    className?: string
}

const SignatureCameraCapture = forwardRef<
    SignatureCameraCaptureRef,
    SignatureCameraCaptureProps
>(({ onGifGenerated, className }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    const [isCapturing, setIsCapturing] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [gifBlob, setGifBlob] = useState<Blob | null>(null)
    const [gifUrl, setGifUrl] = useState<string | null>(null)
    const [cameraError, setCameraError] = useState<string | null>(null)

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        getGif: async () => gifBlob,
        isReady: () => gifBlob !== null,
    }))

    // Initialize camera on mount
    useEffect(() => {
        initCamera()

        // Cleanup on unmount
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
            }

            logger.info('Camera initialized successfully')

            // Show consent toast
            toast.info('Se capturarán fotos para verificación', {
                description: 'La cámara se activará mientras firma',
                duration: 3000,
            })

            // Auto-start capture after camera initializes
            setTimeout(() => startCapture(), 1500)

        } catch (error) {
            logger.error('Camera initialization failed', error)
            setCameraError('No se pudo acceder a la cámara')
            toast.error('Error de cámara', {
                description: 'No se pudo acceder a la cámara. Verifica los permisos.',
            })
        }
    }

    async function startCapture() {
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

        canvas.width = GIF_WIDTH
        canvas.height = GIF_HEIGHT

        const capturedFrames: ImageData[] = []

        logger.info('gif_capture_started', { frameCount: FRAME_COUNT })

        // Capture frames at intervals
        for (let i = 0; i < FRAME_COUNT; i++) {
            await new Promise(resolve => setTimeout(resolve, i === 0 ? 0 : CAPTURE_INTERVAL_MS))

            ctx.drawImage(video, 0, 0, GIF_WIDTH, GIF_HEIGHT)
            const imageData = ctx.getImageData(0, 0, GIF_WIDTH, GIF_HEIGHT)
            capturedFrames.push(imageData)
        }

        setIsCapturing(false)

        // Generate GIF
        await generateGif(capturedFrames)
    }

    async function generateGif(capturedFrames: ImageData[]) {
        setIsGenerating(true)
        const startTime = performance.now()

        try {
            // Lazy load gif.js
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
                    gif.addFrame(frame, { delay: CAPTURE_INTERVAL_MS })
                })

                gif.on('finished', (blob: Blob) => {
                    resolve(blob)
                })

                gif.on('error', (error: Error) => {
                    reject(error)
                })

                gif.render()
            })

            // Race against timeout
            const blob = await Promise.race([
                gifPromise,
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout')), GIF_GENERATION_TIMEOUT_MS)
                ),
            ])

            const generationTime = performance.now() - startTime
            const gifSizeKb = Math.round(blob.size / 1024)

            logger.info('gif_capture_success', {
                generationTimeMs: Math.round(generationTime),
                gifSizeKb,
            })

            // Create URL for preview
            const url = URL.createObjectURL(blob)
            setGifUrl(url)
            setGifBlob(blob)
            onGifGenerated?.(blob)

        } catch (error) {
            logger.error('gif_capture_failed', { error })
            toast.error('Error generando captura', {
                description: 'Intenta de nuevo',
            })
            onGifGenerated?.(null)
        } finally {
            setIsGenerating(false)
        }
    }

    function handleRetry() {
        if (gifUrl) {
            URL.revokeObjectURL(gifUrl)
        }
        setGifBlob(null)
        setGifUrl(null)
        startCapture()
    }

    function handleAccept() {
        // GIF is already set, just confirm
        toast.success('Captura confirmada')
    }

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
            {/* Camera preview / GIF preview */}
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
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />
                )}

                {/* Capturing indicator */}
                {isCapturing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="bg-white/90 rounded-full px-3 py-1 text-sm font-medium">
                            Capturando...
                        </div>
                    </div>
                )}

                {/* Generating indicator */}
                {isGenerating && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="bg-white/90 rounded-full px-3 py-1 text-sm font-medium flex items-center gap-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Generando GIF...
                        </div>
                    </div>
                )}

                {/* GIF badge */}
                {gifUrl && (
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                        GIF
                    </div>
                )}
            </div>

            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Action buttons (only show after GIF is generated) */}
            {gifUrl && (
                <div className="flex gap-2 justify-center">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRetry}
                        disabled={isCapturing || isGenerating}
                    >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Repetir
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleAccept}
                        disabled={isCapturing || isGenerating}
                    >
                        <Check className="h-4 w-4 mr-1" />
                        Aceptar
                    </Button>
                </div>
            )}
        </div>
    )
})

SignatureCameraCapture.displayName = 'SignatureCameraCapture'

export default SignatureCameraCapture
