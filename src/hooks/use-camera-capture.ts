import { useState, useRef, useCallback } from "react"
import { showToast } from "@/config/toast-config"
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

/**
 * Hook para gestionar la captura de fotos desde la cámara del dispositivo.
 * Proporciona control sobre el stream de video, vista previa y captura de archivos.
 */
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
                                showToast.success("Cámara lista", { duration: 1500 })
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
            showToast.error("Error de cámara", {
                description: getErrorMessage(error)
            })
        }
    }, [])

    const capturePhoto = useCallback((): File | null => {
        const video = videoRef.current
        const canvas = canvasRef.current

        if (!video || !canvas) {
            showToast.error("Error", { description: "Componentes no disponibles" })
            return null
        }

        if (video.videoWidth === 0 || video.videoHeight === 0) {
            showToast.error("Error", { description: "El video aún no está listo" })
            return null
        }

        // Relación de aspecto objetivo (16:9)
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

        canvas.width = sourceWidth
        canvas.height = sourceHeight

        const ctx = canvas.getContext('2d', { alpha: false })
        if (!ctx) {
            showToast.error("Error", { description: "No se pudo crear contexto de canvas" })
            return null
        }

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(
            video,
            sourceX, sourceY, sourceWidth, sourceHeight,
            0, 0, sourceWidth, sourceHeight
        )

        let capturedFile: File | null = null

        canvas.toBlob((blob) => {
            if (blob) {
                capturedFile = new File([blob], `placa_${Date.now()}.jpg`, { type: 'image/jpeg' })

                const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
                setImagePreview(dataUrl)

                stopCamera()
                showToast.success("Foto capturada exitosamente")
            } else {
                showToast.error("Error al capturar foto")
            }
        }, 'image/jpeg', 0.9)

        return capturedFile
    }, [stopCamera])

    const setImageFromFile = useCallback((file: File) => {
        if (!file.type.startsWith('image/')) {
            showToast.error("Archivo inválido", {
                description: "Por favor selecciona una imagen"
            })
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast.error("Archivo muy grande", {
                description: "El tamaño máximo es 5MB"
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
