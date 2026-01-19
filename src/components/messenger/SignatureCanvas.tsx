import { useRef, useEffect, useState, forwardRef, useImperativeHandle, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Eraser, Check, PenLine, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import SignatureCameraCapture, { type SignatureCameraCaptureRef } from './SignatureCameraCapture'
import { createLogger } from '@/utils/logger'

const logger = createLogger('SignatureCanvas')


interface SignatureCanvasProps {
    onSignatureChange?: (hasSignature: boolean) => void
    onGifGenerated?: (gif: Blob | null) => void
    enableCamera?: boolean
    width?: number
    height?: number
}

export interface SignatureCanvasRef {
    clear: () => void
    getSignature: () => Promise<File | null>
    getGifFile: () => Promise<File | null>
    hasSignature: () => boolean
    hasGif: () => boolean
}

export const SignatureCanvas = forwardRef<SignatureCanvasRef, SignatureCanvasProps>(
    ({ onSignatureChange, onGifGenerated, enableCamera = false, width = 300, height = 150 }, ref) => {
        const savedCanvasRef = useRef<HTMLCanvasElement>(null)
        const fullscreenCanvasRef = useRef<HTMLCanvasElement>(null)
        const cameraRef = useRef<SignatureCameraCaptureRef>(null)
        const [hasDrawn, setHasDrawn] = useState(false)
        const [isOpen, setIsOpen] = useState(false)
        const [tempHasDrawn, setTempHasDrawn] = useState(false)
        const isDrawingRef = useRef(false)
        const canvasInitializedRef = useRef(false)
        const [savedGifBlob, setSavedGifBlob] = useState<Blob | null>(null)


        useEffect(() => {
            const canvas = savedCanvasRef.current
            if (!canvas) return
            const ctx = canvas.getContext('2d')
            if (!ctx) return

            const dpr = window.devicePixelRatio || 1
            canvas.width = width * dpr
            canvas.height = height * dpr
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
        }, [width, height])

        const initFullscreenCanvas = useCallback(() => {
            const canvas = fullscreenCanvasRef.current
            if (!canvas || canvasInitializedRef.current) return

            const container = canvas.parentElement
            if (!container) return

            const w = container.clientWidth
            const h = container.clientHeight

            if (w === 0 || h === 0) return

            const dpr = window.devicePixelRatio || 1
            canvas.width = w * dpr
            canvas.height = h * dpr
            canvas.style.width = `${w}px`
            canvas.style.height = `${h}px`

            const ctx = canvas.getContext('2d')
            if (!ctx) return

            ctx.scale(dpr, dpr)
            ctx.strokeStyle = '#000000'
            ctx.lineWidth = 3
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, w, h)

            canvasInitializedRef.current = true
            setTempHasDrawn(false)
        }, [])

        useEffect(() => {
            if (!isOpen) {
                canvasInitializedRef.current = false
                return
            }

            const attempts = [50, 150, 300]
            const timers = attempts.map(delay =>
                setTimeout(initFullscreenCanvas, delay)
            )

            return () => timers.forEach(t => clearTimeout(t))
        }, [isOpen, initFullscreenCanvas])

        const getCoords = useCallback((e: React.TouchEvent | React.MouseEvent) => {
            const canvas = fullscreenCanvasRef.current
            if (!canvas) return null
            const rect = canvas.getBoundingClientRect()

            if ('touches' in e && e.touches.length > 0) {
                return {
                    x: e.touches[0].clientX - rect.left,
                    y: e.touches[0].clientY - rect.top
                }
            } else if ('clientX' in e) {
                return {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                }
            }
            return null
        }, [])

        const handleStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
            const coords = getCoords(e)
            if (!coords) return

            const canvas = fullscreenCanvasRef.current
            const ctx = canvas?.getContext('2d')
            if (!ctx) return

            isDrawingRef.current = true
            ctx.beginPath()
            ctx.moveTo(coords.x, coords.y)
        }, [getCoords])

        const handleMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
            if (!isDrawingRef.current) return

            const coords = getCoords(e)
            if (!coords) return

            const canvas = fullscreenCanvasRef.current
            const ctx = canvas?.getContext('2d')
            if (!ctx) return

            ctx.lineTo(coords.x, coords.y)
            ctx.stroke()

            if (!tempHasDrawn) {
                setTempHasDrawn(true)
            }
        }, [getCoords, tempHasDrawn])

        const handleEnd = useCallback(() => {
            isDrawingRef.current = false
        }, [])

        const clearFullscreen = () => {
            const canvas = fullscreenCanvasRef.current
            if (!canvas) return
            const ctx = canvas.getContext('2d')
            if (!ctx) return

            const dpr = window.devicePixelRatio || 1
            ctx.setTransform(1, 0, 0, 1, 0, 0)
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.scale(dpr, dpr)
            ctx.strokeStyle = '#000000'
            ctx.lineWidth = 3
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'

            setTempHasDrawn(false)
        }

        const confirmSignature = () => {
            const fullCanvas = fullscreenCanvasRef.current
            const savedCanvas = savedCanvasRef.current
            if (!fullCanvas || !savedCanvas) return

            const savedCtx = savedCanvas.getContext('2d')
            if (!savedCtx) return

            savedCtx.setTransform(1, 0, 0, 1, 0, 0)
            savedCtx.drawImage(
                fullCanvas,
                0, 0, fullCanvas.width, fullCanvas.height,
                0, 0, savedCanvas.width, savedCanvas.height
            )

            setHasDrawn(true)
            onSignatureChange?.(true)
            setIsOpen(false)
        }

        const clear = () => {
            const canvas = savedCanvasRef.current
            if (!canvas) return
            const ctx = canvas.getContext('2d')
            if (!ctx) return
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            setHasDrawn(false)
            onSignatureChange?.(false)
        }

        const getSignature = async (): Promise<File | null> => {
            const canvas = savedCanvasRef.current
            if (!canvas || !hasDrawn) return null

            return new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(new File([blob], `firma_${Date.now()}.png`, { type: 'image/png' }))
                    } else {
                        resolve(null)
                    }
                }, 'image/png')
            })
        }

        useImperativeHandle(ref, () => ({
            clear,
            getSignature,
            getGifFile: async () => {
                // First try saved blob, then fallback to camera ref
                const blob = savedGifBlob ?? await cameraRef.current?.getGif()
                if (!blob) {
                    logger.warn('getGifFile return null', { hasSavedBlob: !!savedGifBlob })
                    return null
                }
                return new File([blob], `captura_${Date.now()}.gif`, { type: 'image/gif' })
            },
            hasSignature: () => hasDrawn,
            hasGif: () => savedGifBlob !== null || (cameraRef.current?.isReady() ?? false)
        }), [savedGifBlob, hasDrawn, clear, getSignature])

        return (
            <>
                <canvas ref={savedCanvasRef} className="hidden" />

                <div className="space-y-2">
                    {hasDrawn ? (
                        <div className="flex items-center justify-between p-3 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900">
                            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                <Check className="h-5 w-5" />
                                <span className="font-medium">Firma capturada</span>
                            </div>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(true)}>
                                    Cambiar
                                </Button>
                                <Button type="button" variant="ghost" size="sm" onClick={clear} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-20 border-dashed border-2 flex flex-col gap-1"
                            onClick={() => setIsOpen(true)}
                        >
                            <PenLine className="h-6 w-6 text-muted-foreground" />
                            <span className="text-muted-foreground">Toca para firmar</span>
                        </Button>
                    )}
                </div>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogContent
                        className="max-w-[100vw] w-screen h-[100dvh] max-h-[100dvh] p-4 flex flex-col gap-3 sm:gap-4 rounded-none"
                        aria-describedby={undefined}
                    >
                        <DialogHeader className="flex-shrink-0">
                            <DialogTitle className="text-lg sm:text-xl">Firma del asesor</DialogTitle>
                            <VisuallyHidden>
                                <DialogDescription>Dibuje su firma en el área de abajo</DialogDescription>
                            </VisuallyHidden>
                        </DialogHeader>

                        <div className={`flex-1 flex gap-3 min-h-0 flex-col`}>
                            {/* Camera preview - 30% height */}
                            {enableCamera && (
                                <div className="flex-[3] min-h-0">
                                    <SignatureCameraCapture
                                        ref={cameraRef}
                                        onGifGenerated={(gif) => {
                                            logger.info('onGifGenerated received', { size: gif?.size })
                                            setSavedGifBlob(gif)
                                            onGifGenerated?.(gif)
                                        }}
                                        className="h-full"
                                    />
                                </div>
                            )}

                            {/* Signature canvas - 70% height */}
                            <div className={`relative border-2 border-dashed border-muted-foreground/30 rounded-lg overflow-hidden bg-white min-h-0 ${enableCamera ? 'flex-[7]' : 'flex-1'}`}>
                                <canvas
                                    ref={fullscreenCanvasRef}
                                    className="touch-none cursor-crosshair absolute inset-0 w-full h-full"
                                    onMouseDown={handleStart}
                                    onMouseMove={handleMove}
                                    onMouseUp={handleEnd}
                                    onMouseLeave={handleEnd}
                                    onTouchStart={handleStart}
                                    onTouchMove={handleMove}
                                    onTouchEnd={handleEnd}
                                />
                                <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-8 right-6 sm:right-8 border-b-2 border-gray-300 pointer-events-none" />
                                {!tempHasDrawn && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="text-muted-foreground/40 text-base sm:text-xl">Firme aquí</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 flex-shrink-0">
                            <Button variant="outline" onClick={clearFullscreen} className="flex-1 h-11 sm:h-12 text-sm sm:text-base">
                                <Eraser className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                Limpiar
                            </Button>
                            <Button onClick={confirmSignature} className="flex-1 h-11 sm:h-12 text-sm sm:text-base" disabled={!tempHasDrawn}>
                                <Check className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                Confirmar firma
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </>
        )
    }
)

SignatureCanvas.displayName = 'SignatureCanvas'
