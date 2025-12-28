import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DEFAULT_STATUS_COLORS, getStatusLabel } from '@/lib/status-colors'
import { RotateCcw } from 'lucide-react'

interface StatusColorPickerProps {
    status: string
    color: string
    onColorChange: (status: string, color: string) => void
}

export function StatusColorPicker({ status, color, onColorChange }: StatusColorPickerProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const defaultColor = DEFAULT_STATUS_COLORS[status]
    const isModified = color !== defaultColor

    const handleCardClick = () => {
        // Directly open the native color picker
        inputRef.current?.click()
    }

    const handleReset = (e: React.MouseEvent) => {
        e.stopPropagation()
        onColorChange(status, defaultColor)
    }

    return (
        <Card
            className="cursor-pointer hover:bg-muted/50 transition-colors group relative"
            onClick={handleCardClick}
        >
            <CardContent className="p-4 flex items-center gap-4">
                {/* Color Preview Circle - contains the hidden input */}
                <div className="relative">
                    <div
                        className="w-10 h-10 rounded-full border-2 border-white shadow-md shrink-0 transition-transform group-hover:scale-110"
                        style={{ backgroundColor: color }}
                    />
                    {/* Color Input positioned over the circle */}
                    <input
                        ref={inputRef}
                        type="color"
                        value={color}
                        onChange={(e) => onColorChange(status, e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        aria-label={`Seleccionar color para ${getStatusLabel(status)}`}
                    />
                </div>

                {/* Status Info */}
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm" style={{ color }}>
                        {getStatusLabel(status)}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono uppercase">
                        {color}
                    </p>
                </div>

                {/* Reset Button (only shown if modified) */}
                {isModified && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={handleReset}
                        title="Restaurar color por defecto"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
