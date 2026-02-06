import { useState, useRef, useCallback, useEffect } from 'react'
import type { SpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from '@/types/speech.types'

export interface UseSpeechToTextOptions {
    /** Idioma para el reconocimiento (default: 'es-CO' para español Colombia) */
    lang?: string
    /** Si debe continuar escuchando después de pausas (default: false) */
    continuous?: boolean
    /** Si debe devolver resultados intermedios mientras habla (default: true) */
    interimResults?: boolean
    /** Callback cuando se obtiene una transcripción final */
    onTranscript?: (text: string) => void
    /** Callback cuando hay un error */
    onError?: (error: string) => void
}

export interface UseSpeechToTextReturn {
    /** Indica si está escuchando activamente */
    isListening: boolean
    /** Indica si el navegador soporta Speech Recognition */
    isSupported: boolean
    /** Indica si se han denegado los permisos */
    isPermissionDenied: boolean
    /** Transcripción actual (puede incluir resultados intermedios) */
    transcript: string
    /** Transcripción final confirmada */
    finalTranscript: string
    /** Mensaje de error si ocurre alguno */
    error: string | null
    /** Inicia el reconocimiento de voz */
    startListening: () => void
    /** Detiene el reconocimiento de voz */
    stopListening: () => void
    /** Alterna entre escuchar y no escuchar */
    toggleListening: () => void
    /** Limpia la transcripción actual */
    clearTranscript: () => void
}

/**
 * Hook para reconocimiento de voz usando la Web Speech API.
 * Permite a los usuarios dictar texto en lugar de escribir.
 * 
 * @example
 * ```tsx
 * const { isListening, transcript, startListening, stopListening } = useSpeechToText({
 *     lang: 'es-CO',
 *     onTranscript: (text) => setObservation(prev => prev + ' ' + text)
 * })
 * ```
 */
export function useSpeechToText(options: UseSpeechToTextOptions = {}): UseSpeechToTextReturn {
    const {
        lang = 'es-CO',
        continuous = false,
        interimResults = true,
        onTranscript,
        onError,
    } = options

    const [isListening, setIsListening] = useState(false)
    const [isPermissionDenied, setIsPermissionDenied] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [finalTranscript, setFinalTranscript] = useState('')
    const [error, setError] = useState<string | null>(null)

    const recognitionRef = useRef<SpeechRecognition | null>(null)
    const isStoppingRef = useRef(false)
    const retryCountRef = useRef(0)
    const silenceTimerRef = useRef<any>(null)
    const MAX_RETRIES = 3

    // Verificar soporte del navegador
    const isSupported = typeof window !== 'undefined' &&
        !!(window.SpeechRecognition || window.webkitSpeechRecognition)

    // Limpiar al desmontar
    useEffect(() => {
        return () => {
            if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current)
            }
            if (recognitionRef.current) {
                recognitionRef.current.abort()
                recognitionRef.current = null
            }
        }
    }, [])

    const getErrorMessage = useCallback((errorCode: string): string => {
        const errorMessages: Record<string, string> = {
            'no-speech': 'No se detectó voz. Asegúrate de estar en un lugar con poco ruido y hablar claro.',
            'audio-capture': 'No se pudo acceder al micrófono. Verifica que no esté siendo usado por otra app.',
            'not-allowed': 'Permiso denegado. Pulsa el ícono del candado en la barra de direcciones y habilita el micrófono.',
            'network': 'Error de conexión. El dictado por voz requiere internet para funcionar.',
            'aborted': 'Reconocimiento detenido.',
            'service-not-allowed': 'El servicio de voz no está disponible en este momento.',
            'language-not-supported': 'El idioma seleccionado no es compatible.',
            'bad-grammar': 'Error de procesamiento. Intenta frases más cortas.',
        }
        return errorMessages[errorCode] || `Error (${errorCode}). Intenta reiniciar el dictado.`
    }, [])

    const vibrate = useCallback((pattern: number | number[]) => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try {
                navigator.vibrate(pattern)
            } catch {
                // Ignore vibration errors
            }
        }
    }, [])

    const startListening = useCallback(() => {
        if (!isSupported) {
            const errorMsg = 'Tu navegador no soporta reconocimiento de voz. Usa Chrome, Edge o Safari.'
            setError(errorMsg)
            onError?.(errorMsg)
            return
        }

        // Detener reconocimiento anterior si existe
        if (recognitionRef.current) {
            recognitionRef.current.abort()
        }

        setError(null)
        isStoppingRef.current = false

        try {
            const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
            if (!SpeechRecognitionAPI) {
                throw new Error('Speech Recognition API not available')
            }

            const recognition = new SpeechRecognitionAPI() as SpeechRecognition

            recognition.lang = lang
            recognition.continuous = continuous
            recognition.interimResults = interimResults
            recognition.maxAlternatives = 1

            recognition.onstart = () => {
                setIsListening(true)
                setError(null)
                vibrate(15) // Vibración corta al iniciar

                // Iniciar timer de silencio inicial (5 segundos)
                silenceTimerRef.current = setTimeout(() => {
                    setError('¿Estás ahí? Habla ahora para dictar tu observación...')
                }, 5000)
            }

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                // Cancelar timeout de silencio si recibimos resultados
                if (silenceTimerRef.current) {
                    clearTimeout(silenceTimerRef.current)
                    silenceTimerRef.current = null
                }

                let interimText = ''
                let finalText = ''

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i]
                    const text = result[0].transcript

                    if (result.isFinal) {
                        finalText += text
                    } else {
                        interimText += text
                    }
                }

                // Actualizar transcripción intermedia (lo que se está diciendo)
                setTranscript(interimText || finalText)

                // Si hay texto final, guardarlo y notificar
                if (finalText) {
                    setFinalTranscript(prev => {
                        const newTranscript = prev ? `${prev} ${finalText}` : finalText
                        return newTranscript.trim()
                    })
                    onTranscript?.(finalText.trim())

                    // Reiniciar timer de silencio para la siguiente frase
                    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
                    silenceTimerRef.current = setTimeout(() => {
                        setError('Sigo escuchando... puedes continuar dictando.')
                        setTimeout(() => setError(null), 3000) // Limpiar el "tip" después de 3s
                    }, 8000)
                }
            }

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                // Limpiar timers
                if (silenceTimerRef.current) {
                    clearTimeout(silenceTimerRef.current)
                    silenceTimerRef.current = null
                }

                // Ignorar errores si estamos deteniendo intencionalmente
                if (isStoppingRef.current && event.error === 'aborted') {
                    return
                }

                if (event.error === 'not-allowed') {
                    setIsPermissionDenied(true)
                }

                // En algunos navegadores (Safari/PWA), 'network' ocurre si el servicio se corta
                // Intentamos reiniciar una vez si fue por red o si se abortó inesperadamente
                if ((event.error === 'network' || event.error === 'aborted') && !isStoppingRef.current && retryCountRef.current < MAX_RETRIES) {
                    retryCountRef.current++
                    console.warn(`[SpeechToText] Error ${event.error}, reintentando (${retryCountRef.current}/${MAX_RETRIES})...`)
                    setTimeout(() => {
                        if (!isStoppingRef.current) {
                            recognition.start()
                        }
                    }, 500)
                    return
                }

                const errorMsg = getErrorMessage(event.error)
                setError(errorMsg)
                setIsListening(false)
                onError?.(errorMsg)
                vibrate([30, 50, 30]) // Patrón de error
            }

            recognition.onend = () => {
                if (silenceTimerRef.current) {
                    clearTimeout(silenceTimerRef.current)
                    silenceTimerRef.current = null
                }

                // Si continuous es true y no detuvimos manualmente, intentamos reiniciar
                // Esto es crucial para PWA y Safari donde el tiempo de silencio es muy agresivo
                if (continuous && !isStoppingRef.current && retryCountRef.current < MAX_RETRIES) {
                    try {
                        recognition.start()
                        return
                    } catch (e) {
                        console.error('[SpeechToText] Error al reiniciar reconocimiento:', e)
                    }
                }

                setIsListening(false)
                setTranscript('')
                if (isStoppingRef.current) {
                    vibrate(10) // Confirmación de apagado manual
                }
            }

            recognitionRef.current = recognition
            recognition.start()

        } catch (e) {
            console.error('[SpeechToText] Catch error:', e)
            const errorMsg = 'Error al iniciar reconocimiento de voz'
            setError(errorMsg)
            setIsListening(false)
            onError?.(errorMsg)
        }
    }, [isSupported, lang, continuous, interimResults, onTranscript, onError, getErrorMessage, vibrate])

    const stopListening = useCallback(() => {
        isStoppingRef.current = true
        retryCountRef.current = 0

        // Limpiar timers de sugerencias
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current)
            silenceTimerRef.current = null
        }

        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop()
            } catch {
                // Ignorar errores al detener
            }
        }

        setIsListening(false)
        setTranscript('')
        setError(null) // Limpiar cualquier mensaje de sugerencia o error previo
    }, [])

    const toggleListening = useCallback(() => {
        if (isListening) {
            stopListening()
        } else {
            startListening()
        }
    }, [isListening, startListening, stopListening])

    const clearTranscript = useCallback(() => {
        setTranscript('')
        setFinalTranscript('')
    }, [])

    return {
        isListening,
        isSupported,
        isPermissionDenied,
        transcript,
        finalTranscript,
        error,
        startListening,
        stopListening,
        toggleListening,
        clearTranscript,
    }
}
