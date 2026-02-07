import { useCallback, useState } from 'react'

interface TranscriptionResponse {
    transcript: string
    language: string | null
    success: boolean
}

interface UseTranscriptionReturn {
    transcribe: (audioBlob: Blob) => Promise<string | null>
    isTranscribing: boolean
    error: string | null
}

/**
 * Hook para enviar audio al backend y obtener transcripción.
 */
export function useTranscription(): UseTranscriptionReturn {
    const [isTranscribing, setIsTranscribing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const transcribe = useCallback(async (audioBlob: Blob): Promise<string | null> => {
        setIsTranscribing(true)
        setError(null)

        // Timeout de 30 segundos
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000)

        try {
            const formData = new FormData()
            formData.append('audio', audioBlob, 'recording.webm')

            // Obtener token de autenticación
            const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
            if (!token) {
                throw new Error('No hay sesión activa')
            }

            const response = await fetch('/api/transcribe', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
                signal: controller.signal
            })

            clearTimeout(timeoutId)

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Sesión expirada. Inicia sesión nuevamente.')
                }
                if (response.status === 413) {
                    throw new Error('El audio es demasiado largo. Intenta con una grabación más corta.')
                }
                if (response.status >= 500) {
                    throw new Error('Error del servidor. Intenta de nuevo en unos segundos.')
                }
                throw new Error(`Error del servidor: ${response.status}`)
            }

            const data: TranscriptionResponse = await response.json()

            if (!data.success) {
                setError(data.transcript)
                return null
            }

            return data.transcript

        } catch (err) {
            clearTimeout(timeoutId)

            let message = 'Error al transcribir audio'

            if (err instanceof Error) {
                if (err.name === 'AbortError') {
                    message = 'La transcripción tardó demasiado. Intenta con un audio más corto.'
                } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
                    message = 'Sin conexión a internet. Verifica tu conexión e intenta de nuevo.'
                } else {
                    message = err.message
                }
            }

            setError(message)
            console.error('Transcription error:', err)
            return null
        } finally {
            setIsTranscribing(false)
        }
    }, [])

    return {
        transcribe,
        isTranscribing,
        error
    }
}
