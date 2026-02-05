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
    const [transcript, setTranscript] = useState('')
    const [finalTranscript, setFinalTranscript] = useState('')
    const [error, setError] = useState<string | null>(null)

    const recognitionRef = useRef<SpeechRecognition | null>(null)
    const isStoppingRef = useRef(false)

    // Verificar soporte del navegador
    const isSupported = typeof window !== 'undefined' &&
        !!(window.SpeechRecognition || window.webkitSpeechRecognition)

    // Limpiar al desmontar
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort()
                recognitionRef.current = null
            }
        }
    }, [])

    const getErrorMessage = useCallback((errorCode: string): string => {
        const errorMessages: Record<string, string> = {
            'no-speech': 'No se detectó voz. Intenta hablar más cerca del micrófono.',
            'audio-capture': 'No se pudo acceder al micrófono. Verifica los permisos.',
            'not-allowed': 'Permiso de micrófono denegado. Habilita el acceso al micrófono.',
            'network': 'Error de red. Verifica tu conexión a internet.',
            'aborted': 'Reconocimiento cancelado.',
            'service-not-allowed': 'Servicio de reconocimiento no permitido.',
            'language-not-supported': 'Idioma no soportado.',
            'bad-grammar': 'Error de gramática en el reconocimiento.',
        }
        return errorMessages[errorCode] || `Error de reconocimiento: ${errorCode}`
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
            }

            recognition.onresult = (event: SpeechRecognitionEvent) => {
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
                }
            }

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                // Ignorar errores si estamos deteniendo intencionalmente
                if (isStoppingRef.current && event.error === 'aborted') {
                    return
                }

                const errorMsg = getErrorMessage(event.error)
                setError(errorMsg)
                setIsListening(false)
                onError?.(errorMsg)
            }

            recognition.onend = () => {
                setIsListening(false)
                // Limpiar transcripción intermedia al finalizar
                setTranscript('')
            }

            recognition.onspeechend = () => {
                // La detección de voz terminó, pero onend manejará el estado
            }

            recognitionRef.current = recognition
            recognition.start()

        } catch (err) {
            const errorMsg = 'Error al iniciar reconocimiento de voz'
            setError(errorMsg)
            setIsListening(false)
            onError?.(errorMsg)
        }
    }, [isSupported, lang, continuous, interimResults, onTranscript, onError, getErrorMessage])

    const stopListening = useCallback(() => {
        isStoppingRef.current = true

        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop()
            } catch {
                // Ignorar errores al detener
            }
        }

        setIsListening(false)
        setTranscript('')
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
        transcript,
        finalTranscript,
        error,
        startListening,
        stopListening,
        toggleListening,
        clearTranscript,
    }
}
