import { cn } from '@/lib/utils'

interface PlacaBadgeProps {
    plateNumber: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    className?: string
}

/**
 * Insignia visual que representa una placa de vehículo según el estándar colombiano.
 * Soporta diferentes tamaños, tipos de vehículo (carro/moto) y modo oscuro.
 */
export function PlacaBadge({
    plateNumber,
    size = 'md',
    className
}: PlacaBadgeProps) {
    const formatPlate = (plate: string) => {
        return plate.toUpperCase().replace(/[^A-Z0-9]/g, '')
    }

    const formattedChasis = formatPlate(plateNumber)

    const sizeClasses = {
        sm: 'text-xs px-1.5 py-0.5 rounded',
        md: 'text-sm px-2.5 py-1 rounded-md',
        lg: 'text-lg px-3.5 py-1.5 rounded-lg',
        xl: 'text-xl px-4 py-2 rounded-lg',
    }

    return (
        <span
            className={cn(
                "inline-flex items-center font-bold tracking-tight border-2 shadow-sm",
                "bg-black text-white border-black",
                "dark:bg-white dark:text-black dark:border-white",
                sizeClasses[size],
                className
            )}
            title={`Chasis ${plateNumber}`}
        >
            <span className="font-mono font-black break-all">
                {formattedChasis}
            </span>
        </span>
    )
}

