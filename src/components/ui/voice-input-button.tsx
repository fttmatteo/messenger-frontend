import { useCallback, useState } from 'react'
import { Mic, MicOff, Loader2, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useAudioRecorder } from '@/hooks/use-audio-recorder'
import { useTranscription } from '@/hooks/use-transcription'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { showToast } from '@/config/toast-config'

export interface VoiceInputButtonProps {
    /** Callback cuando se obtiene texto transcrito */
    onTranscript: (text: string) => void
    /** Si el botón está deshabilitado */
    disabled?: boolean
    /** Clases adicionales para el botón */
    className?: string
    /** Tamaño del botón */
    size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg'
}

/**
 * Botón de entrada de voz que graba audio y lo transcribe
 * usando Google Cloud Speech-to-Text API.
 * 
 * Modo Toggle: 
 * - Primer clic: Inicia grabación
 * - Segundo clic: Detiene y transcribe
 */
export function VoiceInputButton({
    onTranscript,
    disabled = false,
    className,
    size = 'icon',
}: VoiceInputButtonProps) {
    const { isRecording, isSupported, startRecording, stopRecording, error: recorderError } = useAudioRecorder()
    const { transcribe, isTranscribing, error: transcriptionError } = useTranscription()
    const [statusMessage, setStatusMessage] = useState<string | null>(null)

    const error = recorderError || transcriptionError

    const handleToggle = useCallback(async () => {
        if (isRecording) {
            // Detener grabación y transcribir
            setStatusMessage('Transcribiendo...')
            const audioBlob = await stopRecording()

            if (audioBlob && audioBlob.size > 0) {
                const transcript = await transcribe(audioBlob)

                if (transcript) {
                    // Formatear: Capitalizar primera letra
                    const formattedText = transcript.trim().charAt(0).toUpperCase() + transcript.trim().slice(1)
                    onTranscript(formattedText)
                    setStatusMessage(null)
                } else {
                    setStatusMessage(null)
                    showToast.error('Error', {
                        description: transcriptionError || 'No se pudo transcribir el audio',
                        duration: 4000,
                    })
                }
            } else {
                setStatusMessage(null)
            }
        } else {
            // Iniciar grabación
            setStatusMessage(null)
            await startRecording()
        }
    }, [isRecording, stopRecording, startRecording, transcribe, onTranscript, transcriptionError])

    // Si no está soportado (no hay MediaRecorder), mostrar botón deshabilitado
    if (!isSupported) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            size={size}
                            disabled
                            className={cn('opacity-50 cursor-not-allowed', className)}
                        >
                            <MicOff className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Tu navegador no soporta grabación de audio</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    const isProcessing = isTranscribing
    const showRecordingIndicator = isRecording || isProcessing

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="relative">
                        <Button
                            type="button"
                            variant={isRecording ? 'destructive' : 'outline'}
                            size={size}
                            disabled={disabled || isProcessing}
                            onClick={handleToggle}
                            className={cn(
                                'relative transition-all duration-200',
                                isRecording && 'ring-2 ring-red-500/50 ring-offset-2 ring-offset-background',
                                className
                            )}
                            aria-label={isRecording ? 'Detener grabación' : 'Iniciar grabación de voz'}
                        >
                            <AnimatePresence mode="wait">
                                {isProcessing ? (
                                    <motion.div
                                        key="processing"
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    </motion.div>
                                ) : isRecording ? (
                                    <motion.div
                                        key="recording"
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <MicOff className="h-4 w-4" />
                                    </motion.div>
                                ) : error ? (
                                    <motion.div
                                        key="error"
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <AlertCircle className="h-4 w-4 text-amber-500" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="idle"
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <Mic className="h-4 w-4" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Button>
                    </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                    <p>
                        {isProcessing
                            ? 'Transcribiendo...'
                            : isRecording
                                ? 'Toca para detener'
                                : 'Dictar por voz'}
                    </p>
                </TooltipContent>
            </Tooltip>

            {/* Indicador flotante de estado */}
            <AnimatePresence>
                {showRecordingIndicator && (
                    <motion.div
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 0 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className={cn(
                            "z-50 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg transition-all duration-200",
                            "fixed bottom-[calc(6rem+var(--safe-area-bottom))] left-4 right-4 max-w-[90vw] mx-auto sm:static",
                            "sm:absolute sm:bottom-full sm:mb-2 sm:left-0 sm:right-0 sm:w-auto sm:min-w-[200px]"
                        )}
                    >
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin text-primary" />
                            <span className="italic truncate">
                                {statusMessage || (isRecording ? 'Grabando...' : 'Procesando...')}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </TooltipProvider>
    )
}
