import { useState, useRef, useCallback } from "react"
import { showToast } from "@/config/toast-config"
import { getErrorMessage } from "@/lib/error-utils"
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { isNative } from "@/lib/capacitor"

interface UseCameraCaptureReturn {
    cameraActive: boolean
    cameraReady: boolean
    cameraError: string | null
    imagePreview: string | null
    videoRef: React.RefObject<HTMLVideoElement | null>
    canvasRef: React.RefObject<HTMLCanvasElement | null>

    startCamera: () => Promise<void>
    stopCamera: () => void
    capturePhoto: () => Promise<File | null>
    setImageFromFile: (file: File) => void
    clearImage: () => void
}

/**
 * Hook para gestionar la captura de fotos desde la cámara del dispositivo.
 * Soporta Capacitor (modo nativo) y WebRTC (modo navegador/PWA).
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
        if (!isNative()) {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop())
                streamRef.current = null
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null
            }
        }
        setCameraActive(false)
        setCameraReady(false)
    }, [])

    const startCamera = useCallback(async () => {
        try {
            setCameraError(null)
            setCameraReady(false)
            setCameraActive(true)

            if (isNative()) {
                // En nativo, no iniciamos stream de video en el DOM, 
                // solo marcamos como lista, y el modal mostrará un placeholder 
                // o disparará la captura nativa directamente.
                setCameraReady(true)
                showToast.success("Cámara lista", { duration: 1500 })
            } else {
                // Modo Web PWA
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
            }
        } catch (error) {
            setCameraActive(false)
            setCameraError('No se pudo acceder a la cámara. Verifica los permisos.')
            showToast.error("Error de cámara", {
                description: getErrorMessage(error)
            })
        }
    }, [])

    const capturePhoto = useCallback(async (): Promise<File | null> => {
        if (isNative()) {
            try {
                // Captura Nativa Capacitor
                const photo = await Camera.getPhoto({
                    resultType: CameraResultType.Uri,
                    source: CameraSource.Camera,
                    quality: 90
                });

                if (photo.webPath) {
                    setImagePreview(photo.webPath)

                    // Convertir la URI del WebPath a un objeto File para subirlo
                    const response = await fetch(photo.webPath);
                    const blob = await response.blob();
                    const file = new File([blob], `placa_${Date.now()}.${photo.format}`, {
                        type: `image/${photo.format}`
                    });

                    stopCamera()
                    showToast.success("Foto capturada exitosamente")
                    return file
                }
                return null
            } catch (error) {
                const err = error as { message?: string };
                // El usuario puede cancelar la cámara
                if (err?.message === 'User cancelled photos app') {
                    stopCamera()
                    return null
                }
                showToast.error("Error al capturar foto nativa", { description: getErrorMessage(error) })
                return null
            }
        } else {
            // Captura WebRTC (Navegador)
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

            return new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    if (blob) {
                        capturedFile = new File([blob], `placa_${Date.now()}.jpg`, { type: 'image/jpeg' })

                        const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
                        setImagePreview(dataUrl)

                        stopCamera()
                        showToast.success("Foto capturada exitosamente")
                        resolve(capturedFile)
                    } else {
                        showToast.error("Error al capturar foto")
                        resolve(null)
                    }
                }, 'image/jpeg', 0.9)
            })
        }
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
