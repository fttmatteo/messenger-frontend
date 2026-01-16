import { useState, useRef, useCallback } from "react"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/error-utils"

interface UseCameraCaptureReturn {
    cameraActive: boolean
    cameraReady: boolean
    cameraError: string | null
    imagePreview: string | null
    videoRef: React.RefObject<HTMLVideoElement | null>
    canvasRef: React.RefObject<HTMLCanvasElement | null>

    startCamera: () => Promise<void>
    stopCamera: () => void
    capturePhoto: () => File | null
    setImageFromFile: (file: File) => void
    clearImage: () => void
}

export function useCameraCapture(): UseCameraCaptureReturn {
    const [cameraActive, setCameraActive] = useState(false)
    const [cameraReady, setCameraReady] = useState(false)
    const [cameraError, setCameraError] = useState<string | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
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
                            .then(() => {
                                setCameraReady(true)
                                toast.success("Cámara lista", { duration: 1500 })
                            })
                            .catch(() => {
                                setCameraError('Error al reproducir video')
                            })
                    }
                }
            }
        } catch (error) {
            setCameraActive(false)
            setCameraError('No se pudo acceder a la cámara. Verifica los permisos.')
            toast.error("Error de cámara", {
                description: getErrorMessage(error),
                id: "error-camara"
            })
        }
    }, [])

    const capturePhoto = useCallback((): File | null => {
        const video = videoRef.current
        const canvas = canvasRef.current

        if (!video || !canvas) {
            toast.error("Error", { description: "Componentes no disponibles", id: "error-componentes" })
            return null
        }

        if (video.videoWidth === 0 || video.videoHeight === 0) {
            toast.error("Error", { description: "El video aún no está listo", id: "error-video" })
            return null
        }

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        const ctx = canvas.getContext('2d')
        if (!ctx) {
            toast.error("Error", { description: "No se pudo crear contexto de canvas", id: "error-canvas" })
            return null
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        let capturedFile: File | null = null

        canvas.toBlob((blob) => {
            if (blob) {
                capturedFile = new File([blob], `placa_${Date.now()}.jpg`, { type: 'image/jpeg' })

                const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
                setImagePreview(dataUrl)

                stopCamera()
                toast.success("Foto capturada exitosamente")
            } else {
                toast.error("Error al capturar foto", { id: "error-captura" })
            }
        }, 'image/jpeg', 0.9)

        return capturedFile
    }, [stopCamera])

    const setImageFromFile = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error("Archivo inválido", {
                description: "Por favor selecciona una imagen",
                id: "error-archivo-invalido"
            })
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Archivo muy grande", {
                description: "El tamaño máximo es 5MB",
                id: "error-archivo-grande"
            })
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            setImagePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
    }, [])

    const clearImage = useCallback(() => {
        setImagePreview(null)
        stopCamera()
    }, [stopCamera])

    return {
        cameraActive,
        cameraReady,
        cameraError,
        imagePreview,

        videoRef,
        canvasRef,

        startCamera,
        stopCamera,
        capturePhoto,
        setImageFromFile,
        clearImage,
    }
}
