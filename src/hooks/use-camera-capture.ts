import { useState, useRef, useCallback } from "react"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/error-utils"

interface UseCameraCaptureReturn {
    // State
    cameraActive: boolean
    cameraReady: boolean
    cameraError: string | null
    imagePreview: string | null

    // Refs
    videoRef: React.RefObject<HTMLVideoElement | null>
    canvasRef: React.RefObject<HTMLCanvasElement | null>

    // Actions
    startCamera: () => Promise<void>
    stopCamera: () => void
    capturePhoto: () => File | null
    setImageFromFile: (file: File) => void
    clearImage: () => void
}

/**
 * Custom hook for camera capture functionality.
 * Handles camera stream, photo capture, and image preview.
 */
export function useCameraCapture(): UseCameraCaptureReturn {
    // Camera states
    const [cameraActive, setCameraActive] = useState(false)
    const [cameraReady, setCameraReady] = useState(false)
    const [cameraError, setCameraError] = useState<string | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    // Refs
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    // Stop camera
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
        } catch (error) {
            console.error('Camera error:', error)
            setCameraActive(false)
            setCameraError('No se pudo acceder a la cámara. Verifica los permisos.')
            toast.error("Error de cámara", {
                description: getErrorMessage(error),
                id: "error-camara"
            })
        }
    }, [])

    // Capture photo from camera
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

        // Set canvas size to video size
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        const ctx = canvas.getContext('2d')
        if (!ctx) {
            toast.error("Error", { description: "No se pudo crear contexto de canvas", id: "error-canvas" })
            return null
        }

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Create file from blob synchronously isn't possible, but we can convert
        let capturedFile: File | null = null

        canvas.toBlob((blob) => {
            if (blob) {
                capturedFile = new File([blob], `placa_${Date.now()}.jpg`, { type: 'image/jpeg' })

                // Create preview from canvas
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

    // Set image from file input
    const setImageFromFile = useCallback((file: File) => {
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

        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setImagePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
    }, [])

    // Clear image
    const clearImage = useCallback(() => {
        setImagePreview(null)
        stopCamera()
    }, [stopCamera])

    return {
        // State
        cameraActive,
        cameraReady,
        cameraError,
        imagePreview,

        // Refs
        videoRef,
        canvasRef,

        // Actions
        startCamera,
        stopCamera,
        capturePhoto,
        setImageFromFile,
        clearImage,
    }
}
