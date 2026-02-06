import { useCallback } from 'react'
import { Mic, MicOff, Loader2, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useSpeechToText, type UseSpeechToTextOptions } from '@/hooks/use-speech-to-text'
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
    /** Idioma para el reconocimiento (default: 'es-CO') */
    lang?: string
    /** Tamaño del botón */
    size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg'
}

/**
 * Botón de entrada de voz que utiliza la Web Speech API
 * para transcribir voz a texto.
 * 
 * @example
 * ```tsx
 * <div className="flex gap-2">
 *     <Textarea value={text} onChange={e => setText(e.target.value)} />
 *     <VoiceInputButton 
 *         onTranscript={(t) => setText(prev => prev + ' ' + t)} 
 *     />
 * </div>
 * ```
 */
export function VoiceInputButton({
    onTranscript,
    disabled = false,
    className,
    lang = 'es-CO',
    size = 'icon',
}: VoiceInputButtonProps) {
    const handleTranscript = useCallback((text: string) => {
        if (!text) return

        // Formatear el texto: Capitalizar primera letra y limpiar espacios
        const formattedText = text.trim().charAt(0).toUpperCase() + text.trim().slice(1)
        onTranscript(formattedText)
    }, [onTranscript])

    const handleError = useCallback((error: string) => {
        showToast.error('Error de voz', {
            description: error,
            duration: 4000,
        })
    }, [])

    const {
        isListening,
        isSupported,
        isPermissionDenied,
        transcript,
        error,
        toggleListening,
    } = useSpeechToText({
        lang,
        continuous: true,
        interimResults: true,
        onTranscript: handleTranscript,
        onError: handleError,
    } as UseSpeechToTextOptions)


    // Si no está soportado, no mostrar el botón
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
                        <p>Tu navegador no soporta entrada de voz</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="relative">
                        <Button
                            type="button"
                            variant={isListening ? 'destructive' : 'outline'}
                            size={size}
                            disabled={disabled}
                            onClick={toggleListening}
                            className={cn(
                                'relative transition-all duration-200',
                                isListening && 'ring-2 ring-red-500/50 ring-offset-2 ring-offset-background',
                                className
                            )}
                            aria-label={isListening ? 'Detener dictado' : 'Iniciar dictado por voz'}
                        >
                            <AnimatePresence mode="wait">
                                {isListening ? (
                                    <motion.div
                                        key="listening"
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
                        {isPermissionDenied
                            ? 'Permiso de micrófono denegado'
                            : isListening
                                ? 'Toca para detener'
                                : 'Dictar por voz'}
                    </p>
                </TooltipContent>
            </Tooltip>

            {/* Indicador flotante de transcripción en progreso */}
            <AnimatePresence>
                {isListening && transcript && (
                    <motion.div
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 0 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className={cn(
                            "z-50 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-2 shadow-lg transition-all duration-200",
                            "fixed bottom-24 left-4 right-4 max-w-[90vw] mx-auto sm:static",
                            "sm:absolute sm:bottom-full sm:mb-2 sm:left-0 sm:right-0 sm:w-auto sm:min-w-[200px]"
                        )}
                    >
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin text-primary" />
                            <span className="italic truncate">{transcript}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </TooltipProvider>
    )
}
