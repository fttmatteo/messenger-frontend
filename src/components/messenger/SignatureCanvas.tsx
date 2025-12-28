import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { Button } from '@/components/ui/button'
import { Eraser, Check } from 'lucide-react'

interface SignatureCanvasProps {
    onSignatureChange?: (hasSignature: boolean) => void
    width?: number
    height?: number
}

export interface SignatureCanvasRef {
    clear: () => void
    getSignature: () => Promise<File | null>
    hasSignature: () => boolean
}

export const SignatureCanvas = forwardRef<SignatureCanvasRef, SignatureCanvasProps>(
    ({ onSignatureChange, width = 300, height = 150 }, ref) => {
        const canvasRef = useRef<HTMLCanvasElement>(null)
        const isDrawingRef = useRef(false)
        const [hasDrawn, setHasDrawn] = useState(false)

        // Setup canvas context
        useEffect(() => {
            const canvas = canvasRef.current
            if (!canvas) return

            const ctx = canvas.getContext('2d')
            if (!ctx) return

            // Set canvas size for retina displays
            const dpr = window.devicePixelRatio || 1
            canvas.width = width * dpr
            canvas.height = height * dpr
            canvas.style.width = `${width}px`
            canvas.style.height = `${height}px`
            ctx.scale(dpr, dpr)

            // Set drawing styles
            ctx.strokeStyle = '#000000'
            ctx.lineWidth = 2
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'

            // Fill with white background
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, width, height)
        }, [width, height])

        // Helper to get coordinates from both Touch and Mouse events
        const getCoordinates = (e: TouchEvent | MouseEvent | React.TouchEvent | React.MouseEvent): { x: number; y: number } | null => {
            const canvas = canvasRef.current
            if (!canvas) return null

            const rect = canvas.getBoundingClientRect()

            // Check for touch events (native or React)
            if ('touches' in e) {
                const touches = e.touches
                if (touches && touches.length > 0) {
                    return {
                        x: touches[0].clientX - rect.left,
                        y: touches[0].clientY - rect.top
                    }
                }
            } else if ('clientX' in e) {
                // Mouse event
                return {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                }
            }
            return null
        }

        const startDrawing = (e: TouchEvent | MouseEvent | React.TouchEvent | React.MouseEvent) => {
            // Only prevent default for touch to avoid scrolling
            if ('touches' in e && e.cancelable) {
                e.preventDefault()
            }

            const coords = getCoordinates(e)
            if (!coords) return

            const ctx = canvasRef.current?.getContext('2d')
            if (!ctx) return

            isDrawingRef.current = true
            ctx.beginPath()
            ctx.moveTo(coords.x, coords.y)
        }

        const draw = (e: TouchEvent | MouseEvent | React.TouchEvent | React.MouseEvent) => {
            if (!isDrawingRef.current) return

            // Only prevent default for touch to avoid scrolling
            if ('touches' in e && e.cancelable) {
                e.preventDefault()
            }

            const coords = getCoordinates(e)
            if (!coords) return

            const ctx = canvasRef.current?.getContext('2d')
            if (!ctx) return

            ctx.lineTo(coords.x, coords.y)
            ctx.stroke()

            if (!hasDrawn) {
                setHasDrawn(true)
                onSignatureChange?.(true)
            }
        }

        const stopDrawing = () => {
            isDrawingRef.current = false
        }

        const clear = () => {
            const canvas = canvasRef.current
            const ctx = canvas?.getContext('2d')
            if (!canvas || !ctx) return

            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, width, height)
            setHasDrawn(false)
            onSignatureChange?.(false)
        }

        // Attach native touch listeners with non-passive flag
        useEffect(() => {
            const canvas = canvasRef.current
            if (!canvas) return

            const handleTouchStart = (e: TouchEvent) => startDrawing(e)
            const handleTouchMove = (e: TouchEvent) => draw(e)
            const handleTouchEnd = () => stopDrawing()

            canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
            canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
            canvas.addEventListener('touchend', handleTouchEnd)

            return () => {
                canvas.removeEventListener('touchstart', handleTouchStart)
                canvas.removeEventListener('touchmove', handleTouchMove)
                canvas.removeEventListener('touchend', handleTouchEnd)
            }
        }) // No deps: re-bind on every render to capture latest scope (safe for this simpler refactor)

        const getSignature = async (): Promise<File | null> => {
            const canvas = canvasRef.current
            if (!canvas || !hasDrawn) return null

            return new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], `firma_${Date.now()}.png`, { type: 'image/png' })
                        resolve(file)
                    } else {
                        resolve(null)
                    }
                }, 'image/png')
            })
        }

        // Expose methods via ref
        useImperativeHandle(ref, () => ({
            clear,
            getSignature,
            hasSignature: () => hasDrawn
        }))

        return (
            <div className="space-y-2">
                <div className="relative border-2 border-dashed border-muted-foreground/30 rounded-lg overflow-hidden bg-white">
                    <canvas
                        ref={canvasRef}
                        className="touch-none cursor-crosshair"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                    // Touch events handled by effect
                    />

                    {/* Signature line */}
                    <div className="absolute bottom-4 left-4 right-4 border-b border-gray-300" />

                    {/* Placeholder text */}
                    {!hasDrawn && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-muted-foreground/50 text-sm">Firme aquí</span>
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clear}
                        disabled={!hasDrawn}
                        className="flex-1"
                    >
                        <Eraser className="h-4 w-4 mr-1" />
                        Limpiar
                    </Button>
                    {hasDrawn && (
                        <div className="flex items-center gap-1 text-green-600 text-sm">
                            <Check className="h-4 w-4" />
                            Firmado
                        </div>
                    )}
                </div>
            </div>
        )
    }
)

SignatureCanvas.displayName = 'SignatureCanvas'
