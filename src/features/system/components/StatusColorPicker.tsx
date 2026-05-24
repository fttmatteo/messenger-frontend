import { useRef } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { DEFAULT_STATUS_COLORS, getStatusLabel } from '@/shared/lib/status-colors'
import { RotateCcw } from 'lucide-react'

interface StatusColorPickerProps {
    status: string
    color: string
    onColorChange: (status: string, color: string) => void
}

/**
 * Componente para seleccionar y personalizar el color asociado a un estado de servicio.
 * Permite cambiar el color individualmente y restaurar el valor por defecto.
 */
export function StatusColorPicker({ status, color, onColorChange }: StatusColorPickerProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const defaultColor = DEFAULT_STATUS_COLORS[status]
    const isModified = color !== defaultColor

    const handleCardClick = () => {
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
                <div className="relative">
                    <div
                        className="w-12 h-12 rounded-full shadow-md shrink-0 transition-transform group-hover:scale-110"
                        style={{ backgroundColor: color }}
                    />
                    <input
                        ref={inputRef}
                        type="color"
                        value={color.length > 7 ? color.slice(0, 7) : color}
                        onChange={(e) => onColorChange(status, e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        aria-label={`Seleccionar color para ${getStatusLabel(status)}`}
                    />


                    {isModified && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute inset-0 m-auto h-10 w-10 rounded-full z-10 opacity-0 group-hover:opacity-30 hover:!opacity-100 transition-all text-white bg-black/20 backdrop-blur-[1px] hover:bg-black/40 border-none"
                            onClick={handleReset}
                            title="Restaurar color por defecto"
                        >
                            <RotateCcw className="h-6 w-6" />
                        </Button>
                    )}
                </div>


                <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">
                        {getStatusLabel(status)}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono uppercase">
                        {color}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
