import { useState, useRef, useCallback } from 'react'
import { createLogger } from '@/utils/logger'

const logger = createLogger('AudioRecorder')


interface UseAudioRecorderReturn {
    isRecording: boolean
    isSupported: boolean
    audioBlob: Blob | null
    startRecording: () => Promise<void>
    stopRecording: () => Promise<Blob | null>
    error: string | null
}

/**
 * Hook para grabar audio del micrófono usando MediaRecorder API.
 * Funciona en todos los dispositivos incluyendo iOS PWA.
 */
export function useAudioRecorder(): UseAudioRecorderReturn {
    const [isRecording, setIsRecording] = useState(false)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const [error, setError] = useState<string | null>(null)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])

    // Verificar soporte
    const isSupported = typeof navigator !== 'undefined' &&
        !!navigator.mediaDevices?.getUserMedia &&
        typeof MediaRecorder !== 'undefined'

    const startRecording = useCallback(async () => {
        if (!isSupported) {
            setError('Tu navegador no soporta grabación de audio')
            return
        }

        try {
            setError(null)
            chunksRef.current = []

            // Solicitar acceso al micrófono
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            })

            // Determinar el mejor formato soportado
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : MediaRecorder.isTypeSupported('audio/webm')
                    ? 'audio/webm'
                    : 'audio/mp4'

            const mediaRecorder = new MediaRecorder(stream, { mimeType })
            mediaRecorderRef.current = mediaRecorder

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data)
                }
            }

            mediaRecorder.onerror = () => {
                setError('Error durante la grabación')
                setIsRecording(false)
            }

            mediaRecorder.start(100) // Capturar cada 100ms
            setIsRecording(true)

            // Vibración de feedback
            if (navigator.vibrate) {
                navigator.vibrate(15)
            }

        } catch (err) {
            let message = 'Error al acceder al micrófono'

            if (err instanceof Error) {
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    message = 'Permiso de micrófono denegado. Actívalo en la configuración de tu navegador.'
                } else if (err.name === 'NotFoundError') {
                    message = 'No se encontró un micrófono. Conecta un micrófono e intenta de nuevo.'
                } else if (err.name === 'NotReadableError') {
                    message = 'El micrófono está siendo usado por otra aplicación.'
                } else {
                    message = err.message
                }
            }

            setError(message)
            logger.error('Error starting recording', err)
        }
    }, [isSupported])

    const stopRecording = useCallback(async (): Promise<Blob | null> => {
        return new Promise((resolve) => {
            const mediaRecorder = mediaRecorderRef.current

            if (!mediaRecorder || mediaRecorder.state === 'inactive') {
                setIsRecording(false)
                resolve(null)
                return
            }

            mediaRecorder.onstop = () => {
                // Detener todos los tracks del stream
                mediaRecorder.stream.getTracks().forEach(track => track.stop())

                // Crear blob con todos los chunks
                const blob = new Blob(chunksRef.current, {
                    type: mediaRecorder.mimeType
                })

                setAudioBlob(blob)
                setIsRecording(false)

                // Vibración de feedback
                if (navigator.vibrate) {
                    navigator.vibrate(10)
                }

                resolve(blob)
            }

            mediaRecorder.stop()
        })
    }, [])

    return {
        isRecording,
        isSupported,
        audioBlob,
        startRecording,
        stopRecording,
        error
    }
}
