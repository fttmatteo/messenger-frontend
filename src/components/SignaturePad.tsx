import { useRef, useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Eraser } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SignaturePadProps {
    onChange: (file: File | null) => void
    width?: number
    height?: number
    className?: string
    showClearButton?: boolean
    onClear?: () => void
}

export function SignaturePad({
    onChange,
    width = 400,
    height = 200,
    className,
    showClearButton = true,
    onClear
}: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [isEmpty, setIsEmpty] = useState(true)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        canvas.width = width
        canvas.height = height

        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
    }, [width, height])

    const getCoordinates = useCallback((e: React.TouchEvent | React.MouseEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return { x: 0, y: 0 }

        const rect = canvas.getBoundingClientRect()
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height

        if ('touches' in e) {
            const touch = e.touches[0]
            return {
                x: (touch.clientX - rect.left) * scaleX,
                y: (touch.clientY - rect.top) * scaleY
            }
        } else {
            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY
            }
        }
    }, [])

    const startDrawing = useCallback((e: React.TouchEvent | React.MouseEvent) => {
        if (e.cancelable) e.preventDefault()
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!ctx) return

        const { x, y } = getCoordinates(e)
        ctx.beginPath()
        ctx.moveTo(x, y)
        setIsDrawing(true)
        setIsEmpty(false)
    }, [getCoordinates])

    const draw = useCallback((e: React.TouchEvent | React.MouseEvent) => {
        if (e.cancelable) e.preventDefault()
        if (!isDrawing) return

        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!ctx) return

        const { x, y } = getCoordinates(e)
        ctx.lineTo(x, y)
        ctx.stroke()
    }, [isDrawing, getCoordinates])

    const generateFile = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `signature_${Date.now()}.png`, { type: 'image/png' })
                onChange(file)
            }
        }, 'image/png')
    }, [onChange])

    const stopDrawing = useCallback(() => {
        if (isDrawing) {
            setIsDrawing(false)
            generateFile()
        }
    }, [isDrawing, generateFile])

    const clearCanvas = useCallback(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!ctx || !canvas) return

        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        setIsEmpty(true)
        onChange(null)
        onClear?.()
    }, [onChange, onClear])

    return (
        <div className={cn("space-y-3", className)}>
            <div className="relative border-2 border-dashed rounded-lg overflow-hidden bg-white">
                <canvas
                    ref={canvasRef}
                    className="w-full touch-none cursor-crosshair"
                    style={{ aspectRatio: `${width}/${height}` }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
                {isEmpty && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-muted-foreground text-sm">
                            Firma aquí con tu dedo
                        </p>
                    </div>
                )}
            </div>

            {showClearButton && (
                <div className="flex justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={clearCanvas}
                        disabled={isEmpty}
                        size="sm"
                    >
                        <Eraser className="mr-2 h-4 w-4" />
                        Limpiar firma
                    </Button>
                </div>
            )}
        </div>
    )
}
