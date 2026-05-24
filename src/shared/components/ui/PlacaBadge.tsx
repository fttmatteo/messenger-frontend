import { cn } from '@/shared/lib/utils'

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
    const len = formattedChasis.length
    const firstPart = len > 4 ? formattedChasis.slice(0, len - 4) : ""
    const lastFour = len > 4 ? formattedChasis.slice(len - 4) : formattedChasis

    const sizeClasses = {
        sm: 'text-[11px] px-1.5 py-0.5 rounded',
        md: 'text-xs px-2 py-0.5 rounded-md',
        lg: 'text-sm px-2.5 py-1 rounded-md',
        xl: 'text-base px-3 py-1.5 rounded-lg',
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
            <span className="font-sans font-black break-all flex items-baseline leading-none">
                {firstPart && <span>{firstPart}</span>}
                <span className="text-[1.25em] ml-0.5">
                    {lastFour}
                </span>
            </span>
        </span>
    )
}

